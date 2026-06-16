from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from uuid import uuid4
import shutil
import io

from app.db.connection import get_connection, fetch_all
from app.seguridad.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/media", tags=["Media"])

ALLOWED_TYPES = {
    "image/jpeg": "images",
    "image/png": "images",
    "image/webp": "images",
    "video/mp4": "videos"
}

MAX_SIZE = 15 * 1024 * 1024

THUMB_CACHE = Path("static/uploads/.cache")
ALLOWED_THUMB_PREFIXES = ("uploads/images/", "uploads/avatars/", "seed/images/")

def _to_webp(data: bytes, max_w: int = 1200, quality: int = 85) -> bytes:
    from PIL import Image
    img = Image.open(io.BytesIO(data))
    if img.width > max_w:
        ratio = max_w / img.width
        img = img.resize((max_w, int(img.height * ratio)), Image.LANCZOS)
    if img.mode == "P":
        img = img.convert("RGBA" if "transparency" in img.info else "RGB")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality, method=4)
    return buf.getvalue()

@router.get("/thumb")
def get_thumbnail(path: str, w: int = 1200, q: int = 85):
    """Sirve una versión WebP comprimida de cualquier imagen subida por usuarios.
    Cachea el resultado en disco para no procesar dos veces la misma imagen."""
    if not any(path.startswith(p) for p in ALLOWED_THUMB_PREFIXES):
        raise HTTPException(status_code=403, detail="Acceso no permitido")

    src = Path("static") / path
    if not src.exists():
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    cache_name = f"{path.replace('/', '__').replace(' ', '_')}_{w}_{q}.webp"
    cache_path = THUMB_CACHE / cache_name

    if not cache_path.exists():
        try:
            THUMB_CACHE.mkdir(parents=True, exist_ok=True)
            webp = _to_webp(src.read_bytes(), w, q)
            cache_path.write_bytes(webp)
        except Exception:

            return FileResponse(str(src), headers={"Cache-Control": "public, max-age=3600"})

    return FileResponse(
        str(cache_path),
        media_type="image/webp",
        headers={"Cache-Control": "public, max-age=604800"},
    )

@router.post("/local")
def upload_local_media(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_SIZE:
        raise HTTPException(status_code=400, detail="El archivo supera el tamaño máximo permitido")

    folder = ALLOWED_TYPES[file.content_type]

    if file.content_type.startswith("image"):
        raw = file.file.read()
        try:
            data = _to_webp(raw)
            extension = ".webp"
            mime_type = "image/webp"
        except Exception:
            data = raw
            extension = Path(file.filename).suffix.lower()
            mime_type = file.content_type
    else:
        data = None
        extension = Path(file.filename).suffix.lower()
        mime_type = file.content_type

    safe_name = f"{uuid4().hex}{extension}"
    relative_path = Path("uploads") / folder / str(current_user["UserId"]) / safe_name
    full_path = Path("static") / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    if data is not None:
        full_path.write_bytes(data)
    else:
        with full_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    media_url = f"/static/{relative_path.as_posix()}"
    object_key = relative_path.as_posix()
    media_kind = "IMAGE" if file.content_type.startswith("image") else "VIDEO"

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            DECLARE @NewMediaId BIGINT;
            EXEC content.usp_CreateMediaAsset
                @OwnerUserId = ?,
                @BucketName = N'local-dev',
                @ObjectKey = ?,
                @MediaUrl = ?,
                @MediaKind = ?,
                @MimeType = ?,
                @OriginalFileName = ?,
                @SizeBytes = ?,
                @NewMediaId = @NewMediaId OUTPUT;
            SELECT @NewMediaId AS MediaId;
            """,
            current_user["UserId"],
            object_key,
            media_url,
            media_kind,
            mime_type,
            file.filename,
            size
        )
        row = cursor.fetchone()
        conn.commit()

    return {
        "MediaId": int(row.MediaId),
        "MediaUrl": media_url,
        "ObjectKey": object_key,
        "MediaKind": media_kind,
        "MimeType": mime_type
    }

@router.get("/me")
def get_my_media(current_user: dict = Depends(get_current_user)):
    query = """
    SELECT
        MediaId,
        MediaUrl,
        ObjectKey,
        MediaKind,
        MimeType,
        OriginalFileName,
        SizeBytes,
        CreatedAt
    FROM content.MediaAssets
    WHERE OwnerUserId = ?
    AND DeletedAt IS NULL
    ORDER BY CreatedAt DESC
    """
    return fetch_all(query, [current_user["UserId"]])
