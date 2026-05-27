from pydantic import BaseModel, Field


class PresignedUploadRequest(BaseModel):
    filename: str = Field(min_length=3, max_length=180)
    content_type: str = Field(min_length=3, max_length=80)


class PresignedUploadResponse(BaseModel):
    upload_url: str
    s3_key: str
    expires_in: int
