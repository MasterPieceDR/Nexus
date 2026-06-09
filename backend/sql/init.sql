IF DB_ID('PinCloudDB') IS NULL
BEGIN
    CREATE DATABASE PinCloudDB;
END
GO
USE PinCloudDB;
GO
IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'pincloud_api_user')
BEGIN
    CREATE LOGIN pincloud_api_user WITH PASSWORD = 'PasswordSeguro123!';
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'pincloud_api_user')
BEGIN
    CREATE USER pincloud_api_user FOR LOGIN pincloud_api_user;
END
GO
ALTER ROLE db_datareader ADD MEMBER pincloud_api_user;
ALTER ROLE db_datawriter ADD MEMBER pincloud_api_user;
ALTER ROLE db_ddladmin ADD MEMBER pincloud_api_user;
GO