from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str
    APP_ENV: str
    APP_HOST: str
    APP_PORT: int

    DB_DRIVER: str
    DB_SERVER: str
    DB_PORT: int = 1433
    DB_DATABASE: str
    DB_USER: str
    DB_PASSWORD: str
    DB_TRUST_CERTIFICATE: str = "yes"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_EXPIRE_MINUTES: int

    AWS_REGION: str = "us-east-1"
    AWS_MEDIA_BUCKET: str = "pincloud-media-dev"
    AWS_PRESIGN_EXPIRATION: int = 900

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
