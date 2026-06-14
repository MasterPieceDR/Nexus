import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, FileText, Eye, Lock, AlertTriangle } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <section className="bg-white dark:bg-[#060E1E] border border-[#BFDBFE] dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
      <h2 className="flex items-center gap-3 text-xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] mb-4">
        <Icon className="w-5 h-5 text-[#2563EB]" />
        {title}
      </h2>
      <div className="space-y-3 text-sm text-black/65 dark:text-white/55 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#EFF6FF] dark:bg-[#041020] py-12 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:text-[#1D4ED8] font-bold mb-2">
          <ArrowLeft className="w-4 h-4" /> Volver a Nexus
        </Link>

        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] tracking-tight mb-3">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-black/50 dark:text-white/40">
            Última actualización: junio de 2026 · Al usar Nexus aceptas estas condiciones.
          </p>
        </header>

        <Section icon={FileText} title="1. Términos de uso">
          <p>
            Nexus es una plataforma visual de conocimiento orientada a tecnología, diseño y ciencia.
            Al crear una cuenta declaras tener al menos 13 años y aceptas usar la plataforma de forma
            responsable y respetuosa con la comunidad.
          </p>
          <p>
            Eres responsable del contenido que publicas. Solo debes subir material del que tengas
            derechos o permiso de uso, citando la fuente original cuando corresponda mediante el
            campo "Fuente original (URL)".
          </p>
        </Section>

        <Section icon={ShieldCheck} title="2. Reglas de la comunidad">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Prohibido el contenido explícito o sexual</strong>, especialmente cualquier material que involucre o pueda dañar a menores de edad.</li>
            <li><strong>Prohibido el contenido ilegal</strong>: violencia gráfica, incitación al odio, drogas, armas o actividades delictivas.</li>
            <li><strong>Declara el contenido generado por IA</strong> usando la casilla correspondiente al publicar.</li>
            <li><strong>Marca como sensible</strong> el material que pueda requerir advertencia previa.</li>
            <li><strong>No publiques spam</strong> ni publicidad engañosa.</li>
            <li><strong>Respeta los derechos de autor</strong> de terceros.</li>
          </ul>
          <p className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            El incumplimiento de estas reglas puede resultar en la eliminación del contenido,
            suspensión o cierre definitivo de la cuenta.
          </p>
        </Section>

        <Section icon={Eye} title="3. Política de contenido y moderación">
          <p>
            Todo contenido publicado pasa por un proceso de moderación con los estados:
            <strong> PENDIENTE</strong> (en revisión), <strong>APROBADO</strong> (visible),
            <strong> RECHAZADO</strong> (no cumple las reglas) y <strong>OCULTO</strong> (retirado temporalmente).
          </p>
          <p>
            Usamos validación automática con inteligencia artificial (detección de contenido explícito
            y lectura OCR de texto en imágenes) complementada con revisión humana. Los resultados de
            estas validaciones se almacenan con fines de auditoría.
          </p>
          <p>
            Cualquier usuario puede reportar contenido desde el detalle de cada nodo. Los reportes de
            contenido no apto para menores se atienden con máxima prioridad.
          </p>
          <p>
            La información publicada puede mostrar el estado <strong>Verificado</strong> cuando un
            moderador confirma su fuente. El contenido sin verificar muestra un aviso para que el
            lector lo evalúe con criterio propio.
          </p>
        </Section>

        <Section icon={Lock} title="4. Aviso de privacidad">
          <p>
            Recopilamos los datos mínimos necesarios para operar la plataforma: nombre, email,
            nombre de usuario y, opcionalmente, teléfono (para notificaciones de WhatsApp que tú autorizas).
          </p>
          <p>
            Registramos eventos de inicio de sesión (IP, dispositivo y fecha) para proteger tu cuenta;
            puedes consultarlos en el panel de Avisos. También guardamos tus interacciones (likes,
            guardados, búsquedas) para personalizar tu feed.
          </p>
          <p>
            No vendemos tus datos a terceros. Las contraseñas se almacenan cifradas (hash) y las
            sesiones usan tokens JWT con expiración. Puedes solicitar la eliminación de tu cuenta y
            tus datos escribiendo al administrador desde el botón de ayuda.
          </p>
        </Section>

        <footer className="text-center text-xs text-black/40 dark:text-white/30 pt-4 pb-10">
          Nexus · Plataforma Visual de Conocimiento · Proyecto académico con moderación ética verificable
        </footer>
      </div>
    </div>
  );
}
