from fastapi import APIRouter, Depends, HTTPException
from ..db.connection import fetch_all
from ..seguridad.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    # We strip sensitive info if needed, but user dict already lacks password
    return user

@router.get("/me/pins")
def get_my_pins(user: dict = Depends(get_current_user)):
    try:
        query = """
        SELECT 
            p.PinId,
            p.Title,
            p.Description,
            p.Status as State,
            p.PublishedAt,
            m.MediaUrl,
            m.MediaKind
        FROM content.Pins p
        LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId
        LEFT JOIN content.MediaAssets m ON pm.MediaId = m.MediaId
        WHERE p.OwnerUserId = ?
        ORDER BY p.CreatedAt DESC
        """
        return fetch_all(query, [user["UserId"]])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
