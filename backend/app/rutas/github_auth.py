import logging
from fastapi import APIRouter, HTTPException, status, Request, BackgroundTasks
from pydantic import BaseModel
import requests as http_requests
from ..db.connection import fetch_one, execute_query
from ..seguridad.auth import create_access_token
from ..services.email_service import send_login_alert, send_welcome_email
from ..config import settings

router = APIRouter(prefix="/api/auth/github", tags=["auth", "github"])
logger = logging.getLogger("nexus.github_auth")

class GitHubCallbackRequest(BaseModel):
    code: str
    client_id: str | None = None

@router.post("/callback")
def github_callback(payload: GitHubCallbackRequest, request: Request, background_tasks: BackgroundTasks):
    ip_address = request.client.host if request.client else "Unknown"
    user_agent = request.headers.get("user-agent", "Unknown")

    known_apps = {
        settings.GITHUB_CLIENT_ID: settings.GITHUB_CLIENT_SECRET,
        settings.GITHUB_CLIENT_ID_HTTPS: settings.GITHUB_CLIENT_SECRET_HTTPS,
    }
    client_id = payload.client_id or settings.GITHUB_CLIENT_ID
    client_secret = known_apps.get(client_id)
    if not client_id or not client_secret:
        raise HTTPException(status_code=400, detail="Aplicación de GitHub no reconocida.")

    try:
        token_res = http_requests.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": payload.code,
            },
            headers={"Accept": "application/json"},
            timeout=10,
        )
        token_data = token_res.json()
    except Exception as e:
        logger.error("Error al contactar GitHub OAuth: %s", e)
        raise HTTPException(status_code=502, detail="No se pudo conectar con GitHub. Intenta de nuevo.")

    access_token = token_data.get("access_token")
    if not access_token:
        gh_error = token_data.get("error", "unknown")
        gh_desc  = token_data.get("error_description", "")
        logger.error("GitHub token error: %s — %s", gh_error, gh_desc)
        raise HTTPException(status_code=400, detail=f"Autorización de GitHub rechazada: {gh_error}. Inténtalo de nuevo.")

    try:
        gh_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
        }
        gh_user    = http_requests.get("https://api.github.com/user",        headers=gh_headers, timeout=10).json()
        emails_raw = http_requests.get("https://api.github.com/user/emails", headers=gh_headers, timeout=10).json()
    except Exception as e:
        logger.error("Error al obtener perfil de GitHub: %s", e)
        raise HTTPException(status_code=502, detail="No se pudo obtener tu perfil de GitHub.")

    primary_email = next(
        (e["email"] for e in emails_raw if isinstance(e, dict) and e.get("primary") and e.get("verified")),
        gh_user.get("email"),
    )
    if not primary_email:
        raise HTTPException(status_code=400, detail="Tu cuenta de GitHub no tiene un email verificado público. Agrégalo en github.com/settings/emails.")

    provider_user_id = str(gh_user["id"])
    display_name     = gh_user.get("name") or gh_user.get("login") or primary_email.split("@")[0]
    gh_login         = (gh_user.get("login") or primary_email.split("@")[0])[:18].lower()

    logger.info("GitHub login: %s (%s)", primary_email, display_name)

    try:
        user = fetch_one(
            "SELECT UserId, DisplayName, Email, RoleId, Username FROM sec.Users WHERE Email = ?",
            [primary_email.lower()],
        )
        is_new_user = user is None

        if is_new_user:
            username = gh_login
            suffix   = 1
            while fetch_one("SELECT 1 AS X FROM sec.Users WHERE Username = ?", [username]):
                username = f"{gh_login[:16]}{suffix}"
                suffix  += 1

            execute_query(
                """
                INSERT INTO sec.Users (DisplayName, FirstName, LastName, Email, Username, RoleId, CreatedAt)
                VALUES (?, ?, '', ?, ?, 2, GETDATE())
                """,
                [display_name, display_name, primary_email.lower(), username],
            )
            user = fetch_one(
                "SELECT UserId, DisplayName, Email, RoleId, Username FROM sec.Users WHERE Email = ?",
                [primary_email.lower()],
            )
    except Exception as e:
        logger.error("Error al crear/buscar usuario GitHub en BD: %s", e)
        raise HTTPException(status_code=500, detail=f"Error de base de datos al registrar usuario: {e}")

    try:
        provider_row = fetch_one("SELECT ProviderId FROM sec.AuthProviders WHERE ProviderName = 'GITHUB'")
        if provider_row:
            pid = provider_row["ProviderId"]
            ext = fetch_one(
                "SELECT ExternalLoginId FROM sec.UserExternalLogins WHERE UserId = ? AND ProviderId = ?",
                [user["UserId"], pid],
            )
            if not ext:
                execute_query(
                    """
                    INSERT INTO sec.UserExternalLogins
                        (UserId, ProviderId, ProviderKey, ProviderEmail, ProviderDisplayName, CreatedAt, LastLoginAt)
                    VALUES (?, ?, ?, ?, ?, GETDATE(), GETDATE())
                    """,
                    [user["UserId"], pid, provider_user_id, primary_email, display_name],
                )
            else:
                execute_query(
                    "UPDATE sec.UserExternalLogins SET LastLoginAt = GETDATE() WHERE UserId = ? AND ProviderId = ?",
                    [user["UserId"], pid],
                )
    except Exception as e:
        logger.warning("No se pudo registrar login externo GitHub (no crítico): %s", e)

    try:
        execute_query(
            """
            INSERT INTO sec.LoginEvents
                (UserId, ProviderCode, IpAddress, UserAgent, WasSuccessful, CreatedAt, EmailNotificationSent)
            VALUES (?, 'GITHUB', ?, ?, 1, GETDATE(), 1)
            """,
            [user["UserId"], ip_address, user_agent],
        )
    except Exception as e:
        logger.warning("No se pudo registrar LoginEvent GitHub (no crítico): %s", e)

    try:
        if is_new_user:
            background_tasks.add_task(send_welcome_email, user["Email"], user["DisplayName"], user.get("Username", ""))
        else:
            background_tasks.add_task(send_login_alert, user["UserId"], user["Email"], user["DisplayName"], ip_address, user_agent, "GITHUB")
    except Exception as e:
        logger.warning("No se pudo encolar email GitHub (no crítico): %s", e)

    token = create_access_token(str(user["UserId"]))
    return {"access_token": token, "token_type": "bearer", "user": user}
