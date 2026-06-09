from fastapi import Depends, Header, HTTPException, status
from ..db.connection import fetch_one
from .auth import decode_access_token

def extract_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]

def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    token = extract_token(authorization)
    subject = decode_access_token(token) if token else None

    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida")

    user = fetch_one("SELECT UserId, DisplayName, Email, RoleId FROM sec.Users WHERE UserId = ? AND DeletedAt IS NULL", [int(subject)])

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no disponible")

    return user

def get_optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    token = extract_token(authorization)
    subject = decode_access_token(token) if token else None

    if not subject:
        return None

    return fetch_one("SELECT UserId, DisplayName, Email, RoleId FROM sec.Users WHERE UserId = ? AND IsActive = 1", [int(subject)])

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["RoleId"] != 1:  # Assuming 1 is ADMIN
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso insuficiente")
    return user
