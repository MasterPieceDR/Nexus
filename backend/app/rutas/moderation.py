from fastapi import APIRouter, Depends, HTTPException
from app.db.connection import get_connection, fetch_all, execute_query
from app.seguridad.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/moderation", tags=["Moderation"])

class StatusUpdate(BaseModel):
    status: str

class ReportResolve(BaseModel):
    action_taken: str
    notes: str

@router.get("/pending")
def get_pending_nodes(current_user: dict = Depends(get_current_user)):
    if current_user["RoleId"] not in [1, 2]: # 1: Admin, 2: Moderator
        raise HTTPException(status_code=403, detail="Permiso denegado")
        
    query = """
    SELECT
        P.PinId,
        P.Title,
        P.Description,
        P.Status,
        P.IsAiGenerated,
        P.IsSensitive,
        P.CreatedAt,
        U.UserId AS OwnerUserId,
        U.Username,
        MA.MediaUrl,
        MA.MediaKind
    FROM content.Pins P
    INNER JOIN sec.Users U ON U.UserId = P.OwnerUserId
    OUTER APPLY (
        SELECT TOP 1
            M.MediaUrl,
            M.MediaKind
        FROM content.PinMedia PM
        INNER JOIN content.MediaAssets M ON M.MediaId = PM.MediaId
        WHERE PM.PinId = P.PinId
        ORDER BY PM.SortOrder ASC
    ) MA
    WHERE P.Status = N'PENDING'
    AND P.DeletedAt IS NULL
    ORDER BY P.CreatedAt ASC
    """
    return fetch_all(query)

@router.post("/pins/{pin_id}/status")
def update_pin_status(pin_id: int, payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["RoleId"] not in [1, 2]:
        raise HTTPException(status_code=403, detail="Permiso denegado")
        
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE content.Pins
            SET Status = ?,
                PublishedAt = CASE WHEN ? = 'APPROVED' THEN GETDATE() ELSE PublishedAt END
            WHERE PinId = ? AND DeletedAt IS NULL
            """,
            payload.status, payload.status, pin_id
        )
        conn.commit()
    return {"status": "success"}

@router.get("/reports")
def get_reports(current_user: dict = Depends(get_current_user)):
    if current_user["RoleId"] not in [1, 2]:
        raise HTTPException(status_code=403, detail="Permiso denegado")
        
    query = """
    SELECT
        R.ReportId,
        R.ReporterUserId,
        R.EntityType,
        R.EntityId,
        R.Reason,
        R.Details,
        R.Status,
        R.CreatedAt
    FROM moderation.Reports R
    ORDER BY R.CreatedAt DESC
    """
    return fetch_all(query)

@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: int, payload: ReportResolve, current_user: dict = Depends(get_current_user)):
    if current_user["RoleId"] not in [1, 2]:
        raise HTTPException(status_code=403, detail="Permiso denegado")
        
    try:
        query = """
        EXEC moderation.usp_ResolveReport
            @ReportId = ?,
            @ModeratorUserId = ?,
            @Decision = ?,
            @Notes = ?
        """
        execute_query(query, [
            report_id,
            current_user["UserId"],
            payload.action_taken,
            payload.notes
        ])
        return {"status": "success"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
