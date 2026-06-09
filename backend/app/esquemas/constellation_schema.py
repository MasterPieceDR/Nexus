from pydantic import BaseModel, Field
from typing import Optional


class ConstellationCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    visibility: str = "PUBLIC"


class AddPinToConstellation(BaseModel):
    pin_id: int
