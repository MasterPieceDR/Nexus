from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings


def build_database_url() -> str:
    if settings.database_url:
        return settings.database_url

    connection = (
        f"DRIVER={{{settings.odbc_driver}}};"
        f"SERVER={settings.sqlserver_host},{settings.sqlserver_port};"
        f"DATABASE={settings.sqlserver_database};"
        f"UID={settings.sqlserver_user};"
        f"PWD={settings.sqlserver_password};"
        f"Encrypt={settings.sqlserver_encrypt};"
        f"TrustServerCertificate={settings.sqlserver_trust_certificate};"
    )
    return f"mssql+pyodbc:///?odbc_connect={quote_plus(connection)}"


db_url = build_database_url()
if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False}, pool_pre_ping=True, future=True)
else:
    engine = create_engine(db_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
