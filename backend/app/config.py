from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Nexus API"
    APP_ENV: str = "development"
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8000
    APP_ORIGINS: str = "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000"

    DB_DRIVER: str = "ODBC Driver 18 for SQL Server"
    DB_SERVER: str = "localhost"
    DB_PORT: int = 1433
    DB_DATABASE: str = "NexusDB"
    DB_USER: str = "nexus_api_user"
    DB_PASSWORD: str
    DB_TRUST_CERTIFICATE: str = "yes"
    DB_ENCRYPT: str = "yes"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 180

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    AWS_REGION: str = "us-east-1"
    AWS_MEDIA_BUCKET: str = "nexus-dev-media"
    AWS_APP_BUCKET: str = "nexus-dev-app"
    AWS_PRESIGN_EXPIRATION: int = 900
    
    AUTO_APPROVE_POSTS: str = "false"
    MAX_UPLOAD_SIZE_MB: int = 15

    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
