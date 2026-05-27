from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .config import settings
from .db import Base, engine, SessionLocal
from .models import Category
from .rutas import auth, categories, posts, reports, uploads, users

app = FastAPI(title=settings.app_name)

os.makedirs("static/uploads/images", exist_ok=True)
os.makedirs("static/uploads/videos", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(posts.router)
app.include_router(reports.router)
app.include_router(uploads.router)
app.include_router(users.router)


def seed_categories() -> None:
    db = SessionLocal()
    try:
        total = db.query(Category).count()
        if total == 0:
            categories_seed = [
                ("Arte", "arte"),
                ("Animales", "animales"),
                ("Comida", "comida"),
                ("Diseño", "diseno"),
                ("Moda", "moda"),
                ("Tecnología", "tecnologia"),
                ("Decoración", "decoracion"),
                ("Fotografía", "fotografia")
            ]
            db.add_all([Category(name=name, slug=slug) for name, slug in categories_seed])
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    seed_categories()


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}
