import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from ..db.connection import fetch_all, fetch_one, execute_query
from ..seguridad.dependencies import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/api/users", tags=["users"])

def _parse_device(user_agent: str) -> str:
    """Parse a User-Agent string into a human-readable device label."""
    if not user_agent:
        return "Dispositivo desconocido"
    ua = user_agent.lower()
    if "iphone" in ua:
        return "iPhone"
    if "ipad" in ua:
        return "iPad"
    if "android" in ua and "mobile" in ua:
        return "Android (móvil)"
    if "android" in ua:
        return "Android (tablet)"
    if "windows" in ua:
        return "PC Windows"
    if "macintosh" in ua or "mac os x" in ua:
        return "Mac"
    if "linux" in ua:
        return "Linux"
    return "Navegador"

def _format_date(dt_val) -> str:
    """Return a locale-friendly datetime string."""
    if dt_val is None:
        return "fecha desconocida"
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val)
        except ValueError:
            return dt_val
    return dt_val.strftime("%d/%m/%Y %H:%M")

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    # We strip sensitive info if needed, but user dict already lacks password
    return user


# ── Perfil editable (datos personales + campos profesionales/empresa) ─────────

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    website_url: Optional[str] = None
    location_name: Optional[str] = None
    # Campos profesionales / empresa
    is_company: Optional[bool] = None
    company_name: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    professional_area: Optional[str] = None
    company_description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


@router.get("/me/profile")
def get_my_profile(user: dict = Depends(get_current_user)):
    try:
        profile = fetch_one(
            """
            SELECT u.UserId, u.DisplayName, u.Username, u.Email, u.RoleId, u.PhoneNumber,
                   p.Bio, p.WebsiteUrl, p.LocationName, p.AvatarUrl,
                   p.IsCompany, p.CompanyName, p.Mission, p.Vision,
                   p.ProfessionalArea, p.CompanyDescription, p.ContactEmail, p.ContactPhone
            FROM sec.Users u
            LEFT JOIN sec.UserProfiles p ON p.UserId = u.UserId
            WHERE u.UserId = ? AND u.DeletedAt IS NULL
            """,
            [user["UserId"]],
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Perfil no encontrado")
        return profile
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.put("/me/profile")
def update_my_profile(payload: ProfileUpdate, user: dict = Depends(get_current_user)):
    try:
        # 1. Datos base del usuario (nombre visible y username)
        if payload.display_name is not None and payload.display_name.strip():
            execute_query(
                "UPDATE sec.Users SET DisplayName = ?, UpdatedAt = SYSDATETIME() WHERE UserId = ?",
                [payload.display_name.strip()[:100], user["UserId"]],
            )
        if payload.username is not None and payload.username.strip():
            new_username = payload.username.strip().lower()[:50]
            taken = fetch_one(
                "SELECT 1 AS X FROM sec.Users WHERE Username = ? AND UserId <> ?",
                [new_username, user["UserId"]],
            )
            if taken:
                raise HTTPException(status_code=409, detail="Ese nombre de usuario ya está en uso")
            execute_query(
                "UPDATE sec.Users SET Username = ?, UpdatedAt = SYSDATETIME() WHERE UserId = ?",
                [new_username, user["UserId"]],
            )

        # 2. Perfil extendido (upsert en sec.UserProfiles)
        execute_query(
            """
            MERGE sec.UserProfiles AS target
            USING (SELECT ? AS UserId) AS source
            ON target.UserId = source.UserId
            WHEN MATCHED THEN UPDATE SET
                Bio = COALESCE(?, target.Bio),
                WebsiteUrl = COALESCE(?, target.WebsiteUrl),
                LocationName = COALESCE(?, target.LocationName),
                AvatarUrl = COALESCE(?, target.AvatarUrl),
                IsCompany = COALESCE(?, target.IsCompany),
                CompanyName = COALESCE(?, target.CompanyName),
                Mission = COALESCE(?, target.Mission),
                Vision = COALESCE(?, target.Vision),
                ProfessionalArea = COALESCE(?, target.ProfessionalArea),
                CompanyDescription = COALESCE(?, target.CompanyDescription),
                ContactEmail = COALESCE(?, target.ContactEmail),
                ContactPhone = COALESCE(?, target.ContactPhone),
                UpdatedAt = SYSDATETIME()
            WHEN NOT MATCHED THEN
                INSERT (UserId, Bio, WebsiteUrl, LocationName, AvatarUrl, IsCompany, CompanyName,
                        Mission, Vision, ProfessionalArea, CompanyDescription, ContactEmail, ContactPhone)
                VALUES (?, ?, ?, ?, ?, COALESCE(?, 0), ?, ?, ?, ?, ?, ?, ?);
            """,
            [
                user["UserId"],
                payload.bio, payload.website_url, payload.location_name, payload.avatar_url,
                payload.is_company, payload.company_name, payload.mission, payload.vision,
                payload.professional_area, payload.company_description,
                payload.contact_email, payload.contact_phone,
                user["UserId"],
                payload.bio, payload.website_url, payload.location_name, payload.avatar_url,
                payload.is_company, payload.company_name, payload.mission, payload.vision,
                payload.professional_area, payload.company_description,
                payload.contact_email, payload.contact_phone,
            ],
        )

        # 3. Auditoría
        execute_query(
            """
            EXEC audit.usp_WriteAuditLog
                @ActorUserId = ?, @ActionName = N'PROFILE_UPDATE',
                @EntityName = N'sec.UserProfiles', @EntityId = ?, @NewData = NULL
            """,
            [user["UserId"], user["UserId"]],
        )

        return get_my_profile(user)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/me/notifications")
def get_my_notifications(user: dict = Depends(get_current_user)):
    """Return the last 15 login events formatted as security notifications."""
    try:
        query = """
        SELECT TOP 15
            ProviderCode,
            IpAddress,
            UserAgent,
            WasSuccessful,
            CreatedAt
        FROM sec.LoginEvents
        WHERE UserId = ?
        ORDER BY CreatedAt DESC
        """
        rows = fetch_all(query, [user["UserId"]])

        notifications = []

        # Static welcome / system notification first
        notifications.append({
            "id": "sys-0",
            "type": "system",
            "icon": "shield",
            "title": "Bienvenido a Nexus",
            "body": "Tu historial de acceso está protegido. Revisa cualquier inicio de sesión sospechoso.",
            "date": _format_date(datetime.now(timezone.utc)),
            "isRead": True,
        })

        for i, row in enumerate(rows):
            provider = str(row.get("ProviderCode") or "local").lower()
            ip = row.get("IpAddress") or "IP desconocida"
            device = _parse_device(row.get("UserAgent") or "")
            success = row.get("WasSuccessful", 1)
            date_str = _format_date(row.get("CreatedAt"))

            if provider == "google":
                provider_label = "Google"
                icon = "google"
            else:
                provider_label = "contraseña"
                icon = "key"

            if success:
                notif_type = "success"
                title = f"Inicio de sesión exitoso"
                body = f"Acceso con {provider_label} desde {device} · {ip} · {date_str}"
            else:
                notif_type = "warning"
                title = "Intento de acceso fallido"
                body = f"Se intentó ingresar con {provider_label} desde {device} · {ip} · {date_str}"

            notifications.append({
                "id": f"login-{i}",
                "type": notif_type,
                "icon": icon,
                "title": title,
                "body": body,
                "date": date_str,
                "isRead": i > 0,  # Mark only the most recent as unread
            })

        return notifications
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/me/pins")
def get_my_pins(user: dict = Depends(get_current_user)):
    try:
        query = """
        SELECT
            p.PinId,
            p.OwnerUserId,
            p.Title,
            p.Description,
            p.Status as State,
            p.CreatedAt,
            p.PublishedAt,
            p.SavesCount,
            p.ReactionsCount,
            p.ViewsCount,
            m.MediaUrl,
            m.MediaKind,
            p.CategoryId,
            p.SourceUrl
        FROM content.Pins p
        LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId
        LEFT JOIN content.MediaAssets m ON pm.MediaId = m.MediaId
        WHERE p.OwnerUserId = ? AND p.DeletedAt IS NULL
        ORDER BY p.CreatedAt DESC
        """
        return fetch_all(query, [user["UserId"]])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/me/saved")
def get_my_saved_pins(user: dict = Depends(get_current_user)):
    """Return all pins saved/bookmarked by the current user."""
    try:
        query = """
        SELECT
            p.PinId,
            p.Title,
            p.Description,
            p.PublishedAt,
            p.SavesCount,
            p.ReactionsCount,
            p.ViewsCount,
            m.MediaUrl,
            m.MediaKind,
            u.DisplayName,
            u.Username
        FROM content.PinSaves ps
        JOIN content.Pins p ON ps.PinId = p.PinId
        LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId
        LEFT JOIN content.MediaAssets m ON pm.MediaId = m.MediaId
        LEFT JOIN sec.Users u ON p.OwnerUserId = u.UserId
        WHERE ps.UserId = ? AND p.DeletedAt IS NULL
        ORDER BY ps.CreatedAt DESC
        """
        return fetch_all(query, [user["UserId"]])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@router.get("/me/liked")
def get_my_liked_pins(user: dict = Depends(get_current_user)):
    """Return all pins liked by the current user."""
    try:
        query = """
        SELECT
            p.PinId,
            p.Title,
            p.Description,
            p.PublishedAt,
            p.SavesCount,
            p.ReactionsCount,
            p.ViewsCount,
            m.MediaUrl,
            m.MediaKind,
            u.DisplayName,
            u.Username
        FROM content.PinReactions pr
        JOIN content.Pins p ON pr.PinId = p.PinId
        LEFT JOIN content.PinMedia pm ON p.PinId = pm.PinId
        LEFT JOIN content.MediaAssets m ON pm.MediaId = m.MediaId
        LEFT JOIN sec.Users u ON p.OwnerUserId = u.UserId
        WHERE pr.UserId = ? AND pr.ReactionType = 'LIKE' AND p.DeletedAt IS NULL
        ORDER BY pr.CreatedAt DESC
        """
        return fetch_all(query, [user["UserId"]])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

class FeedbackPayload(BaseModel):
    rating: int
    comment: str

@router.post("/feedback")
def submit_feedback(payload: FeedbackPayload, user: dict = Depends(get_current_user)):
    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=400, detail="La calificación debe estar entre 1 y 5 estrellas")
    try:
        execute_query(
            "INSERT INTO core.AppRatings (UserId, Rating, Comment) VALUES (?, ?, ?)",
            [user["UserId"], payload.rating, (payload.comment or "").strip()[:1000] or None],
        )
        return {"status": "success", "message": "Valoración registrada. ¡Gracias!"}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ── Búsqueda de usuarios (pública) ───────────────────────────────────────────

@router.get("/search")
def search_users(q: str = Query(..., min_length=2, max_length=50)):
    try:
        pattern = f"%{q}%"
        results = fetch_all(
            """
            SELECT TOP 15
                u.UserId, u.Username, u.DisplayName,
                p.AvatarUrl, p.Bio, p.IsCompany, p.CompanyName
            FROM sec.Users u
            LEFT JOIN sec.UserProfiles p ON p.UserId = u.UserId
            WHERE u.DeletedAt IS NULL
              AND u.AccountStatus = N'ACTIVE'
              AND (u.Username LIKE ? OR u.DisplayName LIKE ?)
            ORDER BY
                CASE WHEN LOWER(u.Username) = LOWER(?) THEN 0
                     WHEN LOWER(u.Username) LIKE LOWER(?) THEN 1
                     ELSE 2 END,
                u.DisplayName
            """,
            [pattern, pattern, q, f"{q}%"],
        )
        return results
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ── Upload de avatar ──────────────────────────────────────────────────────────

AVATAR_ALLOWED = {"image/jpeg", "image/png", "image/webp"}
AVATAR_MAX_MB  = 5

@router.post("/me/avatar")
async def upload_avatar(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if file.content_type not in AVATAR_ALLOWED:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPG, PNG o WEBP.")
    contents = await file.read()
    if len(contents) > AVATAR_MAX_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"La imagen debe pesar menos de {AVATAR_MAX_MB} MB.")

    ext      = (file.filename or "avatar.jpg").rsplit(".", 1)[-1].lower()
    filename = f"{user['UserId']}_{uuid.uuid4().hex[:10]}.{ext}"
    os.makedirs("static/uploads/avatars", exist_ok=True)
    with open(os.path.join("static/uploads/avatars", filename), "wb") as f:
        f.write(contents)

    avatar_url = f"/static/uploads/avatars/{filename}"
    execute_query(
        """
        MERGE sec.UserProfiles AS t
        USING (SELECT ? AS UserId) AS s ON t.UserId = s.UserId
        WHEN MATCHED     THEN UPDATE SET AvatarUrl = ?, UpdatedAt = SYSDATETIME()
        WHEN NOT MATCHED THEN INSERT (UserId, AvatarUrl) VALUES (?, ?);
        """,
        [user["UserId"], avatar_url, user["UserId"], avatar_url],
    )
    return {"avatar_url": avatar_url}


# ── Perfil público (sin autenticación requerida) ──────────────────────────────

@router.get("/{user_id}/public")
def get_public_profile(user_id: int):
    try:
        profile = fetch_one(
            """
            SELECT
                u.UserId, u.Username, u.DisplayName,
                p.Bio, p.WebsiteUrl, p.LocationName, p.AvatarUrl,
                p.IsCompany, p.CompanyName, p.ProfessionalArea,
                (SELECT COUNT(*) FROM content.Pins
                 WHERE OwnerUserId = u.UserId AND Status = N'APPROVED' AND DeletedAt IS NULL) AS PinsCount
            FROM sec.Users u
            LEFT JOIN sec.UserProfiles p ON p.UserId = u.UserId
            WHERE u.UserId = ? AND u.DeletedAt IS NULL AND u.AccountStatus = N'ACTIVE'
            """,
            [user_id],
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return profile
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/{user_id}/pins")
def get_user_public_pins(user_id: int, page: int = 1, size: int = 30):
    try:
        offset = (page - 1) * size
        pins = fetch_all(
            """
            SELECT
                p.PinId, p.Title, p.Description, p.SourceUrl,
                p.SavesCount, p.ReactionsCount, p.ViewsCount, p.CommentsCount,
                p.PublishedAt, p.CreatedAt, p.CategoryId,
                c.Name AS CategoryName,
                m.MediaUrl, m.MediaKind,
                u.DisplayName, u.Username, u.UserId AS OwnerUserId
            FROM content.Pins p
            LEFT JOIN content.PinMedia pm ON pm.PinId = p.PinId
            LEFT JOIN content.MediaAssets m ON m.MediaId = pm.MediaId
            LEFT JOIN core.Categories c ON c.CategoryId = p.CategoryId
            LEFT JOIN sec.Users u ON u.UserId = p.OwnerUserId
            WHERE p.OwnerUserId = ?
              AND p.Status = N'APPROVED'
              AND p.Visibility = N'PUBLIC'
              AND p.DeletedAt IS NULL
            ORDER BY p.PublishedAt DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            """,
            [user_id, offset, size],
        )
        return pins
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))



