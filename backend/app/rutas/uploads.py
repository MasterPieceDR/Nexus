from fastapi import APIRouter, Depends, HTTPException, status, Request
import os
import io
from ..esquemas.upload_schema import PresignedUploadRequest, PresignedUploadResponse
from ..seguridad.dependencies import get_current_user
from ..services.s3_service import create_presigned_upload_url

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


def _try_webp(data: bytes, max_w: int = 1200, quality: int = 85) -> bytes:
    """Intenta convertir bytes de imagen a WebP redimensionado. Devuelve original si falla."""
    try:
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
    except Exception:
        return data


@router.post("/presigned-url", response_model=PresignedUploadResponse)
def create_upload_url(payload: PresignedUploadRequest, user: dict = Depends(get_current_user)):
    try:
        return create_presigned_upload_url(user["UserId"], payload.filename, payload.content_type)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


@router.put("/local-upload")
async def local_upload(key: str, request: Request):
    try:
        file_path = os.path.join("static", key)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        content = await request.body()

        # Para imágenes (no videos) intenta convertir a WebP antes de guardar
        lower_key = key.lower()
        is_image = any(lower_key.endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"))
        if is_image:
            content = _try_webp(content)

        with open(file_path, "wb") as f:
            f.write(content)

        return {"status": "success", "message": "Archivo subido localmente"}
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error guardando archivo localmente: {str(error)}"
        )
