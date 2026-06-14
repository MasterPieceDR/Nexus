from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from ..db.connection import fetch_one
from ..seguridad.auth import create_access_token
from ..services.email_service import send_welcome_email, send_login_alert
from ..config import settings

router = APIRouter(prefix="/api/auth/google", tags=["google_auth"])

class GoogleToken(BaseModel):
    id_token: str

@router.post("")
def google_login(payload: GoogleToken, request: Request, background_tasks: BackgroundTasks):
    try:
        # Validate Google token
        idinfo = id_token.verify_oauth2_token(
            payload.id_token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo["email"]
        display_name = idinfo.get("name", "")
        google_sub = idinfo["sub"]
        avatar_url = idinfo.get("picture", "")

        ip_address = request.client.host if request.client else "Unknown"
        user_agent = request.headers.get("user-agent", "Unknown")

        # Check if user already exists
        existing_user = fetch_one("SELECT UserId FROM sec.Users WHERE Email = ?", [email])
        is_new_user = existing_user is None

        query = """
        DECLARE @UserId BIGINT;

        EXEC sec.usp_LoginWithGoogle
            @GoogleSub = ?,
            @Email = ?,
            @EmailVerified = 1,
            @DisplayName = ?,
            @AvatarUrl = ?,
            @IpAddress = ?,
            @UserAgent = ?,
            @UserId = @UserId OUTPUT;
            
        SELECT 
            u.UserId, 
            u.DisplayName, 
            u.Email, 
            u.Username, 
            u.RoleId, 
            r.RoleName,
            p.AvatarUrl
        FROM sec.Users u
        JOIN sec.Roles r ON u.RoleId = r.RoleId
        LEFT JOIN sec.UserProfiles p ON u.UserId = p.UserId
        WHERE u.UserId = @UserId;
        """
        
        user_info = fetch_one(query, [
            google_sub, 
            email, 
            display_name, 
            avatar_url,
            ip_address,
            user_agent
        ])

        if not user_info or not user_info.get("UserId"):
            raise HTTPException(status_code=400, detail="Could not create or fetch user from Google login")

        if is_new_user:
            background_tasks.add_task(
                send_welcome_email,
                user_info["Email"],
                user_info["DisplayName"],
                user_info.get("Username", ""),
            )
        else:
            background_tasks.add_task(
                send_login_alert,
                user_info["UserId"],
                user_info["Email"],
                user_info["DisplayName"],
                ip_address,
                user_agent,
                "GOOGLE",
            )

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
