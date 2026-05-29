from fastapi import APIRouter, Depends, HTTPException, status, Request
import os
from ..esquemas.upload_schema import PresignedUploadRequest, PresignedUploadResponse
from ..seguridad.dependencies import get_current_user
from ..services.s3_service import create_presigned_upload_url

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/presigned-url", response_model=PresignedUploadResponse)
def create_upload_url(payload: PresignedUploadRequest, user: dict = Depends(get_current_user)):
    try:
        return create_presigned_upload_url(user["UserId"], payload.filename, payload.content_type)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


@router.put("/local-upload")
async def local_upload(key: str, request: Request):
    try:
        # File path will be under static/
        file_path = os.path.join("static", key)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        content = await request.body()
        with open(file_path, "wb") as f:
            f.write(content)

        return {"status": "success", "message": "Archivo subido localmente"}
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error guardando archivo localmente: {str(error)}"
        )
