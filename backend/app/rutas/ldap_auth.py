from fastapi import APIRouter, HTTPException, status, Request, BackgroundTasks
from pydantic import BaseModel
from ..db.connection import fetch_one, execute_query
from ..seguridad.auth import create_access_token
from ..services.email_service import send_login_alert
from ldap3 import Server, Connection, ALL, NTLM

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LdapLoginRequest(BaseModel):
    username: str
    password: str
    domain: str

@router.post("/ldap")
def ldap_login(payload: LdapLoginRequest, request: Request, background_tasks: BackgroundTasks):
    ip_address = request.client.host if request.client else "Unknown"
    user_agent = request.headers.get("user-agent", "Unknown")

    server_uri = f"ldap://{payload.domain}"
    user_principal = f"{payload.username}@{payload.domain}"
    
    try:
        server = Server(server_uri, get_info=ALL)
        conn = Connection(server, user=user_principal, password=payload.password, authentication=NTLM)
        
        if not conn.bind():
            query_fail = """
            INSERT INTO sec.LoginEvents (UserId, ProviderCode, IpAddress, UserAgent, WasSuccessful, FailureReason, CreatedAt)
            VALUES (NULL, 'LDAP', ?, ?, 0, 'Invalid LDAP credentials', GETDATE())
            """
            execute_query(query_fail, [ip_address, user_agent])
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid LDAP credentials")

        conn.search('dc=' + ',dc='.join(payload.domain.split('.')), f'(sAMAccountName={payload.username})', attributes=['mail', 'displayName', 'objectGUID'])
        
        if not conn.entries:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="LDAP user details not found")
            
        entry = conn.entries[0]
        email = str(entry.mail) if 'mail' in entry else f"{payload.username}@{payload.domain}"
        display_name = str(entry.displayName) if 'displayName' in entry else payload.username
        object_guid = str(entry.objectGUID) if 'objectGUID' in entry else None

        user = fetch_one("SELECT UserId, DisplayName, Email, RoleId FROM sec.Users WHERE Email = ?", [email.lower()])
        
        if not user:
            role_id = 2
            query_insert = """
            INSERT INTO sec.Users (DisplayName, FirstName, LastName, Email, Username, RoleId, CreatedAt)
            VALUES (?, ?, '', ?, ?, ?, GETDATE())
            """
            execute_query(query_insert, [display_name, display_name, email.lower(), payload.username, role_id])
            user = fetch_one("SELECT UserId, DisplayName, Email, RoleId FROM sec.Users WHERE Email = ?", [email.lower()])

        provider_query = fetch_one("SELECT ProviderId FROM sec.AuthProviders WHERE ProviderName = 'LDAP'")
        if provider_query:
            provider_id = provider_query["ProviderId"]
            ext_login = fetch_one("SELECT * FROM sec.UserExternalLogins WHERE UserId = ? AND ProviderId = ?", [user["UserId"], provider_id])
            if not ext_login:
                execute_query("""
                INSERT INTO sec.UserExternalLogins (UserId, ProviderId, ProviderKey, ProviderEmail, ProviderDisplayName, CreatedAt, LastLoginAt)
                VALUES (?, ?, ?, ?, ?, GETDATE(), GETDATE())
                """, [user["UserId"], provider_id, payload.username, email, display_name])
            else:
                execute_query("UPDATE sec.UserExternalLogins SET LastLoginAt = GETDATE() WHERE UserId = ? AND ProviderId = ?", [user["UserId"], provider_id])

        ldap_link = fetch_one("SELECT * FROM sec.LdapUserLinks WHERE UserId = ?", [user["UserId"]])
        if not ldap_link:
            execute_query("""
            INSERT INTO sec.LdapUserLinks (UserId, DomainName, SamAccountName, UserPrincipalName, ObjectGuid, LastLdapLoginAt)
            VALUES (?, ?, ?, ?, ?, GETDATE())
            """, [user["UserId"], payload.domain, payload.username, user_principal, object_guid])
        else:
            execute_query("UPDATE sec.LdapUserLinks SET LastLdapLoginAt = GETDATE() WHERE UserId = ?", [user["UserId"]])

        execute_query("""
        INSERT INTO sec.LoginEvents (UserId, ProviderCode, IpAddress, UserAgent, WasSuccessful, CreatedAt, EmailNotificationSent)
        VALUES (?, 'LDAP', ?, ?, 1, GETDATE(), 1)
        """, [user["UserId"], ip_address, user_agent])

        background_tasks.add_task(send_login_alert, user["UserId"], user["Email"], user["DisplayName"], ip_address, user_agent)

        token = create_access_token(str(user["UserId"]))
        return {"access_token": token, "token_type": "bearer", "user": user}

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
