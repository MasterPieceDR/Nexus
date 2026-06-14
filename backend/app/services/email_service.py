import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings
from ..db.connection import execute_query
import logging

logger = logging.getLogger(__name__)

def _base_template(header_title: str, header_subtitle: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#EFF6FF;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1D4ED8 0%,#2563EB 60%,#3B82F6 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:30px;font-weight:900;color:#ffffff;letter-spacing:0.35em;margin-bottom:6px;">NEXUS</div>
      <div style="width:40px;height:2px;background:rgba(147,197,253,0.6);margin:0 auto 14px;"></div>
      <div style="font-size:18px;font-weight:700;color:#DBEAFE;margin-bottom:4px;">{header_title}</div>
      <div style="font-size:13px;color:rgba(219,234,254,0.7);">{header_subtitle}</div>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #BFDBFE;border-right:1px solid #BFDBFE;">
      {body_html}
    </div>

    <!-- Footer -->
    <div style="background:#F8FAFF;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border:1px solid #BFDBFE;border-top:none;">
      <p style="margin:0 0 6px;font-size:12px;color:#64748B;">
        Este mensaje fue generado automáticamente por <strong style="color:#2563EB;">Nexus</strong>. No respondas a este correo.
      </p>
      <p style="margin:0;font-size:11px;color:#94A3B8;">
        &copy; 2025 Nexus &middot; Plataforma de conocimiento visual
      </p>
    </div>

  </div>
</body>
</html>"""

def _send(to_email: str, subject: str, html: str):
    """Envía un correo vía SMTP. Lanza excepción si falla."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Nexus <{settings.SMTP_USER}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
    server.ehlo()
    server.starttls()
    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
    server.quit()

def _log_email(user_id, email_type: str, to_email: str, subject: str, status: str, error: str = None):
    try:
        execute_query(
            "INSERT INTO audit.EmailAuditLog (UserId, EmailType, Recipient, Subject, Status, ProviderResponse, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, GETDATE())",
            [user_id, email_type, to_email, subject, status, error]
        )
    except Exception as e:
        logger.error("EmailAuditLog insert failed: %s", e)

def send_welcome_email(to_email: str, user_name: str, username: str = ""):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return

    subject = "Bienvenido a Nexus"
    at_username = f"@{username}" if username else ""

    body = f"""
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0F172A;">Hola, {user_name} 👋</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
        Tu cuenta en <strong style="color:#2563EB;">Nexus</strong> ha sido creada exitosamente.
        {f'Tu nombre de usuario es <strong style="color:#1D4ED8;">{at_username}</strong>.' if at_username else ''}
      </p>

      <div style="background:#EFF6FF;border-left:4px solid #2563EB;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#1E40AF;font-weight:600;">Ahora puedes:</p>
        <ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:#334155;line-height:1.8;">
          <li>Explorar contenido curado de tecnolog&iacute;a, dise&ntilde;o y ciencia</li>
          <li>Guardar y organizar nodos en tu biblioteca personal</li>
          <li>Publicar tus propias im&aacute;genes e ideas</li>
          <li>Conectar con la comunidad Nexus</li>
        </ul>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="http://localhost:5173/explorar"
           style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.02em;">
          Explorar Nexus &rarr;
        </a>
      </div>

      <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
        Si no creaste esta cuenta, ignora este correo.
      </p>
    """

    html = _base_template("Cuenta creada con éxito", "Ya eres parte del Nexo.", body)

    try:
        _send(to_email, subject, html)
    except Exception as e:
        logger.error("send_welcome_email error: %s", e)

def send_login_alert(user_id: int, to_email: str, user_name: str, ip_address: str, user_agent: str, provider: str = "LOCAL"):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return

    subject = "Nuevo acceso a tu cuenta Nexus"

    provider_label = {
        "LOCAL": "Correo y contrase&ntilde;a",
        "GOOGLE": "Google",
        "MICROSOFT": "Microsoft / Outlook",
        "LDAP": "Red corporativa (LDAP)",
    }.get(provider.upper(), provider)

    body = f"""
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0F172A;">Hola, {user_name}</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
        Detectamos un nuevo acceso a tu cuenta de <strong style="color:#2563EB;">Nexus</strong>.
        Si fuiste t&uacute;, no necesitas hacer nada.
      </p>

      <div style="background:#F8FAFF;border:1px solid #BFDBFE;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:6px 0;color:#64748B;width:35%;">M&eacute;todo</td>
            <td style="padding:6px 0;color:#0F172A;font-weight:600;">{provider_label}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748B;border-top:1px solid #EFF6FF;">Direcci&oacute;n IP</td>
            <td style="padding:6px 0;color:#0F172A;font-weight:600;border-top:1px solid #EFF6FF;">{ip_address}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748B;border-top:1px solid #EFF6FF;">Dispositivo</td>
            <td style="padding:6px 0;color:#0F172A;font-weight:600;border-top:1px solid #EFF6FF;word-break:break-word;">{user_agent[:120]}</td>
          </tr>
        </table>
      </div>

      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#991B1B;">
          <strong>&#9888; &iquest;No fuiste t&uacute;?</strong> Cambia tu contrase&ntilde;a de inmediato y contacta al soporte.
        </p>
      </div>

      <p style="margin:0;font-size:12px;color:#94A3B8;text-align:center;">
        Esta alerta se env&iacute;a autom&aacute;ticamente en cada acceso para proteger tu cuenta.
      </p>
    """

    html = _base_template("Alerta de seguridad", "Se detectó un nuevo inicio de sesión.", body)

    email_status = "PENDING"
    error_msg = None
    try:
        _send(to_email, subject, html)
        email_status = "SENT"
    except Exception as e:
        email_status = "FAILED"
        error_msg = str(e)
        logger.error("send_login_alert error: %s", e)

    _log_email(user_id, "LOGIN_ALERT", to_email, subject, email_status, error_msg)
