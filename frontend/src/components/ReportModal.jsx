import { useState } from 'react';
import { Flag, X, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { reportContent } from '../services/api';

const REASONS = [
  { value: 'CONTENIDO_PARA_MENORES', label: 'No apto para niños o jóvenes', priority: true },
  { value: 'CONTENIDO_EXPLICITO', label: 'Contenido explícito o sexual' },
  { value: 'VIOLENCIA', label: 'Violencia o contenido perturbador' },
  { value: 'INFORMACION_FALSA', label: 'Información falsa o engañosa' },
  { value: 'SPAM', label: 'Spam o publicidad no deseada' },
  { value: 'DERECHOS_AUTOR', label: 'Infringe derechos de autor' },
  { value: 'OTRO', label: 'Otro motivo' },
];

export default function ReportModal({ entityType, entityId, onClose }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Selecciona un motivo para el reporte.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const label = REASONS.find(r => r.value === reason)?.label || reason;
      await reportContent(entityType, entityId, label, details.trim());
      setDone(true);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Reportar contenido"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#060E1E] border border-[#BFDBFE] dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#BFDBFE] dark:border-white/10 bg-red-500/5">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            <span className="font-serif font-black tracking-widest uppercase text-sm text-[#0F172A] dark:text-[#F0F8FF]">
              Reportar contenido
            </span>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X className="w-5 h-5 text-black/60 dark:text-white/60" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#2563EB] mx-auto" />
            <h3 className="font-serif font-black text-lg text-[#0F172A] dark:text-[#F0F8FF]">Reporte enviado</h3>
            <p className="text-sm text-black/60 dark:text-white/50 leading-relaxed">
              Gracias por ayudarnos a mantener Nexus seguro. Un moderador revisará este contenido lo antes posible.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold transition-all"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-black/55 dark:text-white/45 leading-relaxed">
              Tu reporte es anónimo para el autor del contenido. Los reportes de contenido
              no apto para menores se revisan con máxima prioridad.
            </p>

            <fieldset className="space-y-2">
              <legend className="sr-only">Motivo del reporte</legend>
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                    reason === r.value
                      ? 'border-red-500/60 bg-red-500/10 text-[#0F172A] dark:text-white'
                      : 'border-[#BFDBFE]/60 dark:border-white/10 text-black/70 dark:text-white/60 hover:border-red-400/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => { setReason(r.value); setError(''); }}
                    className="accent-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    {r.priority && <ShieldAlert className="w-4 h-4 text-red-500" />}
                    {r.label}
                  </span>
                </label>
              ))}
            </fieldset>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              placeholder="Detalles adicionales (opcional)..."
              className="w-full min-h-[70px] p-3 rounded-xl text-sm bg-black/[0.03] dark:bg-white/[0.04] border border-[#BFDBFE]/60 dark:border-white/10 focus:outline-none focus:border-red-400 text-[#0F172A] dark:text-white placeholder:text-black/35 dark:placeholder:text-white/25 resize-none"
            />

            {error && <p className="text-xs text-red-500 font-bold" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !reason}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-500/40 disabled:cursor-not-allowed text-white text-sm font-black transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar reporte'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
