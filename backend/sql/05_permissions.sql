USE NexusDB;
GO
IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = 'nexus_api_user')
BEGIN
    CREATE LOGIN nexus_api_user WITH PASSWORD = 'PasswordSeguro123!';
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'nexus_api_user')
BEGIN
    CREATE USER nexus_api_user FOR LOGIN nexus_api_user;
END
GO
GRANT EXECUTE ON SCHEMA::sec TO nexus_api_user;
GRANT EXECUTE ON SCHEMA::content TO nexus_api_user;
GRANT EXECUTE ON SCHEMA::moderation TO nexus_api_user;
GRANT SELECT ON core.Categories TO nexus_api_user;
GRANT SELECT ON content.Comments TO nexus_api_user;
GRANT SELECT ON sec.Users TO nexus_api_user;
GRANT SELECT ON sec.Roles TO nexus_api_user;
GO