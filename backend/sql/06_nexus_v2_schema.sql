USE NexusDB;
GO

IF NOT EXISTS (SELECT 1 FROM sec.AuthProviders WHERE ProviderCode = 'LOCAL')
    INSERT INTO sec.AuthProviders (ProviderCode, ProviderName, IsActive, CreatedAt) 
    VALUES ('LOCAL', 'Correo y contraseña', 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM sec.AuthProviders WHERE ProviderCode = 'GOOGLE')
    INSERT INTO sec.AuthProviders (ProviderCode, ProviderName, IsActive, CreatedAt) 
    VALUES ('GOOGLE', 'Google OAuth', 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM sec.AuthProviders WHERE ProviderCode = 'MICROSOFT')
    INSERT INTO sec.AuthProviders (ProviderCode, ProviderName, IsActive, CreatedAt) 
    VALUES ('MICROSOFT', 'Microsoft Account', 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM sec.AuthProviders WHERE ProviderCode = 'LDAP')
    INSERT INTO sec.AuthProviders (ProviderCode, ProviderName, IsActive, CreatedAt) 
    VALUES ('LDAP', 'Active Directory / LDAP', 1, GETDATE());
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'sec.UserExternalLogins') AND name = 'ProviderEmail')
BEGIN
    ALTER TABLE sec.UserExternalLogins ADD 
        ProviderEmail NVARCHAR(255) NULL,
        ProviderDisplayName NVARCHAR(255) NULL,
        AvatarUrl NVARCHAR(1000) NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        LastLoginAt DATETIME NULL;
END
GO

IF OBJECT_ID('sec.LoginEvents', 'U') IS NULL
BEGIN
    CREATE TABLE sec.LoginEvents (
        LoginEventId INT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NULL REFERENCES sec.Users(UserId),
        ProviderCode NVARCHAR(50) NOT NULL,
        IpAddress NVARCHAR(50) NULL,
        UserAgent NVARCHAR(500) NULL,
        WasSuccessful BIT NOT NULL DEFAULT 0,
        FailureReason NVARCHAR(255) NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        EmailNotificationSent BIT NOT NULL DEFAULT 0
    );
END
GO

IF OBJECT_ID('sec.LdapUserLinks', 'U') IS NULL
BEGIN
    CREATE TABLE sec.LdapUserLinks (
        LdapLinkId INT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL REFERENCES sec.Users(UserId),
        DomainName NVARCHAR(100) NOT NULL,
        SamAccountName NVARCHAR(100) NOT NULL,
        UserPrincipalName NVARCHAR(255) NOT NULL,
        DistinguishedName NVARCHAR(500) NULL,
        ObjectGuid UNIQUEIDENTIFIER NULL,
        LastLdapLoginAt DATETIME NULL,
        IsEnabled BIT NOT NULL DEFAULT 1
    );
END
GO

IF OBJECT_ID('sec.UserPreferences', 'U') IS NULL
BEGIN
    CREATE TABLE sec.UserPreferences (
        UserId BIGINT PRIMARY KEY REFERENCES sec.Users(UserId),
        ThemeMode NVARCHAR(20) NOT NULL DEFAULT 'SYSTEM',
        AccentColor NVARCHAR(20) NOT NULL DEFAULT 'GREEN',
        ReducedMotion BIT NOT NULL DEFAULT 0,
        EmailLoginAlerts BIT NOT NULL DEFAULT 1,
        Language NVARCHAR(10) NOT NULL DEFAULT 'es'
    );
END
GO

IF OBJECT_ID('content.NodeEthics', 'U') IS NULL
BEGIN
    CREATE TABLE content.NodeEthics (
        PinId BIGINT PRIMARY KEY REFERENCES content.Pins(PinId) ON DELETE CASCADE,
        IsAiGenerated BIT NOT NULL DEFAULT 0,
        IsSensitive BIT NOT NULL DEFAULT 0,
        AiDisclosureText NVARCHAR(500) NULL,
        ContentWarning NVARCHAR(255) NULL,
        EthicalReviewStatus NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
        ReviewedBy BIGINT NULL REFERENCES sec.Users(UserId),
        ReviewedAt DATETIME NULL
    );
END
GO

IF OBJECT_ID('audit.EmailAuditLog', 'U') IS NULL
BEGIN
    CREATE TABLE audit.EmailAuditLog (
        EmailAuditId INT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NULL REFERENCES sec.Users(UserId),
        EmailType NVARCHAR(50) NOT NULL,
        Recipient NVARCHAR(255) NOT NULL,
        Subject NVARCHAR(255) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
        ProviderResponse NVARCHAR(MAX) NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO
