from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from ..db.connection import fetch_one, execute_query
from ..seguridad.passwords import hash_password, verify_password
from ..seguridad.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(payload: UserCreate):
    # Verificar si el correo ya existe
    existing_user = fetch_one("SELECT UserId FROM sec.Users WHERE Email = ?", [payload.email.lower()])
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado")

    # Si es el primer usuario, darle rol ADMIN
    count_query = fetch_one("SELECT COUNT(*) AS total FROM sec.Users")
    is_first = count_query["total"] == 0
    role_id = 1 if is_first else 2 # Asumiendo 1=ADMIN, 2=USER

    query = """
    INSERT INTO sec.Users (DisplayName, Email, PasswordHash, RoleId, IsActive, CreatedAt)
    VALUES (?, ?, ?, ?, 1, GETDATE())
    """
    execute_query(query, [payload.full_name.strip(), payload.email.lower(), hash_password(payload.password), role_id])
    
    # Recuperar el usuario recién insertado
    new_user = fetch_one("SELECT UserId, DisplayName, Email, RoleId FROM sec.Users WHERE Email = ?", [payload.email.lower()])
    
    token = create_access_token(str(new_user["UserId"]))
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login")
def login(payload: LoginRequest):
    user = fetch_one("SELECT UserId, DisplayName, Email, PasswordHash, RoleId FROM sec.Users WHERE Email = ? AND IsActive = 1", [payload.email.lower()])

    if not user or not verify_password(payload.password, user["PasswordHash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

    # Remove password hash before returning
    del user["PasswordHash"]

    token = create_access_token(str(user["UserId"]))
    return {"access_token": token, "token_type": "bearer", "user": user}
