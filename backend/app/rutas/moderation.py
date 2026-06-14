from fastapi import APIRouter, Depends, HTTPException
from app.db.connection import get_connection, fetch_all, fetch_one, execute_query
from app.seguridad.dependencies import get_current_user, require_moderator
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/moderation", tags=["Moderation"])

class StatusUpdate(BaseModel):
    status: str
    is_ai_generated: bool = False
    is_sensitive: bool = False
    ai_disclosure_text: Optional[str] = None
    content_warning: Optional[str] = None

class ReportResolve(BaseModel):
    action_taken: str
    notes: str

@router.get("/pending")
def get_pending_nodes(current_user: dict = Depends(require_moderator)):
    
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
    ORDER BY P.CreatedAt ASC
    """
    return fetch_all(query)

@router.post("/pins/{pin_id}/status")
def update_pin_status(pin_id: int, payload: StatusUpdate, current_user: dict = Depends(require_moderator)):
    try:
        execute_query(
            """
            UPDATE content.Pins
            SET Status = ?,
                PublishedAt = CASE WHEN ? = 'APPROVED' THEN GETDATE() ELSE PublishedAt END,
                IsAiGenerated = ?,
                IsSensitive = ?
            WHERE PinId = ?
            """,
            [payload.status, payload.status, payload.is_ai_generated, payload.is_sensitive, pin_id]
        )
        
        execute_query(
            """
            MERGE content.NodeEthics AS target
            USING (SELECT ? AS PinId) AS source
            ON target.PinId = source.PinId
            WHEN MATCHED THEN
                UPDATE SET 
                    IsAiGenerated = ?, 
                    IsSensitive = ?, 
                    AiDisclosureText = ?, 
                    ContentWarning = ?, 
                    EthicalReviewStatus = 'REVIEWED', 
                    ReviewedBy = ?, 
                    ReviewedAt = GETDATE()
            WHEN NOT MATCHED THEN
                INSERT (PinId, IsAiGenerated, IsSensitive, AiDisclosureText, ContentWarning, EthicalReviewStatus, ReviewedBy, ReviewedAt)
                VALUES (?, ?, ?, ?, ?, 'REVIEWED', ?, GETDATE());
            """,
            [
                pin_id, 
                payload.is_ai_generated, payload.is_sensitive, payload.ai_disclosure_text, payload.content_warning, current_user["UserId"],
                pin_id, payload.is_ai_generated, payload.is_sensitive, payload.ai_disclosure_text, payload.content_warning, current_user["UserId"]
            ]
        )
        return {"status": "success"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/reports")
def get_reports(current_user: dict = Depends(require_moderator)):
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
def resolve_report(report_id: int, payload: ReportResolve, current_user: dict = Depends(require_moderator)):
    try:
        report = fetch_one(
            "SELECT ReportId, EntityType, EntityId, Status FROM moderation.Reports WHERE ReportId = ?",
            [report_id]
        )
        if not report:
            raise HTTPException(status_code=404, detail="Reporte no encontrado")
        if report["Status"] == "RESOLVED":
            return {"status": "already_resolved"}

        execute_query(
            """
            UPDATE moderation.Reports
            SET Status = 'RESOLVED',
                ResolvedByUserId = ?,
                ResolvedAt = GETDATE()
            WHERE ReportId = ?
            """,
            [current_user["UserId"], report_id]
        )

        if payload.action_taken == "CONTENT_REMOVED" and report.get("EntityType") == "PIN":
            execute_query(
                "UPDATE content.Pins SET Status = 'HIDDEN' WHERE PinId = ? AND DeletedAt IS NULL",
                [report["EntityId"]]
            )

        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
