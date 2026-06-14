from fastapi import Depends, Header, HTTPException, status
from ..db.connection import fetch_one
from .auth import decode_access_token

# Roles del sistema (sec.Roles)
ROLE_SUPER_ADMIN = 1
ROLE_ADMIN = 2
ROLE_MODERATOR = 3
ADMIN_ROLES = (ROLE_SUPER_ADMIN, ROLE_ADMIN)
MODERATOR_ROLES = (ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_MODERATOR)

_USER_QUERY = """
SELECT UserId, DisplayName, Username, Email, RoleId, PhoneNumber
FROM sec.Users
WHERE UserId = ? AND DeletedAt IS NULL
"""

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

    user = fetch_one(_USER_QUERY, [int(subject)])

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no disponible")

    return user

def get_optional_user(authorization: str | None = Header(default=None)) -> dict | None:
    token = extract_token(authorization)
    subject = decode_access_token(token) if token else None

    if not subject:
        return None

    try:
        return fetch_one(_USER_QUERY, [int(subject)])
    except Exception:
        return None

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["RoleId"] not in ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso insuficiente")
    return user

def require_moderator(user: dict = Depends(get_current_user)) -> dict:
    if user["RoleId"] not in MODERATOR_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso insuficiente")
    return user
