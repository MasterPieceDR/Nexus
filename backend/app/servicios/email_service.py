import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(to_email: str, user_name: str):
    """
    Envía un correo de bienvenida usando SMTP de forma síncrona.
    Pensado para ser ejecutado vía BackgroundTasks de FastAPI.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credenciales no configuradas. No se enviará el correo de bienvenida.")
        return

    subject = "¡Bienvenido a Nexus! Tu red visual 🚀"
    
    # HTML Content for the email
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #f2f2f2; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #1a1a1a; padding: 30px; border-radius: 8px; border: 1px solid #333;">
          <h2 style="color: #00ff66; text-align: center;">Nexus</h2>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
          <h3 style="color: #ffffff;">Hola {user_name},</h3>
          <p style="color: #cccccc; line-height: 1.6;">
            ¡Nos emociona darte la bienvenida a <strong>Nexus</strong>!
          </p>
          <p style="color: #cccccc; line-height: 1.6;">
            Tu cuenta ha sido creada exitosamente. A partir de ahora, puedes empezar a descubrir, guardar y compartir ideas en nuestro mosaico visual.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://127.0.0.1:5500/html/index.html" style="background-color: #00ff66; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
              Explorar el Mosaico
            </a>
          </div>
          <p style="color: #888888; font-size: 12px; text-align: center;">
            Si no solicitaste crear esta cuenta, puedes ignorar este mensaje.
          </p>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Nexus <{settings.SMTP_USER}>"
    msg["To"] = to_email

    part_html = MIMEText(html_content, "html")
    msg.attach(part_html)

    try:
        # Connect to the SMTP server
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        server.quit()
        logger.info(f"Correo de bienvenida enviado exitosamente a {to_email}")
    except Exception as e:
        logger.error(f"Error enviando correo a {to_email}: {e}")
