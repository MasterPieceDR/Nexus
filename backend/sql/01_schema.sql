IF DB_ID('NexusDB') IS NULL
BEGIN
    CREATE DATABASE NexusDB;
END
GO
USE NexusDB;
GO
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'sec') EXEC('CREATE SCHEMA sec');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'core') EXEC('CREATE SCHEMA core');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'content') EXEC('CREATE SCHEMA content');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'social') EXEC('CREATE SCHEMA social');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'moderation') EXEC('CREATE SCHEMA moderation');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'audit') EXEC('CREATE SCHEMA audit');
GO
CREATE TABLE sec.Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE sec.Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    DisplayName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NULL,
    RoleId INT NOT NULL DEFAULT 5 REFERENCES sec.Roles(RoleId),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE sec.AuthProviders (
    ProviderId INT IDENTITY(1,1) PRIMARY KEY,
    ProviderName NVARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE sec.UserExternalLogins (
    UserId INT NOT NULL REFERENCES sec.Users(UserId),
    ProviderId INT NOT NULL REFERENCES sec.AuthProviders(ProviderId),
    ProviderKey NVARCHAR(255) NOT NULL,
    PRIMARY KEY (UserId, ProviderId)
);
CREATE TABLE sec.UserSessions (
    SessionId NVARCHAR(128) PRIMARY KEY,
    UserId INT NOT NULL REFERENCES sec.Users(UserId),
    Token NVARCHAR(MAX) NOT NULL,
    ExpiresAt DATETIME NOT NULL
);
CREATE TABLE core.Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(100) NOT NULL UNIQUE,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
CREATE TABLE content.MediaAssets (
    MediaAssetId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL REFERENCES sec.Users(UserId),
    MediaUrl NVARCHAR(1000) NOT NULL,
    MediaKind NVARCHAR(50) NOT NULL,
    MimeType NVARCHAR(100),
    SizeBytes BIGINT,
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE content.Pins (
    PinId INT IDENTITY(1,1) PRIMARY KEY,
    OwnerUserId INT NOT NULL REFERENCES sec.Users(UserId),
    CategoryId INT NOT NULL REFERENCES core.Categories(CategoryId),
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    IsAiGenerated BIT NOT NULL DEFAULT 0,
    IsSensitive BIT NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    SavesCount INT DEFAULT 0,
    CommentsCount INT DEFAULT 0,
    ReactionsCount INT DEFAULT 0,
    ViewsCount INT DEFAULT 0,
    PublishedAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE content.PinMedia (
    PinId INT NOT NULL REFERENCES content.Pins(PinId),
    MediaAssetId INT NOT NULL REFERENCES content.MediaAssets(MediaAssetId),
    MediaOrder INT NOT NULL DEFAULT 1,
    PRIMARY KEY (PinId, MediaAssetId)
);
CREATE TABLE content.Comments (
    CommentId INT IDENTITY(1,1) PRIMARY KEY,
    PinId INT NOT NULL REFERENCES content.Pins(PinId),
    UserId INT NOT NULL REFERENCES sec.Users(UserId),
    Content NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE content.PinSaves (
    UserId INT NOT NULL REFERENCES sec.Users(UserId),
    PinId INT NOT NULL REFERENCES content.Pins(PinId),
    SavedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserId, PinId)
);
CREATE TABLE moderation.Reports (
    ReportId INT IDENTITY(1,1) PRIMARY KEY,
    ReporterUserId INT NOT NULL REFERENCES sec.Users(UserId),
    EntityType NVARCHAR(50) NOT NULL,
    EntityId INT NOT NULL,
    Reason NVARCHAR(500) NOT NULL,
    Details NVARCHAR(MAX),
    Status NVARCHAR(50) NOT NULL DEFAULT 'OPEN',
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE moderation.Decisions (
    DecisionId INT IDENTITY(1,1) PRIMARY KEY,
    ReportId INT NOT NULL REFERENCES moderation.Reports(ReportId),
    ModeratorUserId INT NOT NULL REFERENCES sec.Users(UserId),
    Decision NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE audit.AuditLog (
    AuditId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT,
    Action NVARCHAR(100) NOT NULL,
    Entity NVARCHAR(100),
    EntityId INT,
    Details NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO