from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..db.connection import execute_query
from ..seguridad.dependencies import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

class ReportCreate(BaseModel):
    pin_id: int
    reason: str

@router.post("")
def create_report(payload: ReportCreate, user: dict = Depends(get_current_user)):
    try:
        query = """
        INSERT INTO moderation.Reports (PinId, UserId, Reason)
        VALUES (?, ?, ?)
        """
        execute_query(query, [payload.pin_id, user["UserId"], payload.reason.strip()])
        return {"status": "success", "message": "Report submitted successfully"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
