"""
Servicio de moderación de contenido con proveedores intercambiables.

Proveedores soportados (configurables vía MODERATION_PROVIDER):
  - MOCK            -> sin credenciales; deja el contenido en PENDING (modo seguro)
  - GOOGLE_VISION   -> Google Cloud Vision API (SafeSearch + OCR)
  - AWS_REKOGNITION -> AWS Rekognition (DetectModerationLabels + DetectText)
  - HF_NSFW         -> Hugging Face NSFW detector (inference API)
  - CLOUDINARY      -> Cloudinary AI Content Analysis

Respuesta estándar (dict):
  provider, score, labels, ocr_text, is_explicit, is_illegal,
  is_safe_for_minors, status (APPROVED|PENDING|BLOCKED), reason
"""
import json
import logging
from typing import Optional

from app.config import settings
from app.db.connection import fetch_one, execute_query

logger = logging.getLogger("nexus.moderation")

BLOCK_THRESHOLD = 0.85

REVIEW_THRESHOLD = 0.45

def _standard_result(provider: str, score: float | None, labels: list | None,
                     ocr_text: str | None, is_explicit: bool, is_illegal: bool,
                     is_safe_for_minors: bool, status: str, reason: str) -> dict:
    return {
        "provider": provider,
        "score": score,
        "labels": labels or [],
        "ocr_text": ocr_text,
        "is_explicit": is_explicit,
        "is_illegal": is_illegal,
        "is_safe_for_minors": is_safe_for_minors,
        "status": status,
        "reason": reason,
    }

def _moderate_mock(image_path: str) -> dict:
    """Modo seguro sin credenciales: nunca aprueba automáticamente.

    Todo contenido queda en PENDING para revisión manual del moderador,
    que es el comportamiento más conservador posible.
    """
    return _standard_result(
        provider="MOCK",
        score=None,
        labels=[],
        ocr_text=None,
        is_explicit=False,
        is_illegal=False,
        is_safe_for_minors=True,
        status="PENDING",
        reason="Sin proveedor de IA configurado: requiere revisión manual del moderador.",
    )

def _moderate_google_vision(image_path: str) -> dict:
    """Google Cloud Vision: SafeSearch + OCR (TEXT_DETECTION)."""
    from google.cloud import vision

    client = vision.ImageAnnotatorClient()
    with open(image_path, "rb") as f:
        image = vision.Image(content=f.read())

    safe = client.safe_search_detection(image=image).safe_search_annotation
    ocr = client.text_detection(image=image)
    ocr_text = ocr.text_annotations[0].description if ocr.text_annotations else None

    levels = {0: 0.0, 1: 0.0, 2: 0.25, 3: 0.5, 4: 0.75, 5: 1.0}
    adult = levels[safe.adult]
    violence = levels[safe.violence]
    racy = levels[safe.racy]
    score = max(adult, violence, racy)

    labels = [
        {"label": "adult", "score": adult},
        {"label": "violence", "score": violence},
        {"label": "racy", "score": racy},
    ]
    is_explicit = adult >= REVIEW_THRESHOLD or racy >= BLOCK_THRESHOLD
    is_illegal = violence >= BLOCK_THRESHOLD
    is_safe_for_minors = score < REVIEW_THRESHOLD

    if score >= BLOCK_THRESHOLD:
        status, reason = "BLOCKED", "Contenido explícito detectado por Google Vision."
    elif score >= REVIEW_THRESHOLD:
        status, reason = "PENDING", "Posible contenido sensible: requiere revisión manual."
    else:
        status, reason = "APPROVED", "Contenido validado automáticamente por Google Vision."

    return _standard_result("GOOGLE_VISION", score, labels, ocr_text,
                            is_explicit, is_illegal, is_safe_for_minors, status, reason)

def _moderate_aws_rekognition(image_path: str) -> dict:
    """AWS Rekognition: DetectModerationLabels + DetectText (OCR)."""
    import boto3

    client = boto3.client("rekognition", region_name=settings.AWS_REGION)
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    mod = client.detect_moderation_labels(Image={"Bytes": image_bytes}, MinConfidence=40)
    text = client.detect_text(Image={"Bytes": image_bytes})

    labels = [
        {"label": l["Name"], "score": round(l["Confidence"] / 100, 4), "parent": l.get("ParentName", "")}
        for l in mod.get("ModerationLabels", [])
    ]
    ocr_text = " ".join(
        t["DetectedText"] for t in text.get("TextDetections", []) if t["Type"] == "LINE"
    ) or None

    score = max((l["score"] for l in labels), default=0.0)
    explicit_parents = {"Explicit Nudity", "Explicit", "Non-Explicit Nudity of Intimate parts and Kissing"}
    illegal_parents = {"Violence", "Visually Disturbing", "Drugs & Tobacco", "Weapons"}
    is_explicit = any(l["parent"] in explicit_parents or l["label"] in explicit_parents for l in labels)
    is_illegal = any(l["parent"] in illegal_parents or l["label"] in illegal_parents for l in labels)
    is_safe_for_minors = score < REVIEW_THRESHOLD and not is_explicit

    if score >= BLOCK_THRESHOLD or is_explicit:
        status, reason = "BLOCKED", "Contenido no permitido detectado por AWS Rekognition."
    elif score >= REVIEW_THRESHOLD:
        status, reason = "PENDING", "Posible contenido sensible: requiere revisión manual."
    else:
        status, reason = "APPROVED", "Contenido validado automáticamente por AWS Rekognition."

    return _standard_result("AWS_REKOGNITION", score, labels, ocr_text,
                            is_explicit, is_illegal, is_safe_for_minors, status, reason)

def _moderate_hf_nsfw(image_path: str) -> dict:
    """Hugging Face inference API con un detector NSFW (p. ej. Falconsai/nsfw_image_detection)."""
    import mimetypes
    import requests

    api_url = f"https://router.huggingface.co/hf-inference/models/{settings.HF_NSFW_MODEL}"
    content_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"
    headers = {
        "Authorization": f"Bearer {settings.HF_API_TOKEN}",
        "Content-Type": content_type,
    }
    with open(image_path, "rb") as f:
        response = requests.post(api_url, headers=headers, data=f.read(), timeout=30)
    response.raise_for_status()
    predictions = response.json()

    labels = [{"label": p["label"], "score": round(p["score"], 4)} for p in predictions]
    nsfw_score = next((p["score"] for p in predictions if p["label"].lower() in ("nsfw", "porn", "explicit")), 0.0)

    is_explicit = nsfw_score >= REVIEW_THRESHOLD
    is_safe_for_minors = nsfw_score < REVIEW_THRESHOLD

    if nsfw_score >= BLOCK_THRESHOLD:
        status, reason = "BLOCKED", "Contenido NSFW detectado por el clasificador de Hugging Face."
    elif nsfw_score >= REVIEW_THRESHOLD:
        status, reason = "PENDING", "Posible contenido NSFW: requiere revisión manual."
    else:
        status, reason = "APPROVED", "Contenido validado por el clasificador NSFW."

    return _standard_result("HF_NSFW", nsfw_score, labels, None,
                            is_explicit, False, is_safe_for_minors, status, reason)

_PROVIDERS = {
    "MOCK": _moderate_mock,
    "GOOGLE_VISION": _moderate_google_vision,
    "AWS_REKOGNITION": _moderate_aws_rekognition,
    "HF_NSFW": _moderate_hf_nsfw,
}

_COMMENT_BLACKLIST = [
    "puta", "puto", "mierda", "coño", "joder", "hostia", "cabrón", "cabrona",
    "imbécil", "idiota", "estúpido", "estúpida", "gilipollas", "maricón",
    "maricona", "zorra", "hijueputa", "hijueputa", "culero", "pendejo",
    "pendeja", "chingada", "verga", "follar", "porno", "prostituta",
    "fuck", "shit", "bitch", "nigger", "faggot", "cunt", "whore",
    "asshole", "bastard", "motherfucker", "penis", "vagina", "porn",
    "rape", "kill yourself", "kys", "suicid",
]

def _check_keyword_blacklist(text: str):
    import re
    lower = text.lower()
    for word in _COMMENT_BLACKLIST:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, lower):
            return True, "El comentario contiene lenguaje inapropiado y no puede publicarse."
    return False, ""

def _moderate_comment_comprehend(text: str) -> dict:
    import boto3
    client = boto3.client("comprehend", region_name=settings.AWS_REGION)
    try:
        response = client.detect_toxic_content(
            TextSegments=[{"Text": text[:5000]}],
            LanguageCode="es",
        )
        results = response.get("ResultList", [])
        if not results:
            return {"status": "APPROVED", "reason": "Comentario aceptado"}
        labels = results[0].get("Labels", [])
        toxicity_score = max((l["Score"] for l in labels), default=0.0)
        if toxicity_score >= 0.75:
            return {"status": "BLOCKED", "reason": "Comentario inapropiado detectado por IA."}
        return {"status": "APPROVED", "reason": "Comentario aceptado"}
    except Exception as exc:
        logger.warning("Comprehend no disponible, solo filtro de palabras: %s", exc)
        return {"status": "APPROVED", "reason": "Comentario aceptado"}

def moderate_comment(text: str) -> dict:
    """Filtra comentarios inapropiados. Primera línea: lista de palabras; segunda: AWS Comprehend."""
    if not text or not text.strip():
        return {"status": "BLOCKED", "reason": "El comentario no puede estar vacío."}
    blocked, reason = _check_keyword_blacklist(text)
    if blocked:
        return {"status": "BLOCKED", "reason": reason}
    provider_name = (settings.MODERATION_PROVIDER or "MOCK").upper()
    if provider_name == "AWS_REKOGNITION":
        return _moderate_comment_comprehend(text)
    return {"status": "APPROVED", "reason": "Comentario aceptado"}

def moderate_image(image_path: str, pin_id: Optional[int] = None,
                   media_id: Optional[int] = None) -> dict:
    """Ejecuta la moderación con el proveedor configurado y persiste el resultado.

    Si el proveedor externo falla, bloquea el contenido (fail-closed): no se puede
    confirmar que sea seguro, por lo que se rechaza automáticamente.
    """
    provider_name = (settings.MODERATION_PROVIDER or "MOCK").upper()
    provider = _PROVIDERS.get(provider_name, _moderate_mock)

    try:
        result = provider(image_path)
    except Exception as error:
        logger.error("Proveedor de moderación %s falló: %s", provider_name, error)
        result = _standard_result(
            provider=provider_name,
            score=None, labels=[], ocr_text=None,
            is_explicit=False, is_illegal=False, is_safe_for_minors=False,
            status="BLOCKED",
            reason=f"El servicio de moderación no está disponible ({type(error).__name__}); contenido rechazado por seguridad.",
        )

    save_validation(result, pin_id=pin_id, media_id=media_id)
    return result

def save_validation(result: dict, pin_id: Optional[int] = None,
                    media_id: Optional[int] = None) -> None:
    """Guarda el resultado de la validación IA/OCR en BD."""
    try:
        execute_query(
            """
            INSERT INTO moderation.AiValidations
                (PinId, MediaId, Provider, Score, Labels, OcrText,
                 IsExplicit, IsIllegal, IsSafeForMinors, Status, Reason)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                pin_id,
                media_id,
                result["provider"],
                result["score"],
                json.dumps(result["labels"], ensure_ascii=False),
                result["ocr_text"],
                1 if result["is_explicit"] else 0,
                1 if result["is_illegal"] else 0,
                1 if result["is_safe_for_minors"] else 0,
                result["status"],
                result["reason"],
            ],
        )
    except Exception as error:
        logger.error("No se pudo guardar la validación IA: %s", error)

def get_validation_for_pin(pin_id: int) -> Optional[dict]:
    """Última validación registrada para un pin."""
    return fetch_one(
        """
        SELECT TOP 1 ValidationId, PinId, MediaId, Provider, Score, Labels,
               OcrText, IsExplicit, IsIllegal, IsSafeForMinors, Status, Reason, CreatedAt
        FROM moderation.AiValidations
        WHERE PinId = ?
        ORDER BY CreatedAt DESC
        """,
        [pin_id],
    )
