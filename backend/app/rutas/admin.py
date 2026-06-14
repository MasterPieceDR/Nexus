"""
Panel privado de administración / moderación.
Todas las rutas requieren rol SUPER_ADMIN, ADMIN o MODERATOR.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.connection import fetch_all, fetch_one
from app.seguridad.dependencies import require_moderator

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/metrics")
def get_metrics(user: dict = Depends(require_moderator)):
    """Métricas generales para el dashboard."""
    try:
        metrics = fetch_one("""
        SELECT
            (SELECT COUNT(*) FROM sec.Users WHERE DeletedAt IS NULL) AS TotalUsers,
            (SELECT COUNT(*) FROM content.Pins WHERE DeletedAt IS NULL) AS TotalPins,
            (SELECT COUNT(*) FROM content.Pins WHERE Status = N'PENDING' AND DeletedAt IS NULL) AS PendingPins,
            (SELECT COUNT(*) FROM content.Pins WHERE Status = N'APPROVED' AND DeletedAt IS NULL) AS ApprovedPins,
            (SELECT COUNT(*) FROM content.Pins WHERE Status = N'REJECTED' AND DeletedAt IS NULL) AS RejectedPins,
            (SELECT COUNT(*) FROM moderation.Reports WHERE Status = N'OPEN') AS OpenReports,
            (SELECT COUNT(*) FROM moderation.AiValidations) AS AiValidations,
            (SELECT COUNT(*) FROM core.AppRatings) AS TotalRatings,
            (SELECT AVG(CAST(Rating AS DECIMAL(4,2))) FROM core.AppRatings) AS AvgRating
        """)
        return metrics
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
    user: dict = Depends(require_moderator),
):
    try:
        return fetch_all(
            """
            SELECT u.UserId, u.DisplayName, u.Username, u.Email, u.RoleId, r.RoleName,
                   u.AccountStatus, u.CreatedAt, u.LastLoginAt,
                   (SELECT COUNT(*) FROM content.Pins p WHERE p.OwnerUserId = u.UserId AND p.DeletedAt IS NULL) AS PinsCount
            FROM sec.Users u
            LEFT JOIN sec.Roles r ON r.RoleId = u.RoleId
            WHERE u.DeletedAt IS NULL
            ORDER BY u.CreatedAt DESC
            OFFSET (? - 1) * ? ROWS FETCH NEXT ? ROWS ONLY
            """,
            [page, size, size],
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/pins")
def list_pins(
    status: str = Query(None, pattern="^(PENDING|APPROVED|REJECTED|HIDDEN)$"),
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
    user: dict = Depends(require_moderator),
):
    try:
        return fetch_all(
            """
            SELECT p.PinId, p.Title, p.Status, p.VerifiedStatus, p.IsAiGenerated, p.IsSensitive,
                   p.CreatedAt, p.PublishedAt, p.ReactionsCount, p.SavesCount, p.ViewsCount,
                   u.Username, u.DisplayName,
                   c.Name AS CategoryName,
                   m.MediaUrl, m.MediaKind
            FROM content.Pins p
            INNER JOIN sec.Users u ON u.UserId = p.OwnerUserId
            LEFT JOIN core.Categories c ON c.CategoryId = p.CategoryId
            OUTER APPLY (
                SELECT TOP 1 MA.MediaUrl, MA.MediaKind
                FROM content.PinMedia PM
                INNER JOIN content.MediaAssets MA ON MA.MediaId = PM.MediaId
                WHERE PM.PinId = p.PinId
                ORDER BY PM.SortOrder ASC
            ) m
            WHERE p.DeletedAt IS NULL
            AND (? IS NULL OR p.Status = ?)
            ORDER BY p.CreatedAt DESC
            OFFSET (? - 1) * ? ROWS FETCH NEXT ? ROWS ONLY
            """,
            [status, status, page, size, size],
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/reports")
def list_reports(
    status: str = Query(None, pattern="^(OPEN|RESOLVED)$"),
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
    user: dict = Depends(require_moderator),
):
    try:
        return fetch_all(
            """
            SELECT r.ReportId, r.EntityType, r.EntityId, r.Reason, r.Details, r.Status,
                   r.CreatedAt, r.ResolvedAt,
                   reporter.Username AS ReporterUsername,
                   resolver.Username AS ResolverUsername
            FROM moderation.Reports r
            LEFT JOIN sec.Users reporter ON reporter.UserId = r.ReporterUserId
            LEFT JOIN sec.Users resolver ON resolver.UserId = r.ResolvedByUserId
            WHERE (? IS NULL OR r.Status = ?)
            ORDER BY r.CreatedAt DESC
            OFFSET (? - 1) * ? ROWS FETCH NEXT ? ROWS ONLY
            """,
            [status, status, page, size, size],
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/reports/stats")
def report_stats(user: dict = Depends(require_moderator)):
    """Estadísticas de reportes: totales, por razón y por acción tomada."""
    summary = {"Total": 0, "Open": 0, "Resolved": 0}
    by_reason = []
    by_action = []

    try:
        row = fetch_one("""
            SELECT
                COUNT(*) AS Total,
                COALESCE(SUM(CASE WHEN Status = N'OPEN'     THEN 1 ELSE 0 END), 0) AS [Open],
                COALESCE(SUM(CASE WHEN Status = N'RESOLVED' THEN 1 ELSE 0 END), 0) AS Resolved
            FROM moderation.Reports
        """)
        if row:
            summary = {
                "Total":    int(row.get("Total",    0) or 0),
                "Open":     int(row.get("Open",     0) or 0),
                "Resolved": int(row.get("Resolved", 0) or 0),
            }
    except Exception:
        pass

    try:
        rows = fetch_all("""
            SELECT COALESCE(Reason, 'SIN_RAZÓN') AS Reason, COUNT(*) AS Count
            FROM moderation.Reports
            GROUP BY Reason
            ORDER BY Count DESC
        """)
        by_reason = rows or []
    except Exception:
        pass

    try:
        rows = fetch_all("""
            SELECT
                COALESCE(ResolvedByUserId, 0) AS UserId,
                COUNT(*) AS Count,
                MIN(ResolvedAt) AS FirstAt
            FROM moderation.Reports
            WHERE Status = N'RESOLVED'
            GROUP BY ResolvedByUserId
            ORDER BY Count DESC
        """)

        content_removed = next(
            (int(r.get("Count", 0) or 0) for r in (rows or []) if r.get("UserId")), 0
        )

        pass
    except Exception:
        pass

    try:
        removed = fetch_one("""
            SELECT COUNT(*) AS Cnt
            FROM moderation.Reports r
            JOIN content.Pins p ON p.PinId = r.EntityId
            WHERE r.EntityType = 'PIN'
              AND r.Status = 'RESOLVED'
              AND p.Status = 'HIDDEN'
        """)
        no_action_row = fetch_one("""
            SELECT COUNT(*) AS Cnt
            FROM moderation.Reports
            WHERE Status = 'RESOLVED'
        """)
        removed_count = int((removed or {}).get("Cnt", 0) or 0)
        total_resolved = int((no_action_row or {}).get("Cnt", 0) or 0)
        by_action = [
            {"Action": "CONTENT_REMOVED", "Count": removed_count},
            {"Action": "NO_ACTION",       "Count": max(0, total_resolved - removed_count)},
        ]
    except Exception:
        by_action = []

    return {"summary": summary, "by_reason": by_reason, "by_action": by_action}

@router.get("/validations")
def list_ai_validations(
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
    user: dict = Depends(require_moderator),
):
    """Resultados de validaciones IA/OCR para revisión manual."""
    try:
        return fetch_all(
            """
            SELECT v.ValidationId, v.PinId, v.MediaId, v.Provider, v.Score, v.Labels,
                   v.OcrText, v.IsExplicit, v.IsIllegal, v.IsSafeForMinors,
                   v.Status, v.Reason, v.CreatedAt,
                   p.Title AS PinTitle, p.Status AS PinStatus
            FROM moderation.AiValidations v
            LEFT JOIN content.Pins p ON p.PinId = v.PinId
            ORDER BY v.CreatedAt DESC
            OFFSET (? - 1) * ? ROWS FETCH NEXT ? ROWS ONLY
            """,
            [page, size, size],
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/ratings/summary")
def ratings_summary(user: dict = Depends(require_moderator)):
    """Resumen de valoraciones: promedio, distribución por estrellas y evolución."""
    try:
        overall = fetch_one("""
            SELECT COUNT(*) AS Total, AVG(CAST(Rating AS DECIMAL(4,2))) AS Average
            FROM core.AppRatings
        """)
        by_star = fetch_all("""
            SELECT Rating, COUNT(*) AS Count
            FROM core.AppRatings
            GROUP BY Rating
            ORDER BY Rating
        """)
        by_date = fetch_all("""
            SELECT CAST(CreatedAt AS DATE) AS Date,
                   COUNT(*) AS Count,
                   AVG(CAST(Rating AS DECIMAL(4,2))) AS Average
            FROM core.AppRatings
            GROUP BY CAST(CreatedAt AS DATE)
            ORDER BY CAST(CreatedAt AS DATE)
        """)
        recent = fetch_all("""
            SELECT TOP 20 r.RatingId, r.Rating, r.Comment, r.CreatedAt, u.DisplayName, u.Username
            FROM core.AppRatings r
            JOIN sec.Users u ON u.UserId = r.UserId
            WHERE r.Comment IS NOT NULL AND LEN(r.Comment) > 0
            ORDER BY r.CreatedAt DESC
        """)
        return {
            "total": overall["Total"],
            "average": float(overall["Average"]) if overall["Average"] is not None else None,
            "by_star": by_star,
            "by_date": by_date,
            "recent_comments": recent,
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/audit")
def list_audit(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    user: dict = Depends(require_moderator),
):
    try:
        return fetch_all(
            """
            SELECT a.AuditId, a.EventTime, a.ActorUserId, u.Username AS ActorUsername,
                   a.ActionName, a.EntityName, a.EntityId, a.NewData
            FROM audit.AuditLog a
            LEFT JOIN sec.Users u ON u.UserId = a.ActorUserId
            ORDER BY a.EventTime DESC
            OFFSET (? - 1) * ? ROWS FETCH NEXT ? ROWS ONLY
            """,
            [page, size, size],
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
