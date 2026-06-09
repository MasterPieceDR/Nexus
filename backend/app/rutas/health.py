from fastapi import APIRouter, HTTPException
from app.db.connection import fetch_one

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("/db")
def check_database():
    try:
        result = fetch_one("SELECT DB_NAME() AS database_name, SYSDATETIME() AS server_time")
        return {
            "status": "ok",
            "database": result["database_name"],
            "server_time": str(result["server_time"])
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
