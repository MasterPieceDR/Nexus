from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from ..db.connection import fetch_one, execute_query
from ..seguridad.passwords import hash_password, verify_password
from ..seguridad.auth import create_access_token
from ..servicios.email_service import send_welcome_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(payload: UserCreate, background_tasks: BackgroundTasks):
    # Verificar si el correo ya existe
    existing_user = fetch_one("SELECT UserId FROM sec.Users WHERE Email = ?", [payload.email.lower()])
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El correo ya está registrado")

    # Si es el primer usuario, darle rol ADMIN
    count_query = fetch_one("SELECT COUNT(*) AS total FROM sec.Users")
    is_first = count_query["total"] == 0
    role_id = 1 if is_first else 2 # Asumiendo 1=ADMIN, 2=USER

    # Generar un Username por defecto basado en el email
    username = payload.email.lower().split('@')[0]
    full_name_combined = f"{payload.first_name.strip()} {payload.last_name.strip()}"

    query = """
    INSERT INTO sec.Users (DisplayName, FirstName, LastName, Email, Username, PasswordHash, RoleId, CreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
    """
    execute_query(query, [
        full_name_combined, 
        payload.first_name.strip(), 
        payload.last_name.strip(), 
        payload.email.lower(), 
        username, 
        hash_password(payload.password), 
        role_id
    ])
    
    # Recuperar el usuario recién insertado
    new_user = fetch_one("SELECT UserId, DisplayName, Email, RoleId FROM sec.Users WHERE Email = ?", [payload.email.lower()])
    
    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, new_user["Email"], new_user["DisplayName"])

    token = create_access_token(str(new_user["UserId"]))
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login")
def login(payload: LoginRequest):
    user = fetch_one("SELECT UserId, DisplayName, Email, PasswordHash, RoleId FROM sec.Users WHERE Email = ? AND DeletedAt IS NULL", [payload.email.lower()])

    if not user or not verify_password(payload.password, user["PasswordHash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")

    # Remove password hash before returning
    del user["PasswordHash"]

    token = create_access_token(str(user["UserId"]))
    return {"access_token": token, "token_type": "bearer", "user": user}
