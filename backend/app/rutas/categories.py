from fastapi import APIRouter, HTTPException
from ..db.connection import fetch_all

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("")
def list_categories():
    try:
        query = """
        SELECT CategoryId as id, Name as name, Slug as slug 
        FROM content.Categories 
        ORDER BY Name ASC
        """
        return fetch_all(query)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
