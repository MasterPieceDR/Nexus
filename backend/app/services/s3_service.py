from uuid import uuid4
import re
import boto3
from botocore.config import Config
from ..config import settings

allowed_content_types = {
    "image/jpeg": "images",
    "image/png": "images",
    "image/webp": "images",
    "video/mp4": "videos"
}

client = boto3.client(
    "s3",
    region_name=settings.aws_region,
    config=Config(signature_version="s3v4")
)


def normalize_filename(filename: str) -> str:
    name = filename.strip().lower()
    name = re.sub(r"[^a-z0-9.\-_]+", "-", name)
    return name[:140]


def build_object_key(user_id: int, filename: str, content_type: str) -> str:
    folder = allowed_content_types.get(content_type)
    safe_name = normalize_filename(filename)
    return f"uploads/{folder}/{user_id}/{uuid4().hex}-{safe_name}"


def validate_content_type(content_type: str) -> None:
    if content_type not in allowed_content_types:
        raise ValueError("Tipo de archivo no permitido")


def create_presigned_upload_url(user_id: int, filename: str, content_type: str) -> dict:
    validate_content_type(content_type)
    key = build_object_key(user_id, filename, content_type)
    if settings.environment == "dev":
        # Local upload route mapping
        upload_url = f"http://127.0.0.1:8000/uploads/local-upload?key={key}"
        return {
            "upload_url": upload_url,
            "s3_key": key,
            "expires_in": settings.aws_presign_expiration
        }

    upload_url = client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.aws_media_bucket,
            "Key": key,
            "ContentType": content_type
        },
        ExpiresIn=settings.aws_presign_expiration
    )
    return {
        "upload_url": upload_url,
        "s3_key": key,
        "expires_in": settings.aws_presign_expiration
    }


def create_presigned_get_url(key: str | None) -> str | None:
    if not key:
        return None
    if key.startswith("http"):
        return key
    if settings.environment == "dev":
        return f"http://127.0.0.1:8000/static/{key}"

    return client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.aws_media_bucket,
            "Key": key
        },
        ExpiresIn=settings.aws_presign_expiration
    )
