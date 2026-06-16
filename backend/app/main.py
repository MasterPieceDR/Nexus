from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import os
import logging
import mimetypes
from .config import settings

class _StaticCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if request.url.path.startswith('/static/'):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        return response

class _StaticFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage()
        return not ('/static/' in msg and (' 304 ' in msg or ' 200 ' in msg))

logging.getLogger('uvicorn.access').addFilter(_StaticFilter())

mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('image/avif', '.avif')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/jpeg', '.jpeg')
mimetypes.add_type('image/png', '.png')
from .rutas.health import router as health_router
from .rutas.pins import router as pins_router
from .rutas.auth import router as auth_router
from .rutas.uploads import router as uploads_router
from .rutas.categories import router as categories_router
from .rutas.constellations import router as constellations_router

app = FastAPI(title=settings.APP_NAME)

os.makedirs("static/uploads/images", exist_ok=True)
os.makedirs("static/uploads/videos", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(_StaticCacheMiddleware)
_extra_origins = [o.strip() for o in settings.APP_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        *_extra_origins,
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(health_router)
app.include_router(pins_router)
app.include_router(auth_router)
app.include_router(uploads_router)
app.include_router(categories_router)
app.include_router(constellations_router)

from .rutas.users import router as users_router
from .rutas.reports import router as reports_router
from .rutas.admin import router as admin_router
from .rutas.google_auth import router as google_auth_router
from .rutas.media import router as media_router
from .rutas.moderation import router as moderation_router
from .rutas.ldap_auth import router as ldap_auth_router
from .rutas.microsoft_auth import router as microsoft_auth_router
from .rutas.github_auth import router as github_auth_router

app.include_router(users_router)
app.include_router(reports_router)
app.include_router(admin_router)
app.include_router(google_auth_router)
app.include_router(media_router)
app.include_router(moderation_router)
app.include_router(ldap_auth_router)
app.include_router(microsoft_auth_router)
app.include_router(github_auth_router)

@app.on_event("startup")
def _run_migrations():
    from .db.connection import execute_query
    try:
        execute_query("""
            IF NOT EXISTS (
                SELECT 1 FROM sys.tables t
                JOIN sys.schemas s ON t.schema_id = s.schema_id
                WHERE s.name = 'moderation' AND t.name = 'UserViolations'
            )
            BEGIN
                CREATE TABLE moderation.UserViolations (
                    ViolationId BIGINT IDENTITY(1,1) PRIMARY KEY,
                    UserId      BIGINT NOT NULL REFERENCES sec.Users(UserId),
                    PinId       BIGINT NULL   REFERENCES content.Pins(PinId),
                    Reason      NVARCHAR(500) NULL,
                    CreatedAt   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
                );
                CREATE INDEX IX_UserViolations_UserId
                    ON moderation.UserViolations (UserId);
            END
        """)
    except Exception as exc:
        logging.getLogger("nexus.migrations").error("Migración UserViolations falló: %s", exc)
    try:
        execute_query("""
            IF NOT EXISTS (
                SELECT 1 FROM sys.tables t
                JOIN sys.schemas s ON t.schema_id = s.schema_id
                WHERE s.name = 'audit' AND t.name = 'AuditLog'
            )
            BEGIN
                CREATE TABLE audit.AuditLog (
                    AuditId     BIGINT IDENTITY(1,1) PRIMARY KEY,
                    EventTime   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
                    ActorUserId BIGINT NULL,
                    ActionName  NVARCHAR(100) NOT NULL,
                    EntityName  NVARCHAR(100) NULL,
                    EntityId    BIGINT NULL,
                    OldData     NVARCHAR(MAX) NULL,
                    NewData     NVARCHAR(MAX) NULL,
                    IpAddress   NVARCHAR(80)  NULL,
                    UserAgent   NVARCHAR(500) NULL
                );
                CREATE INDEX IX_AuditLog_EventTime ON audit.AuditLog (EventTime DESC);
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID(N'audit.AuditLog') AND name=N'IpAddress')
                ALTER TABLE audit.AuditLog ADD IpAddress NVARCHAR(80) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID(N'audit.AuditLog') AND name=N'UserAgent')
                ALTER TABLE audit.AuditLog ADD UserAgent NVARCHAR(500) NULL;
        """)
    except Exception as exc:
        logging.getLogger("nexus.migrations").error("Migración AuditLog falló: %s", exc)
    try:
        execute_query("""
            CREATE OR ALTER PROCEDURE audit.usp_WriteAuditLog
                @ActorUserId BIGINT        = NULL,
                @ActionName  NVARCHAR(100),
                @EntityName  NVARCHAR(100) = NULL,
                @EntityId    BIGINT        = NULL,
                @OldData     NVARCHAR(MAX) = NULL,
                @NewData     NVARCHAR(MAX) = NULL,
                @IpAddress   NVARCHAR(80)  = NULL,
                @UserAgent   NVARCHAR(500) = NULL
            AS
            BEGIN
                SET NOCOUNT ON;
                INSERT INTO audit.AuditLog
                    (ActorUserId, ActionName, EntityName, EntityId, OldData, NewData, IpAddress, UserAgent)
                VALUES
                    (@ActorUserId, @ActionName, @EntityName, @EntityId, @OldData, @NewData, @IpAddress, @UserAgent);
            END
        """)
    except Exception as exc:
        logging.getLogger("nexus.migrations").error("Migración usp_WriteAuditLog falló: %s", exc)

@app.get("/")
def root():
    return {
        "message": "Nexus API funcionando"
    }
