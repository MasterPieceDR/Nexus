from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..db.connection import execute_query
from ..seguridad.dependencies import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

class ReportCreate(BaseModel):
    entity_type: str
    entity_id: int
    reason: str
    details: str | None = None

@router.post("")
def create_report(payload: ReportCreate, user: dict = Depends(get_current_user)):
    try:
        query = """
        EXEC moderation.usp_ReportEntity 
            @ReporterUserId = ?, 
            @EntityType = ?, 
            @EntityId = ?, 
            @Reason = ?, 
            @Details = ?
        """
        execute_query(query, [
            user["UserId"], 
            payload.entity_type, 
            payload.entity_id, 
            payload.reason.strip(),
            payload.details or ""
        ])
        return {"status": "success", "message": "Report submitted successfully"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
