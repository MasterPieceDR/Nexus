from datetime import datetime
from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    category_id: int
    board_id: int | None = None
    tags: str | None = Field(default=None, max_length=300)
    s3_key: str = Field(min_length=3, max_length=500)
    media_type: str = Field(min_length=3, max_length=80)
    is_ai_generated: bool = False
    is_sensitive: bool = False


class PostStatusUpdate(BaseModel):
    status: str = Field(pattern="^(PENDING|APPROVED|REJECTED|HIDDEN)$")


class PostOut(BaseModel):
    id: int
    title: str
    description: str | None
    tags: str | None
    category_id: int
    category_name: str | None
    author_name: str | None
    media_url: str | None
    media_type: str
    status: str
    created_at: datetime
    visual_ratio: str = "4 / 5"
