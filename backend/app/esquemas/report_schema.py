from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    post_id: int
    reason: str = Field(min_length=10, max_length=300)


class ReportOut(BaseModel):
    id: int
    post_id: int
    reason: str
