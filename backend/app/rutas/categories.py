from fastapi import APIRouter, HTTPException
from ..db.connection import fetch_all

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("")
def list_categories():
    try:
        query = """
        SELECT CategoryId as id, Name as name, Slug as slug
        FROM core.Categories
        WHERE IsActive = 1
        ORDER BY SortOrder ASC, Name ASC;
    """
        return fetch_all(query)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
