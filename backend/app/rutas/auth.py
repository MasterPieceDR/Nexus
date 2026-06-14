import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status, BackgroundTasks, Request
from pydantic import BaseModel
from ..db.connection import fetch_one, execute_query
from ..seguridad.passwords import hash_password, verify_password
from ..seguridad.auth import create_access_token
from ..services.email_service import send_welcome_email, send_login_alert
from ..services.whatsapp_service import send_welcome_whatsapp

router = APIRouter(prefix="/api/auth", tags=["auth"])

ROLE_SUPER_ADMIN = 1
ROLE_USER = 5

USERNAME_RE = re.compile(r'^[a-zA-Z0-9_.\-]{3,20}$')

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: str
    password: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

def _unique_username(base: str) -> str:
    """Genera un username único derivado del email (para OAuth)."""
    username = re.sub(r'[^a-zA-Z0-9_.\-]', '_', base)[:18]
    suffix = 1
    candidate = username
    while fetch_one("SELECT 1 AS X FROM sec.Users WHERE Username = ?", [candidate.lower()]):
        suffix += 1
        candidate = f"{username}{suffix}"
    return candidate.lower()

@router.get("/check-username")
def check_username(username: str = Query(..., min_length=3, max_length=20)):
    if not USERNAME_RE.match(username):
        return {"available": False, "reason": "formato"}
    exists = fetch_one("SELECT 1 AS X FROM sec.Users WHERE Username = ?", [username.lower()])
    return {"available": not exists}

@router.post("/register")
def register(payload: UserCreate, background_tasks: BackgroundTasks):

    if not USERNAME_RE.match(payload.username):
        raise HTTPException(
            status_code=422,
            detail="El usuario solo puede contener letras, números, puntos, guiones y guiones bajos (3-20 caracteres)."
        )

    if fetch_one("SELECT 1 AS X FROM sec.Users WHERE Username = ?", [payload.username.lower()]):
        raise HTTPException(status_code=409, detail="El nombre de usuario ya está en uso.")

    if fetch_one("SELECT UserId FROM sec.Users WHERE Email = ?", [payload.email.lower()]):
        raise HTTPException(status_code=409, detail="El correo electrónico ya está registrado.")

    count_query = fetch_one("SELECT COUNT(*) AS total FROM sec.Users")
    is_first = count_query["total"] == 0
    role_id = ROLE_SUPER_ADMIN if is_first else ROLE_USER

    full_name_combined = f"{payload.first_name.strip()} {payload.last_name.strip()}"

    execute_query(
        "INSERT INTO sec.Users (DisplayName, FirstName, LastName, Email, Username, PasswordHash, RoleId, PhoneNumber, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE())",
        [
            full_name_combined,
            payload.first_name.strip(),
            payload.last_name.strip(),
            payload.email.lower(),
            payload.username.lower(),
            hash_password(payload.password),
            role_id,
            payload.phone.strip() if payload.phone else None,
        ]
    )

    new_user = fetch_one("SELECT UserId, DisplayName, Username, Email, RoleId FROM sec.Users WHERE Email = ?", [payload.email.lower()])

    background_tasks.add_task(send_welcome_email, new_user["Email"], new_user["DisplayName"], new_user["Username"])
    if payload.phone and payload.phone.strip():
        background_tasks.add_task(send_welcome_whatsapp, payload.phone.strip(), new_user["DisplayName"], new_user["UserId"])

    token = create_access_token(str(new_user["UserId"]))
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login")
def login(payload: LoginRequest, request: Request, background_tasks: BackgroundTasks):
    ip_address = request.client.host if request.client else "Unknown"
    user_agent = request.headers.get("user-agent", "Unknown")

    user = fetch_one("SELECT UserId, DisplayName, Email, PasswordHash, RoleId FROM sec.Users WHERE Email = ?", [payload.email.lower()])

    if not user or not verify_password(payload.password, user["PasswordHash"]):
        query_fail = """
        INSERT INTO sec.LoginEvents (UserId, ProviderCode, IpAddress, UserAgent, WasSuccessful, FailureReason, CreatedAt)
        VALUES (?, 'LOCAL', ?, ?, 0, 'Invalid credentials', GETDATE())
        """
        user_id_fail = user["UserId"] if user else None
        execute_query(query_fail, [user_id_fail, ip_address, user_agent])
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    query_success = """
    INSERT INTO sec.LoginEvents (UserId, ProviderCode, IpAddress, UserAgent, WasSuccessful, CreatedAt, EmailNotificationSent)
    VALUES (?, 'LOCAL', ?, ?, 1, GETDATE(), 1)
    """
    execute_query(query_success, [user["UserId"], ip_address, user_agent])

    background_tasks.add_task(send_login_alert, user["UserId"], user["Email"], user["DisplayName"], ip_address, user_agent)

    del user["PasswordHash"]

    token = create_access_token(str(user["UserId"]))
    return {"access_token": token, "token_type": "bearer", "user": user}
