from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks  # BackgroundTasks used in search/feed
from pydantic import BaseModel
from typing import Optional
from app.db.connection import fetch_all, fetch_one, execute_query
from app.seguridad.dependencies import get_current_user, get_optional_user, require_moderator

router = APIRouter(prefix="/api/pins", tags=["Pins"])


def _log_search(user_id: Optional[int], search: Optional[str], category_id: Optional[int], results: int):
    """Registra la búsqueda para alimentar el feed personalizado (best effort)."""
    if not user_id or not (search or category_id):
        return
    try:
        execute_query(
            "INSERT INTO social.SearchLog (UserId, Query, CategoryId, ResultsCount) VALUES (?, ?, ?, ?)",
            [user_id, (search or "")[:200], category_id, results],
        )
    except Exception:
        pass


def _log_view(user_id: int, pin_id: int):
    """Registra la vista de un pin para el feed personalizado (best effort)."""
    try:
        execute_query(
            "INSERT INTO social.PinViews (UserId, PinId) VALUES (?, ?)",
            [user_id, pin_id],
        )
    except Exception:
        pass


def _attach_viewer_likes(pins: list, viewer_id: Optional[int]) -> list:
    """Marca IsLikedByViewer sin N+1: una sola consulta para los pins visibles."""
    if not pins:
        return pins
    if not viewer_id:
        for p in pins:
            p["IsLikedByViewer"] = 0
        return pins

    pin_ids = [p["PinId"] for p in pins]
    placeholders = ",".join("?" * len(pin_ids))
    liked = fetch_all(
        f"SELECT PinId FROM content.PinReactions WHERE UserId = ? AND PinId IN ({placeholders})",
        [viewer_id, *pin_ids],
    )
    liked_set = {r["PinId"] for r in liked}
    for p in pins:
        p["IsLikedByViewer"] = 1 if p["PinId"] in liked_set else 0
    return pins


@router.get("/feed")
def get_feed(page: int = Query(1, ge=1), size: int = Query(30, ge=1, le=100), user: dict | None = Depends(get_optional_user)):
    try:
        viewer_id = user["UserId"] if user else None
        query = """
        EXEC content.usp_GetFeed
            @ViewerUserId = ?,
            @PageNumber = ?,
            @PageSize = ?
        """
        pins = fetch_all(query, [viewer_id, page, size])
        return _attach_viewer_likes(pins, viewer_id)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/search")
def search_pins(
    background_tasks: BackgroundTasks,
    search: str = None,
    category_id: int = None,
    tag_slug: str = None,
    author: str = None,
    verified_only: bool = False,
    sort: str = Query("recent", pattern="^(recent|popular)$"),
    page: int = Query(1, ge=1),
    size: int = Query(30, ge=1, le=100),
    user: dict | None = Depends(get_optional_user)
):
    try:
        viewer_id = user["UserId"] if user else None
        query = """
        EXEC content.usp_SearchPinsV2
            @Search = ?,
            @CategoryId = ?,
            @TagSlug = ?,
            @AuthorUsername = ?,
            @VerifiedOnly = ?,
            @SortBy = ?,
            @ViewerUserId = ?,
            @PageNumber = ?,
            @PageSize = ?
        """
        pins = fetch_all(query, [search, category_id, tag_slug, author, 1 if verified_only else 0, sort, viewer_id, page, size])
        background_tasks.add_task(_log_search, viewer_id, search, category_id, len(pins))
        return _attach_viewer_likes(pins, viewer_id)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/for-you")
def get_personalized_feed(
    page: int = Query(1, ge=1),
    size: int = Query(30, ge=1, le=100),
    user: dict = Depends(get_current_user)
):
    """Feed personalizado según likes, guardados, vistas y búsquedas del usuario."""
    try:
        query = """
        EXEC content.usp_GetPersonalizedFeed
            @ViewerUserId = ?,
            @PageNumber = ?,
            @PageSize = ?
        """
        pins = fetch_all(query, [user["UserId"], page, size])
        return _attach_viewer_likes(pins, user["UserId"])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/validate-preview")
def validate_image_preview(key: str = Query(...), user: dict = Depends(get_current_user)):
    """Valida una imagen ya subida sin crear un pin. Permite feedback inmediato al usuario."""
    import os
    from app.services.moderation_service import moderate_image
    local_path = os.path.join("static", key)
    if not os.path.exists(local_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado en el servidor.")
    try:
        result = moderate_image(local_path, pin_id=None, media_id=None)
        return {"status": result["status"], "reason": result["reason"]}
    except Exception:
        return {"status": "PENDING", "reason": "No se pudo evaluar la imagen."}


@router.get("/{pin_id}")
def get_pin_detail(pin_id: int, background_tasks: BackgroundTasks, user: dict | None = Depends(get_optional_user)):
    try:
        viewer_id = user["UserId"] if user else None
        if viewer_id:
            background_tasks.add_task(_log_view, viewer_id, pin_id)
        query = """
        EXEC content.usp_GetPinDetail
            @PinId = ?,
            @ViewerUserId = ?,
            @IpAddress = ?,
            @UserAgent = ?
        """
        pin = fetch_one(query, [pin_id, viewer_id, None, None])

        if pin is None:
            raise HTTPException(status_code=404, detail="Publicación no encontrada")

        if viewer_id:
            liked = fetch_one("SELECT 1 AS L FROM content.PinReactions WHERE UserId = ? AND PinId = ?", [viewer_id, pin_id])
            pin["IsLikedByViewer"] = 1 if liked else 0
        else:
            pin["IsLikedByViewer"] = 0

        return pin
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/{pin_id}/comments")
def get_pin_comments(pin_id: int):
    try:
        query = """
        SELECT
            c.CommentId,
            c.CommentText AS Content,
            c.CreatedAt,
            u.DisplayName AS author_name
        FROM content.Comments c
        JOIN sec.Users u ON c.UserId = u.UserId
        WHERE c.PinId = ? AND c.Status = N'VISIBLE' AND c.DeletedAt IS NULL
        ORDER BY c.CreatedAt DESC
        """
        return fetch_all(query, [pin_id])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


class CommentCreatePayload(BaseModel):
    content: str


@router.post("/{pin_id}/comments")
def create_pin_comment(pin_id: int, payload: CommentCreatePayload, user: dict = Depends(get_current_user)):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="El comentario no puede estar vacío")
    try:
        query = """
        DECLARE @NewCommentId BIGINT;
        EXEC content.usp_AddComment
            @PinId = ?,
            @UserId = ?,
            @CommentText = ?,
            @ParentCommentId = NULL,
            @NewCommentId = @NewCommentId OUTPUT;
        SELECT @NewCommentId AS CommentId;
        """
        row = fetch_one(query, [pin_id, user["UserId"], payload.content.strip()])
        return {"status": "success", "message": "Comentario creado exitosamente", "comment_id": row["CommentId"] if row else None}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


class PinCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: int
    board_id: Optional[int] = None
    tags: Optional[str] = None
    s3_key: str
    media_type: str
    source_url: Optional[str] = None
    is_ai_generated: bool = False
    is_sensitive: bool = False


@router.post("")
def create_pin(payload: PinCreate, user: dict = Depends(get_current_user)):
    import os
    from app.services.moderation_service import moderate_image

    try:
        media_url = f"/static/{payload.s3_key}"
        media_kind = "VIDEO" if "video" in payload.media_type.lower() else "IMAGE"

        media_asset = fetch_one(
            """
            DECLARE @NewMediaId BIGINT;
            EXEC content.usp_CreateMediaAsset
                @OwnerUserId = ?, @BucketName = N'local-dev', @ObjectKey = ?,
                @MediaUrl = ?, @MediaKind = ?, @MimeType = ?, @SizeBytes = 0,
                @NewMediaId = @NewMediaId OUTPUT;
            SELECT @NewMediaId AS MediaId;
            """,
            [user["UserId"], payload.s3_key, media_url, media_kind, payload.media_type],
        )

        if not media_asset or media_asset.get("MediaId") is None:
            raise Exception("No se pudo registrar el archivo multimedia")

        pin = fetch_one(
            """
            DECLARE @NewPinId BIGINT;
            EXEC content.usp_CreatePin
                @OwnerUserId = ?, @BoardId = ?, @CategoryId = ?, @Title = ?,
                @Description = ?, @SourceUrl = ?, @Visibility = N'PUBLIC',
                @IsAiGenerated = ?, @IsSensitive = ?, @MediaId = ?, @TagsCsv = ?,
                @NewPinId = @NewPinId OUTPUT;
            SELECT @NewPinId AS PinId;
            """,
            [
                user["UserId"], payload.board_id, payload.category_id,
                payload.title, payload.description, payload.source_url,
                1 if payload.is_ai_generated else 0,
                1 if payload.is_sensitive else 0,
                media_asset["MediaId"], payload.tags,
            ],
        )

        pin_id = pin["PinId"]
        local_path = os.path.join("static", payload.s3_key)

        # Videos y archivos no encontrados: revisión manual
        if media_kind == "VIDEO" or not os.path.exists(local_path):
            return {
                "status": "success",
                "pin_id": pin_id,
                "moderation_status": "PENDING",
                "moderation_reason": "Los videos requieren revisión manual antes de aparecer en el feed.",
            }

        # Imágenes: moderación SÍNCRONA — el usuario ve el resultado en tiempo real
        result = moderate_image(local_path, pin_id, media_asset["MediaId"])
        mod_status = result["status"]
        mod_reason = result["reason"]

        if mod_status == "BLOCKED":
            execute_query(
                "UPDATE content.Pins SET Status = N'REJECTED', UpdatedAt = SYSDATETIME() WHERE PinId = ?",
                [pin_id],
            )
            try:
                os.remove(local_path)
            except OSError:
                pass
            execute_query(
                "INSERT INTO moderation.UserViolations (UserId, PinId, Reason) VALUES (?, ?, ?)",
                [user["UserId"], pin_id, mod_reason],
            )
            violation_row = fetch_one(
                "SELECT COUNT(*) AS Total FROM moderation.UserViolations WHERE UserId = ?",
                [user["UserId"]],
            )
            violation_count = violation_row["Total"] if violation_row else 1
            raise HTTPException(
                status_code=422,
                detail={
                    "blocked": True,
                    "reason": mod_reason,
                    "pin_id": pin_id,
                    "violation_count": violation_count,
                },
            )

        if mod_status == "APPROVED":
            execute_query(
                "UPDATE content.Pins SET Status = N'APPROVED', PublishedAt = SYSDATETIME(), UpdatedAt = SYSDATETIME() WHERE PinId = ?",
                [pin_id],
            )

        return {
            "status": "success",
            "pin_id": pin_id,
            "moderation_status": mod_status,
            "moderation_reason": mod_reason,
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.delete("/{pin_id}")
def delete_pin(pin_id: int, user: dict = Depends(get_current_user)):
    """Eliminación suave de un pin. Solo el dueño o un moderador/admin puede eliminar."""
    pin = fetch_one(
        "SELECT OwnerUserId FROM content.Pins WHERE PinId = ? AND DeletedAt IS NULL",
        [pin_id]
    )
    if not pin:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")
    is_moderator = user.get("RoleId", 5) <= 3
    if pin["OwnerUserId"] != user["UserId"] and not is_moderator:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta publicación")
    try:
        execute_query(
            "UPDATE content.Pins SET DeletedAt = GETDATE() WHERE PinId = ?",
            [pin_id]
        )
        return {"status": "success"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


class PinStatusUpdate(BaseModel):
    status: str  # 'APPROVED' | 'REJECTED' | 'HIDDEN'


@router.patch("/{pin_id}/status")
def update_pin_status(pin_id: int, payload: PinStatusUpdate, user: dict = Depends(get_current_user)):
    # Restricción de acceso: solo Administradores o Moderadores
    if user.get("RoleId") not in [1, 2]:
        raise HTTPException(status_code=403, detail="No tienes permisos para moderar contenido")

    if payload.status not in ["APPROVED", "REJECTED", "HIDDEN"]:
        raise HTTPException(status_code=400, detail="Estado inválido. Use APPROVED, REJECTED o HIDDEN")

    try:
        query = """
        EXEC content.usp_UpdatePinStatus
            @PinId = ?,
            @Status = ?,
            @ActorUserId = ?
        """
        execute_query(query, [pin_id, payload.status, user["UserId"]])
        return {"status": "success", "message": f"Pin status updated to {payload.status}"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


class PinVerifyUpdate(BaseModel):
    verified_status: str  # UNVERIFIED | PENDING_VERIFICATION | VERIFIED | REJECTED


@router.patch("/{pin_id}/verify")
def verify_pin(pin_id: int, payload: PinVerifyUpdate, user: dict = Depends(require_moderator)):
    """Validación manual de la información de un pin (solo admin/moderador)."""
    valid_states = ["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "REJECTED"]
    if payload.verified_status not in valid_states:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Use uno de: {', '.join(valid_states)}")
    try:
        execute_query(
            "EXEC content.usp_VerifyPin @PinId = ?, @VerifiedStatus = ?, @ActorUserId = ?",
            [pin_id, payload.verified_status, user["UserId"]],
        )
        return {"status": "success", "verified_status": payload.verified_status}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/{pin_id}/like")
def like_pin(pin_id: int, user: dict = Depends(get_current_user)):
    try:
        check_query = "SELECT 1 AS L FROM content.PinReactions WHERE UserId = ? AND PinId = ?"
        already_liked = fetch_one(check_query, [user["UserId"], pin_id])
        if already_liked:
            execute_query("DELETE FROM content.PinReactions WHERE UserId = ? AND PinId = ?", [user["UserId"], pin_id])
            execute_query(
                "UPDATE content.Pins SET ReactionsCount = CASE WHEN ReactionsCount > 0 THEN ReactionsCount - 1 ELSE 0 END WHERE PinId = ?",
                [pin_id],
            )
            return {"status": "success", "message": "Pin unliked", "liked": False}
        else:
            execute_query("EXEC content.usp_SetPinReaction @UserId = ?, @PinId = ?, @ReactionType = N'LIKE'", [user["UserId"], pin_id])
            return {"status": "success", "message": "Pin liked", "liked": True}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/{pin_id}/save")
def save_pin(pin_id: int, user: dict = Depends(get_current_user)):
    try:
        check_query = "SELECT 1 AS S FROM content.PinSaves WHERE UserId = ? AND PinId = ?"
        already_saved = fetch_one(check_query, [user["UserId"], pin_id])
        if already_saved:
            execute_query("EXEC content.usp_UnsavePin @UserId = ?, @PinId = ?", [user["UserId"], pin_id])
            return {"status": "success", "message": "Pin unsaved", "saved": False}
        else:
            execute_query("EXEC content.usp_SavePin @UserId = ?, @PinId = ?, @BoardId = NULL", [user["UserId"], pin_id])
            return {"status": "success", "message": "Pin saved", "saved": True}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
