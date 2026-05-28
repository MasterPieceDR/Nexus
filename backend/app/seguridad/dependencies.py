from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User
from .auth import decode_access_token


def extract_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]


def get_current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    token = extract_token(authorization)
    subject = decode_access_token(token) if token else None

    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida")

    user = db.query(User).filter(User.id == int(subject), User.is_active == True).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no disponible")

    return user


def get_optional_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User | None:
    token = extract_token(authorization)
    subject = decode_access_token(token) if token else None

    if not subject:
        return None

    return db.query(User).filter(User.id == int(subject), User.is_active == True).first()


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso insuficiente")
    return user
