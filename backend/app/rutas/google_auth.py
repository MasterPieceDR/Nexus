from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from ..db.connection import fetch_one
from ..seguridad.auth import create_access_token
from ..servicios.email_service import send_welcome_email
from ..config import settings

router = APIRouter(prefix="/api/auth/google", tags=["google_auth"])

class GoogleToken(BaseModel):
    id_token: str

@router.post("")
def google_login(payload: GoogleToken, background_tasks: BackgroundTasks):
    try:
        # Validate Google token
        idinfo = id_token.verify_oauth2_token(
            payload.id_token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo["email"]
        display_name = idinfo.get("name", "")
        google_sub = idinfo["sub"]
        avatar_url = idinfo.get("picture", "")

        # Check if user already exists
        existing_user = fetch_one("SELECT UserId FROM sec.Users WHERE Email = ?", [email])
        is_new_user = existing_user is None

        query = """
        DECLARE @UserId INT;
        DECLARE @DisplayName NVARCHAR(100);
        DECLARE @Email NVARCHAR(255);
        DECLARE @Username NVARCHAR(50);
        DECLARE @RoleId INT;
        DECLARE @RoleName NVARCHAR(50);

        EXEC sec.usp_LoginWithGoogle
            @ProviderKey = ?,
            @Email = ?,
            @DisplayName = ?,
            @AvatarUrl = ?,
            @UserId = @UserId OUTPUT,
            @OutDisplayName = @DisplayName OUTPUT,
            @OutEmail = @Email OUTPUT,
            @OutUsername = @Username OUTPUT,
            @OutRoleId = @RoleId OUTPUT,
            @OutRoleName = @RoleName OUTPUT;
            
        SELECT 
            @UserId as UserId, 
            @DisplayName as DisplayName, 
            @Email as Email, 
            @Username as Username, 
            @RoleId as RoleId, 
            @RoleName as RoleName,
            ? as AvatarUrl;
        """
        
        user_info = fetch_one(query, [
            google_sub, 
            email, 
            display_name, 
            avatar_url,
            avatar_url
        ])

        if not user_info or not user_info.get("UserId"):
            raise HTTPException(status_code=400, detail="Could not create or fetch user from Google login")

        if is_new_user:
            background_tasks.add_task(send_welcome_email, user_info["Email"], user_info["DisplayName"])

        access_token = create_access_token(str(user_info["UserId"]))
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "UserId": user_info["UserId"],
                "DisplayName": user_info["DisplayName"],
                "Email": user_info["Email"],
                "Username": user_info["Username"],
                "RoleId": user_info["RoleId"],
                "RoleName": user_info["RoleName"],
                "AvatarUrl": user_info["AvatarUrl"]
            }
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
