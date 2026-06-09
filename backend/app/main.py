from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .config import settings
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000"
    ],
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
from .rutas.google_auth import router as google_auth_router
from .rutas.media import router as media_router
from .rutas.moderation import router as moderation_router

app.include_router(users_router)
app.include_router(reports_router)
app.include_router(google_auth_router)
app.include_router(media_router)
app.include_router(moderation_router)

@app.get("/")
def root():
    return {
        "message": "Nexus API funcionando"
    }
