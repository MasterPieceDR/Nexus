"""
Servicio de mensajería WhatsApp con proveedor configurable.

Proveedores (WHATSAPP_PROVIDER):
  - MOCK   -> sin credenciales: registra el mensaje en logs y en auditoría (modo seguro)
  - TWILIO -> Twilio WhatsApp API (requiere TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_WHATSAPP_FROM)

Nunca lanza excepciones hacia el caller: enviar un WhatsApp jamás debe romper
el registro de un usuario.
"""
import logging

from app.config import settings
from app.db.connection import execute_query

logger = logging.getLogger("nexus.whatsapp")

def _send_twilio(phone: str, message: str) -> bool:
    from twilio.rest import Client

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        from_=f"whatsapp:{settings.TWILIO_WHATSAPP_FROM}",
        to=f"whatsapp:{phone}",
        body=message,
    )
    return True

def _send_mock(phone: str, message: str) -> bool:
    logger.info("[WHATSAPP MOCK] Para %s: %s", phone, message)
    return True

def send_whatsapp(phone: str, message: str, user_id: int | None = None) -> bool:
    """Envía un mensaje de WhatsApp. Devuelve True si se envió (o se simuló)."""
    if not phone or not phone.strip():
        return False

    provider = (settings.WHATSAPP_PROVIDER or "MOCK").upper()
    sent = False
    try:
        if provider == "TWILIO" and settings.TWILIO_ACCOUNT_SID:
            sent = _send_twilio(phone.strip(), message)
        else:
            sent = _send_mock(phone.strip(), message)
    except Exception as error:
        logger.warning("Fallo enviando WhatsApp vía %s: %s", provider, error)
        sent = False

    try:
        execute_query(
            """
            EXEC audit.usp_WriteAuditLog
                @ActorUserId = ?,
                @ActionName = N'WHATSAPP_SEND',
                @EntityName = N'Notification',
                @EntityId = NULL,
                @NewData = ?
            """,
            [user_id, f"provider={provider};sent={sent}"],
        )
    except Exception:
        pass

    return sent

def send_welcome_whatsapp(phone: str, display_name: str, user_id: int | None = None) -> bool:
    message = (
        f"¡Hola {display_name}! 🌌 Bienvenido(a) a Nexus, tu red de conocimiento visual. "
        "Ya puedes explorar nodos, crear colecciones y compartir tus ideas. "
        "Si necesitas ayuda, usa el botón de ayuda dentro de la app."
    )
    return send_whatsapp(phone, message, user_id)
