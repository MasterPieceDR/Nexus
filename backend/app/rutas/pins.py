from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional
from app.db.connection import fetch_all, fetch_one, execute_query, execute_query
from app.seguridad.dependencies import get_current_user

router = APIRouter(prefix="/api/pins", tags=["Pins"])


@router.get("/feed")
def get_feed(page: int = Query(1, ge=1), size: int = Query(30, ge=1, le=100)):
    try:
        query = """
        EXEC content.usp_GetFeed 
            @ViewerUserId = ?, 
            @PageNumber = ?, 
            @PageSize = ?
        """
        return fetch_all(query, [None, page, size])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/search")
def search_pins(
    search: str = None, 
    category_id: int = None, 
    tag_slug: str = None, 
    page: int = Query(1, ge=1), 
    size: int = Query(30, ge=1, le=100)
):
    try:
        query = """
        EXEC content.usp_SearchPins 
            @Search = ?, 
            @CategoryId = ?, 
            @TagSlug = ?, 
            @ViewerUserId = ?, 
            @PageNumber = ?, 
            @PageSize = ?
        """
        return fetch_all(query, [search, category_id, tag_slug, None, page, size])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/{pin_id}")
def get_pin_detail(pin_id: int):
    try:
        query = """
        SELECT 
            p.PinId,
            p.Title,
            p.Description,
            p.SavesCount,
            p.CommentsCount,
            p.ReactionsCount,
            p.ViewsCount,
            p.PublishedAt,
            p.State,
            m.MediaUrl,
            m.MediaKind,
            u.DisplayName AS AuthorName
        FROM content.Pins p
        LEFT JOIN content.MediaAssets m ON p.MediaAssetId = m.MediaAssetId
        LEFT JOIN sec.Users u ON p.CreatedBy = u.UserId
        WHERE p.PinId = ?
        """
        pin = fetch_one(query, [pin_id])

        if pin is None:
            raise HTTPException(status_code=404, detail="Publicación no encontrada")

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
            c.Content,
            c.CreatedAt,
            u.DisplayName AS author_name
        FROM content.Comments c
        JOIN sec.Users u ON c.UserId = u.UserId
        WHERE c.PinId = ? AND c.IsActive = 1
        ORDER BY c.CreatedAt DESC
        """
        return fetch_all(query, [pin_id])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

class PinCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: int
    tags: Optional[str] = None
    s3_key: str
    media_type: str

@router.post("")
def create_pin(payload: PinCreate, user: dict = Depends(get_current_user)):
    try:
        media_url = f"/static/{payload.s3_key}"
        media_kind = "VIDEO" if "video" in payload.media_type.lower() else "IMAGE"
        
        # Insert MediaAsset
        media_query = """
        INSERT INTO content.MediaAssets (UserId, MediaUrl, MediaKind)
        OUTPUT INSERTED.MediaAssetId
        VALUES (?, ?, ?)
        """
        media_asset = fetch_one(media_query, [user["UserId"], media_url, media_kind])
        media_asset_id = media_asset["MediaAssetId"]

        # Insert Pin
        pin_query = """
        INSERT INTO content.Pins (MediaAssetId, CreatedBy, CategoryId, Title, Description, State, PublishedAt)
        OUTPUT INSERTED.PinId
        VALUES (?, ?, ?, ?, ?, 'PENDING_REVIEW', NULL)
        """
        pin = fetch_one(pin_query, [
            media_asset_id,
            user["UserId"],
            payload.category_id,
            payload.title,
            payload.description
        ])
        
        return {"status": "success", "pin_id": pin["PinId"]}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

class PinStatusUpdate(BaseModel):
    status: str  # 'APPROVED' or 'REJECTED'

@router.patch("/{pin_id}/status")
def update_pin_status(pin_id: int, payload: PinStatusUpdate, user: dict = Depends(get_current_user)):
    # Mechanism 3: Restricción de acceso (Solo Administradores pueden aprobar)
    if user.get("RoleId") != 1:
        raise HTTPException(status_code=403, detail="No tienes permisos para moderar contenido")
    
    if payload.status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Estado inválido. Use APPROVED o REJECTED")

    try:
        query = """
        UPDATE content.Pins
        SET State = ?, PublishedAt = CASE WHEN ? = 'APPROVED' THEN GETDATE() ELSE NULL END
        WHERE PinId = ?
        """
        execute_query(query, [payload.status, payload.status, pin_id])
        return {"status": "success", "message": f"Pin status updated to {payload.status}"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


