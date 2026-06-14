import { useState } from 'react';
import { HelpCircle, X, ChevronDown, MessageCircle } from 'lucide-react';

const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || '593987392750';

const FAQS = [
  { q: '¿Qué es Nexus?', a: 'Nexus es una plataforma visual de conocimiento donde puedes descubrir, guardar y compartir imágenes e ideas sobre tecnología, diseño y ciencia, organizadas en nodos y categorías.' },
  { q: '¿Cómo subo un nodo (imagen)?', a: 'Inicia sesión y usa el botón "Crear" del menú lateral. Arrastra tu imagen, completa el título, la categoría y acepta las reglas de la comunidad. Tu contenido pasará por moderación antes de aparecer en el feed.' },
  { q: '¿Por qué mi publicación no aparece en el feed?', a: 'Todo contenido nuevo queda en estado PENDIENTE hasta que un moderador lo apruebe. Puedes ver el estado de tus publicaciones en tu perfil.' },
  { q: '¿Cómo reporto contenido inapropiado?', a: 'Abre el detalle del nodo y usa el botón "Reportar". Si el contenido es inapropiado para menores, selecciona esa razón específica: estos reportes tienen prioridad.' },
  { q: '¿Cómo edito mi perfil?', a: 'Ve a tu perfil y pulsa el botón de configuración (engranaje). Puedes cambiar tu nombre, usuario, biografía y, si representas una empresa, añadir misión, visión y datos de contacto.' },
  { q: '¿Qué significa el sello "Verificado"?', a: 'Indica que un moderador revisó la fuente de la información del nodo y la confirmó. El contenido sin verificar muestra un aviso para que lo evalúes con criterio.' },
  { q: '¿Cómo funciona el feed personalizado?', a: 'La pestaña "Para ti" ordena el contenido según tus likes, guardados, vistas y búsquedas recientes, priorizando las categorías que más te interesan.' },
];

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, necesito ayuda con Nexus')}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir centro de ayuda"
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg hover:shadow-xl hover:shadow-[#2563EB]/30 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
      >
        <HelpCircle className="w-7 h-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/40 backdrop-blur-sm p-0 sm:p-6" onClick={() => setOpen(false)}>
          <div role="dialog" aria-label="Centro de ayuda" onClick={e => e.stopPropagation()}
            className="w-full sm:w-[400px] max-h-[85vh] bg-white dark:bg-[#060E1E] border border-[#BFDBFE] dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-[#BFDBFE] dark:border-white/10 bg-[#2563EB]/5">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[#2563EB]" />
                <span className="font-serif font-black tracking-widest uppercase text-sm text-[#0F172A] dark:text-[#F0F8FF]">Centro de Ayuda</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar ayuda" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-black/60 dark:text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              <p className="text-xs text-black/50 dark:text-white/40 mb-3 font-mono uppercase tracking-widest">Preguntas frecuentes</p>
              {FAQS.map((faq, idx) => (
                <div key={idx} className="border border-[#BFDBFE]/60 dark:border-white/10 rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(expanded === idx ? null : idx)} aria-expanded={expanded === idx}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-[#0F172A] dark:text-[#F0F8FF] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 text-[#2563EB] transition-transform ${expanded === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded === idx && <p className="px-4 pb-4 text-xs text-black/60 dark:text-white/50 leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-[#BFDBFE] dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015]">
              <p className="text-xs text-black/50 dark:text-white/40 mb-3 text-center">¿No encontraste lo que buscabas? Escríbenos directamente:</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white text-sm font-bold transition-all shadow-sm hover:shadow-md">
                <MessageCircle className="w-5 h-5" />
                WhatsApp del administrador
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
