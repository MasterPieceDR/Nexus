import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, Send } from 'lucide-react';

const WA_NUMBER = '593987392750';
const WA_URL = (msg) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const TREE = {
  start: {
    bot: '¡Hola! 👋 Soy el asistente de *Nexus*. ¿En qué puedo ayudarte hoy?',
    options: [
      { label: '¿Qué es Nexus?',            next: 'que_es' },
      { label: '¿Cómo creo mi cuenta?',     next: 'cuenta' },
      { label: '¿Cómo subo contenido?',     next: 'subir' },
      { label: '¿Cómo funciona la IA?',     next: 'ia' },
      { label: 'Tengo un problema técnico', next: 'problema' },
      { label: 'Hablar con soporte',        next: 'whatsapp' },
    ],
  },
  que_es: {
    bot: 'Nexus es una plataforma visual de conocimiento 🌐. Puedes descubrir, guardar y compartir imágenes e ideas sobre tecnología, diseño y ciencia. El contenido se organiza en *nodos* y categorías curadas.',
    options: [
      { label: '¿Cómo me registro?',    next: 'cuenta' },
      { label: '¿Cómo subo contenido?', next: 'subir' },
      { label: '← Volver al inicio',   next: 'start' },
    ],
  },
  cuenta: {
    bot: 'Crear tu cuenta es fácil 🚀:\n1. Ve a *Registrarse* en la pantalla de inicio.\n2. Completa tu nombre, usuario y contraseña.\n3. También puedes entrar directamente con *Google* o *GitHub* sin contraseña.',
    options: [
      { label: '¿Cómo subo contenido?', next: 'subir' },
      { label: '¿Qué es Nexus?',        next: 'que_es' },
      { label: '← Volver al inicio',   next: 'start' },
    ],
  },
  subir: {
    bot: 'Para subir un nodo 📌:\n1. Inicia sesión y pulsa *Crear* en el menú.\n2. Arrastra o selecciona tu imagen.\n3. Completa título, categoría y descripción.\n4. La IA revisará tu imagen automáticamente antes de publicarla.',
    options: [
      { label: '¿Cómo funciona la IA?', next: 'ia' },
      { label: '¿Por qué no aparece?',  next: 'moderacion' },
      { label: '← Volver al inicio',   next: 'start' },
    ],
  },
  ia: {
    bot: 'Nexus usa *inteligencia artificial* 🤖 para revisar cada imagen al subirla:\n• Si es aprobada, aparece en el feed de inmediato.\n• Si es bloqueada, no cumple las normas de la comunidad.\n• Si queda pendiente, un moderador la revisa manualmente.',
    options: [
      { label: '¿Cómo subo contenido?', next: 'subir' },
      { label: 'Mi imagen fue bloqueada', next: 'bloqueada' },
      { label: '← Volver al inicio',   next: 'start' },
    ],
  },
  moderacion: {
    bot: 'Todo contenido nuevo queda en estado *PENDIENTE* ⏳ hasta ser aprobado por un moderador o por la IA. Puedes ver el estado de tus publicaciones en tu perfil.',
    options: [
      { label: 'Entendido',           next: 'start' },
      { label: 'Hablar con soporte',  next: 'whatsapp' },
    ],
  },
  bloqueada: {
    bot: 'Si tu imagen fue bloqueada es porque el sistema detectó contenido que no cumple las *normas de la comunidad* ⚠️ (contenido explícito, violencia, etc.).\n\nSi crees que fue un error, puedes contactar con soporte.',
    options: [
      { label: 'Hablar con soporte', next: 'whatsapp' },
      { label: '← Volver al inicio', next: 'start' },
    ],
  },
  problema: {
    bot: 'Lamentamos el inconveniente 😟. Para ayudarte mejor, cuéntanos tu problema directamente por WhatsApp y te responderemos lo antes posible.',
    options: [
      { label: 'Hablar con soporte', next: 'whatsapp' },
      { label: '← Volver al inicio', next: 'start' },
    ],
  },
  whatsapp: {
    bot: null,
    options: [],
  },
};

function BotText({ text }) {
  if (!text) return null;
  const parts = text.split(/\*([^*]+)\*/g);
  return (
    <span className="whitespace-pre-line">
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : p
      )}
    </span>
  );
}

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('start');
  const [history, setHistory] = useState([]);
  const [userMsg, setUserMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const [pulse, setPulse] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, typing]);

  const openChat = () => {
    setOpen(true);
    setPulse(false);
    if (history.length === 0) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setHistory([{ from: 'bot', text: TREE.start.bot, step: 'start' }]);
        setStep('start');
      }, 800);
    }
  };

  const handleOption = (option) => {
    const userEntry = { from: 'user', text: option.label };
    setHistory((h) => [...h, userEntry]);
    setStep(option.next);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const node = TREE[option.next];
      if (option.next === 'whatsapp' || !node?.bot) {
        setHistory((h) => [
          ...h,
          { from: 'bot', text: '¡Perfecto! Toca el botón de abajo para escribirnos directamente por WhatsApp 📲', step: option.next },
        ]);
      } else {
        setHistory((h) => [
          ...h,
          { from: 'bot', text: node.bot, step: option.next },
        ]);
      }
    }, 700);
  };

  const handleSendFreeText = () => {
    const msg = userMsg.trim();
    if (!msg) return;
    setUserMsg('');
    setHistory((h) => [...h, { from: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setHistory((h) => [
        ...h,
        {
          from: 'bot',
          text: 'Gracias por tu mensaje 🙏. Para darte la mejor atención, escríbenos directamente por WhatsApp y te responderemos pronto.',
          step: 'whatsapp',
        },
      ]);
      setStep('whatsapp');
    }, 900);
  };

  const currentNode = TREE[step] || TREE.start;
  const isWaStep = step === 'whatsapp' || (history.length > 0 && history[history.length - 1]?.step === 'whatsapp');

  return (
    <>
      <button
        onClick={openChat}
        aria-label="Abrir chat de WhatsApp"
        className="fixed bottom-36 md:bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white shadow-lg hover:shadow-xl hover:shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
      >
        {pulse && !open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-50" />
        )}
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-36 md:bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] max-h-[70vh] sm:max-h-[520px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-black/10 dark:border-white/10"
          style={{ boxShadow: '0 8px 40px rgba(37,211,102,0.18), 0 2px 16px rgba(0,0,0,0.18)' }}>

          <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54]">
            <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Soporte Nexus</p>
              <p className="text-[#25D366] text-[11px]">En línea</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
            style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23128c7e\' fill-opacity=\'0.07\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") #e5ddd5' }}
          >
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm shadow-sm ${
                  msg.from === 'user'
                    ? 'bg-[#DCF8C6] text-[#111] rounded-br-sm'
                    : 'bg-white text-[#111] rounded-bl-sm'
                }`}>
                  {msg.from === 'bot' ? <BotText text={msg.text} /> : msg.text}
                  <span className="block text-[10px] text-black/35 text-right mt-0.5">
                    {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="w-2 h-2 rounded-full bg-[#25D366] animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!typing && currentNode.options.length > 0 && (
            <div className="bg-white dark:bg-[#1a1a2e] border-t border-black/5 dark:border-white/5 px-3 py-2 flex flex-col gap-1.5 max-h-[180px] overflow-y-auto">
              {currentNode.options.map((opt, i) => (
                <button key={i} onClick={() => handleOption(opt)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    opt.next === 'whatsapp'
                      ? 'bg-[#25D366]/10 border-[#25D366]/30 text-[#075E54] dark:text-[#25D366] hover:bg-[#25D366]/20'
                      : opt.label.startsWith('←')
                        ? 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/10'
                        : 'bg-[#E7F3FF] border-[#BFDBFE] text-[#1D4ED8] hover:bg-[#BFDBFE]/50'
                  }`}>
                  {opt.next === 'whatsapp' ? '💬 ' : ''}{opt.label}
                </button>
              ))}
            </div>
          )}

          {isWaStep && !typing && (
            <div className="bg-white dark:bg-[#1a1a2e] border-t border-black/5 dark:border-white/5 px-3 py-3">
              <a
                href={WA_URL('Hola, necesito ayuda con Nexus')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white text-sm font-bold transition-all shadow-sm hover:shadow-md hover:shadow-[#25D366]/30"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Escribir al WhatsApp · +593 987 392 750
              </a>
              <button onClick={() => { setStep('start'); }}
                className="w-full mt-2 text-xs text-black/40 dark:text-white/30 hover:text-[#25D366] transition-colors flex items-center justify-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Volver al menú
              </button>
            </div>
          )}

          {!isWaStep && !typing && (
            <div className="bg-white dark:bg-[#1a1a2e] border-t border-black/5 px-3 py-2 flex items-center gap-2">
              <input
                value={userMsg}
                onChange={(e) => setUserMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendFreeText()}
                placeholder="Escribe tu pregunta…"
                className="flex-1 text-xs py-2 px-3 rounded-full bg-gray-100 dark:bg-white/10 border-none outline-none text-[#111] dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30"
              />
              <button onClick={handleSendFreeText} disabled={!userMsg.trim()}
                aria-label="Enviar mensaje"
                className="w-8 h-8 rounded-full bg-[#25D366] disabled:opacity-30 flex items-center justify-center transition-opacity">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
