from fastapi import APIRouter, HTTPException, status, Request, BackgroundTasks
from pydantic import BaseModel
from ..db.connection import fetch_one, execute_query
from ..seguridad.auth import create_access_token
from ..services.email_service import send_login_alert, send_welcome_email

router = APIRouter(prefix="/api/auth/microsoft", tags=["auth", "microsoft"])

class MicrosoftLoginRequest(BaseModel):
    provider_id: str
    email: str
    display_name: str
    access_token: str

@router.post("/callback")
def microsoft_callback(payload: MicrosoftLoginRequest, request: Request, background_tasks: BackgroundTasks):
    ip_address = request.client.host if request.client else "Unknown"
    user_agent = request.headers.get("user-agent", "Unknown")

    try:
        user = fetch_one("SELECT UserId, DisplayName, Email, RoleId, Username FROM sec.Users WHERE Email = ?", [payload.email.lower()])
        is_new_user = user is None

        if is_new_user:
            base_username = payload.email.lower().split('@')[0]
            username = base_username
            # Garantizar unicidad del username
            suffix = 1
            while fetch_one("SELECT 1 AS X FROM sec.Users WHERE Username = ?", [username]):
                username = f"{base_username}{suffix}"
                suffix += 1

            execute_query(
                "INSERT INTO sec.Users (DisplayName, FirstName, LastName, Email, Username, RoleId, CreatedAt) VALUES (?, ?, '', ?, ?, 2, GETDATE())",
                [payload.display_name, payload.display_name, payload.email.lower(), username],
            )
            user = fetch_one("SELECT UserId, DisplayName, Email, RoleId, Username FROM sec.Users WHERE Email = ?", [payload.email.lower()])

        provider_query = fetch_one("SELECT ProviderId FROM sec.AuthProviders WHERE ProviderName = 'MICROSOFT'")
        if provider_query:
            provider_id = provider_query["ProviderId"]
            ext_login = fetch_one("SELECT * FROM sec.UserExternalLogins WHERE UserId = ? AND ProviderId = ?", [user["UserId"], provider_id])
            if not ext_login:
                execute_query(
                    "INSERT INTO sec.UserExternalLogins (UserId, ProviderId, ProviderKey, ProviderEmail, ProviderDisplayName, CreatedAt, LastLoginAt) VALUES (?, ?, ?, ?, ?, GETDATE(), GETDATE())",
                    [user["UserId"], provider_id, payload.provider_id, payload.email, payload.display_name],
                )
            else:
                execute_query("UPDATE sec.UserExternalLogins SET LastLoginAt = GETDATE() WHERE UserId = ? AND ProviderId = ?", [user["UserId"], provider_id])

        execute_query(
            "INSERT INTO sec.LoginEvents (UserId, ProviderCode, IpAddress, UserAgent, WasSuccessful, CreatedAt, EmailNotificationSent) VALUES (?, 'MICROSOFT', ?, ?, 1, GETDATE(), 1)",
            [user["UserId"], ip_address, user_agent],
        )

        if is_new_user:
            background_tasks.add_task(send_welcome_email, user["Email"], user["DisplayName"], user.get("Username", ""))
        else:
            background_tasks.add_task(send_login_alert, user["UserId"], user["Email"], user["DisplayName"], ip_address, user_agent, "MICROSOFT")

        token = create_access_token(str(user["UserId"]))
        return {"access_token": token, "token_type": "bearer", "user": user}

    except Exception as e:
        try:
            execute_query(
                "INSERT INTO sec.LoginEvents (UserId, ProviderCode, IpAddress, UserAgent, WasSuccessful, FailureReason, CreatedAt) VALUES (NULL, 'MICROSOFT', ?, ?, 0, ?, GETDATE())",
                [ip_address, user_agent, str(e)],
            )
        except Exception:
            pass
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
