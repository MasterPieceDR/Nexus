from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from pathlib import Path
from uuid import uuid4
import shutil

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
    extension = Path(file.filename).suffix.lower()
    safe_name = f"{uuid4().hex}{extension}"

    relative_path = Path("uploads") / folder / str(current_user["UserId"]) / safe_name
    full_path = Path("static") / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    with full_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    media_url = f"http://127.0.0.1:8000/static/{relative_path.as_posix()}"
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
            file.content_type,
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
        "MimeType": file.content_type
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
