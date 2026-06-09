USE NexusDB;
GO
SET IDENTITY_INSERT sec.Roles ON;
IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE RoleId = 1) INSERT INTO sec.Roles (RoleId, RoleName) VALUES (1, 'SUPER_ADMIN');
IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE RoleId = 2) INSERT INTO sec.Roles (RoleId, RoleName) VALUES (2, 'MODERATOR');
IF NOT EXISTS (SELECT 1 FROM sec.Roles WHERE RoleId = 5) INSERT INTO sec.Roles (RoleId, RoleName) VALUES (5, 'USER');
SET IDENTITY_INSERT sec.Roles OFF;
GO
SET IDENTITY_INSERT core.Categories ON;
IF NOT EXISTS (SELECT 1 FROM core.Categories WHERE CategoryId = 1) 
    INSERT INTO core.Categories (CategoryId, Name, Slug, SortOrder) VALUES (1, 'Cloud Computing', 'cloud-computing', 1);
IF NOT EXISTS (SELECT 1 FROM core.Categories WHERE CategoryId = 2) 
    INSERT INTO core.Categories (CategoryId, Name, Slug, SortOrder) VALUES (2, 'Desarrollo Web', 'desarrollo-web', 2);
IF NOT EXISTS (SELECT 1 FROM core.Categories WHERE CategoryId = 3) 
    INSERT INTO core.Categories (CategoryId, Name, Slug, SortOrder) VALUES (3, 'Arquitectura', 'arquitectura', 3);
IF NOT EXISTS (SELECT 1 FROM core.Categories WHERE CategoryId = 4) 
    INSERT INTO core.Categories (CategoryId, Name, Slug, SortOrder) VALUES (4, 'Inteligencia Artificial', 'ia', 4);
IF NOT EXISTS (SELECT 1 FROM core.Categories WHERE CategoryId = 5) 
    INSERT INTO core.Categories (CategoryId, Name, Slug, SortOrder) VALUES (5, 'Ciberseguridad', 'ciberseguridad', 5);
SET IDENTITY_INSERT core.Categories OFF;
GO
IF NOT EXISTS (SELECT 1 FROM sec.Users WHERE Email = 'admin@nexus.local')
BEGIN
    INSERT INTO sec.Users (DisplayName, Email, Username, PasswordHash, RoleId)
    VALUES ('Nexus Admin', 'admin@nexus.local', 'nexus_admin', '$2b$12$DUMMY_HASH_REPLACE_IN_PRODUCTION', 1);
END
GO