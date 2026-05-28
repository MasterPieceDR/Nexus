from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PinCloud API"
    environment: str = "dev"
    app_origins: str = "http://127.0.0.1:5500,http://localhost:5500"
    database_url: str | None = None
    sqlserver_host: str = "localhost"
    sqlserver_port: int = 1433
    sqlserver_database: str = "PinCloudDB"
    sqlserver_user: str = "pincloud_api_user"
    sqlserver_password: str = "PasswordSeguro123!"
    odbc_driver: str = "ODBC Driver 18 for SQL Server"
    sqlserver_encrypt: str = "yes"
    sqlserver_trust_certificate: str = "yes"
    jwt_secret: str = "change_this_secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 180
    aws_region: str = "us-east-1"
    aws_media_bucket: str = "pincloud-media-dev"
    aws_presign_expiration: int = 900
    auto_approve_posts: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.app_origins.split(",") if origin.strip()]


settings = Settings()
