import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, X, Loader2, Link as LinkIcon, AlertCircle, CheckCircle2, ShieldCheck, Tags, Clock, Ban, TriangleAlert } from 'lucide-react';
import { createPin, getUploadUrl, getCategories, apiFetch, validateImagePreview } from '../services/api';

const MAX_IMAGE_MB = 15;
const MAX_VIDEO_MB = 200;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const VIDEO_TYPES = ['video/mp4'];

export default function CreatePin() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isSensitive, setIsSensitive] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [uploadedKey, setUploadedKey]   = useState(null);
  const [validating,  setValidating]    = useState(false);
  const [validResult, setValidResult]   = useState(null); 

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) setCategory(data[0].id.toString());
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setError('No se pudieron cargar las categorías. Recarga la página.');
      }
    };
    fetchCategories();
  }, []);

  const isVideo = (f) => VIDEO_TYPES.includes(f?.type);

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Formato no permitido. Usa imágenes (.jpg, .png, .webp) o video (.mp4).');
      return;
    }
    const maxMB = isVideo(selected) ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (selected.size > maxMB * 1024 * 1024) {
      setError(`El archivo no debe superar los ${maxMB}MB`);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
    setUploadedKey(null);
    setValidResult(null);
    if (!isVideo(selected)) runFileValidation(selected);
  };

  const runFileValidation = async (selectedFile) => {
    setValidating(true);
    try {
      const { s3_key: key } = await getUploadUrl(selectedFile.name, selectedFile.type);
      await apiFetch(`/uploads/local-upload?key=${encodeURIComponent(key)}`, {
        method: 'PUT', body: selectedFile, rawBody: true, auth: false, timeout: 60000,
      });
      setUploadedKey(key);
      const res = await validateImagePreview(key);
      setValidResult({ status: res.status, reason: res.reason });
    } catch {
      setValidResult({ status: 'PENDING', reason: '' });
    } finally {
      setValidating(false);
    }
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError('Por favor completa los campos requeridos (Imagen y Título)');
      return;
    }
    if (!acceptedRules) {
      setError('Debes aceptar las reglas de la comunidad antes de publicar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let key = uploadedKey;

      if (!key) {
        const { s3_key } = await getUploadUrl(file.name, file.type);
        key = s3_key;
        const timeoutMs = isVideo(file) ? 300_000 : 60_000;
        await apiFetch(`/uploads/local-upload?key=${encodeURIComponent(key)}`, {
          method: 'PUT', body: file, rawBody: true, auth: false, timeout: timeoutMs,
        });
      }

      const data = await createPin({
        title: title.trim(),
        description: description.trim() || null,
        category_id: parseInt(category, 10),
        tags: tags.trim() || null,
        source_url: sourceUrl.trim() || null,
        s3_key: key,
        media_type: file.type,
        is_ai_generated: isAiGenerated,
        is_sensitive: isSensitive,
      });

      setResult({
        moderation_status: data.moderation_status,
        moderation_reason: data.moderation_reason,
        pin_id: data.pin_id,
      });
    } catch (err) {
      const detail = err.detail;
      if (detail && typeof detail === 'object' && detail.blocked) {
        setResult({ moderation_status: 'BLOCKED', moderation_reason: detail.reason, pin_id: detail.pin_id, violation_count: detail.violation_count ?? 1 });
      } else {
        setError(err.message || 'Error al crear el Nodo. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null); setFile(null); setPreview('');
    setTitle(''); setDescription(''); setTags('');
    setSourceUrl(''); setAcceptedRules(false);
    setIsAiGenerated(false); setIsSensitive(false); setError('');
    setUploadedKey(null); setValidating(false); setValidResult(null);
  };

  if (result) {
    const isApproved = result.moderation_status === 'APPROVED';
    const isBlocked  = result.moderation_status === 'BLOCKED';

    const cfg = isApproved ? {
      icon: <CheckCircle2 className="w-10 h-10 text-[#2563EB]" />,
      bg: 'bg-[#2563EB]/10',
      badge: 'bg-[#2563EB]/15 text-[#2563EB] dark:text-[#60A5FA] border-[#2563EB]/30',
      badgeText: 'APROBADO · PUBLICADO',
      title: '¡Nodo publicado!',
      desc: 'Tu contenido pasó la validación automática y ya es visible en el feed para todos los usuarios.',
      cta: 'Ver en el feed',
      ctaFn: () => navigate('/explorar'),
    } : isBlocked ? {
      icon: <Ban className="w-10 h-10 text-red-500" />,
      bg: 'bg-red-500/10',
      badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
      badgeText: 'RECHAZADO · BLOQUEADO',
      title: 'Contenido rechazado',
      desc: null,
      cta: 'Subir otra imagen',
      ctaFn: resetForm,
    } : {
      icon: <Clock className="w-10 h-10 text-amber-500" />,
      bg: 'bg-amber-500/10',
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
      badgeText: 'EN REVISIÓN · PENDIENTE',
      title: '¡Nodo enviado!',
      desc: 'Tu contenido está en cola de moderación. Será visible en el feed una vez aprobado.',
      cta: 'Ver mi perfil',
      ctaFn: () => navigate('/perfil'),
    };

    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#EFF6FF] dark:bg-[#020B18] flex items-center justify-center py-12 px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-[#F8FAFF] dark:bg-[#0D1B38] rounded-3xl shadow-xl border border-[#BFDBFE] dark:border-white/10 p-10 text-center space-y-5">

          <div className={`w-16 h-16 mx-auto rounded-full ${cfg.bg} flex items-center justify-center`}>
            {cfg.icon}
          </div>

          <h1 className="text-2xl font-black font-serif text-[#0F172A] dark:text-[#F0F8FF]">{cfg.title}</h1>

          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-widest border ${cfg.badge}`}>
            {cfg.badgeText}
          </span>

          {result.moderation_reason && (
            <div className={`mx-auto max-w-sm text-left rounded-xl px-4 py-3 text-sm leading-relaxed border ${
              isBlocked
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300'
                : 'bg-[#EFF6FF] dark:bg-white/5 border-[#BFDBFE] dark:border-white/10 text-black/65 dark:text-white/55'
            }`}>
              {isBlocked && <p className="font-bold mb-1 text-red-600 dark:text-red-400">Motivo del rechazo:</p>}
              <p>{result.moderation_reason}</p>
            </div>
          )}

          {isBlocked && result.violation_count >= 3 && (
            <div className="mx-auto max-w-sm rounded-xl border border-amber-400/50 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 flex gap-3 items-start text-left">
              <TriangleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">Advertencia de cuenta</p>
                <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5 leading-relaxed">
                  Has subido contenido explícito {result.violation_count} {result.violation_count === 1 ? 'vez' : 'veces'}. Si vuelves a subir material no permitido, <span className="font-bold">tu cuenta será suspendida</span>.
                </p>
              </div>
            </div>
          )}

          {cfg.desc && (
            <p className="text-sm text-black/60 dark:text-white/50 leading-relaxed">{cfg.desc}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button onClick={cfg.ctaFn}
              className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold transition-all">
              {cfg.cta}
            </button>
            {!isBlocked && (
              <button onClick={resetForm}
                className="px-6 py-3 rounded-xl border border-[#BFDBFE] dark:border-white/10 text-[#0F172A] dark:text-white text-sm font-bold hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
                {isApproved ? 'Publicar otro' : 'Crear otro nodo'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#EFF6FF] dark:bg-[#020B18] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-[#F8FAFF] dark:bg-[#0D1B38] rounded-3xl shadow-xl dark:shadow-2xl border border-[#BFDBFE] dark:border-[#F0F8FF]/5 overflow-hidden transition-colors duration-300">

        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-1/2 p-4 sm:p-6 md:p-10 bg-[#EFF6FF] dark:bg-[#F0F8FF]/5 border-r border-[#BFDBFE] dark:border-[#F0F8FF]/10 flex flex-col justify-center transition-colors duration-300">
            {!preview ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Subir imagen: haz clic o arrastra un archivo"
                className={`border-2 border-dashed rounded-2xl p-8 h-full min-h-[240px] sm:min-h-[400px] flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${
                  isDraggingOver
                    ? 'border-[#2563EB] bg-[#2563EB]/10 scale-[1.01]'
                    : 'border-[#BFDBFE] dark:border-[#2563EB]/30 hover:bg-black/[0.01] dark:hover:bg-[#2563EB]/5'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`w-16 h-16 bg-[#EFF6FF] dark:bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-4 transition-transform ${isDraggingOver ? 'scale-125' : 'group-hover:scale-110'}`}>
                  <Upload className="w-8 h-8 text-black/60 dark:text-[#2563EB]" />
                </div>
                <p className="text-lg font-medium text-[#0F172A] dark:text-[#F0F8FF] mb-2">
                  {isDraggingOver ? '¡Suéltala aquí!' : 'Haz clic para subir'}
                </p>
                <p className="text-sm text-black/60 dark:text-[#F0F8FF]/60 mb-6">o arrastra y suelta tu archivo aquí</p>

                <div className="text-xs text-black/40 dark:text-[#F0F8FF]/40 space-y-1">
                  <p>Imágenes: .jpg, .png, .webp — máx. {MAX_IMAGE_MB}MB</p>
                  <p>Video: .mp4 — máx. {MAX_VIDEO_MB}MB</p>
                </div>
              </div>
            ) : (
              <div className="relative h-full min-h-[240px] sm:min-h-[400px] rounded-2xl overflow-hidden group bg-black">
                {isVideo(file) ? (
                  <video src={preview} controls className="w-full h-full object-contain" style={{ maxHeight: '100%' }} />
                ) : (
                  <img src={preview} alt="Vista previa de la imagen a publicar" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                  <button
                    type="button"
                    aria-label="Quitar archivo"
                    onClick={() => { setFile(null); setPreview(''); setUploadedKey(null); setValidating(false); setValidResult(null); }}
                    className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors transform hover:scale-110"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {!isVideo(file) && (
                  <div className={`absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm text-xs font-bold transition-all ${
                    validating
                      ? 'bg-black/65 text-white'
                      : validResult?.status === 'APPROVED'
                        ? 'bg-green-600/85 text-white'
                        : validResult?.status === 'BLOCKED'
                          ? 'bg-red-600/85 text-white'
                          : 'bg-black/50 text-white/80'
                  }`}>
                    {validating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> Analizando imagen con IA…</>
                    ) : validResult?.status === 'APPROVED' ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Imagen aprobada</>
                    ) : validResult?.status === 'BLOCKED' ? (
                      <><Ban className="w-3.5 h-3.5 shrink-0" /> No permitida — {validResult.reason || 'Contenido no apto'}</>
                    ) : validResult ? (
                      <><ShieldCheck className="w-3.5 h-3.5 shrink-0" /> En revisión</>
                    ) : null}
                  </div>
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,video/mp4"
              className="hidden"
            />
          </div>

          <div className="md:w-1/2 p-4 sm:p-6 md:p-10 flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F0F8FF] mb-6 tracking-tight">
              {file && isVideo(file) ? 'Crear Nodo de Video' : 'Crear Nuevo Nodo'}
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3" role="alert">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-500 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">

              <div>
                <label htmlFor="pin-title" className="block text-sm font-medium text-black/60 dark:text-[#F0F8FF]/60 mb-2">Título *</label>
                <input
                  id="pin-title"
                  type="text"
                  value={title}
                  maxLength={160}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#EFF6FF]/60 dark:bg-[#020B18] border border-[#BFDBFE] dark:border-[#F0F8FF]/10 rounded-xl px-4 py-3 text-[#0F172A] dark:text-[#F0F8FF] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-bold text-xl placeholder:text-black/30 dark:placeholder:text-[#F0F8FF]/20"
                  placeholder="Agrega un título descriptivo"
                  required
                />
              </div>

              <div>
                <label htmlFor="pin-description" className="block text-sm font-medium text-black/60 dark:text-[#F0F8FF]/60 mb-2">Descripción</label>
                <textarea
                  id="pin-description"
                  value={description}
                  maxLength={1000}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#EFF6FF]/60 dark:bg-[#020B18] border border-[#BFDBFE] dark:border-[#F0F8FF]/10 rounded-xl px-4 py-3 text-[#0F172A] dark:text-[#F0F8FF] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all min-h-[90px] resize-y placeholder:text-black/30 dark:placeholder:text-[#F0F8FF]/20"
                  placeholder="Cuéntale a todos de qué trata este nodo..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pin-category" className="block text-sm font-medium text-black/60 dark:text-[#F0F8FF]/60 mb-2">Categoría *</label>
                  <select
                    id="pin-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#EFF6FF]/60 dark:bg-[#020B18] border border-[#BFDBFE] dark:border-[#F0F8FF]/10 rounded-xl px-4 py-3 text-[#0F172A] dark:text-[#F0F8FF] focus:outline-none focus:border-[#2563EB] transition-all appearance-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pin-tags" className="block text-sm font-medium text-black/60 dark:text-[#F0F8FF]/60 mb-2">Tags</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tags className="h-4 w-4 text-black/40 dark:text-[#F0F8FF]/40" />
                    </div>
                    <input
                      id="pin-tags"
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full bg-[#EFF6FF]/60 dark:bg-[#020B18] border border-[#BFDBFE] dark:border-[#F0F8FF]/10 rounded-xl pl-10 pr-4 py-3 text-[#0F172A] dark:text-[#F0F8FF] focus:outline-none focus:border-[#2563EB] transition-all placeholder:text-black/30 dark:placeholder:text-[#F0F8FF]/20"
                      placeholder="diseño, ia, cloud"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="pin-source" className="block text-sm font-medium text-black/60 dark:text-[#F0F8FF]/60 mb-2">Fuente original (URL)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-black/40 dark:text-[#F0F8FF]/40" />
                  </div>
                  <input
                    id="pin-source"
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-[#EFF6FF]/60 dark:bg-[#020B18] border border-[#BFDBFE] dark:border-[#F0F8FF]/10 rounded-xl pl-10 pr-4 py-3 text-[#0F172A] dark:text-[#F0F8FF] focus:outline-none focus:border-[#2563EB] transition-all placeholder:text-black/30 dark:placeholder:text-[#F0F8FF]/20"
                    placeholder="https://... (ayuda a verificar la información)"
                  />
                </div>
              </div>

              <div className="space-y-2.5 p-4 rounded-xl bg-[#EFF6FF]/50 dark:bg-white/[0.03] border border-[#BFDBFE]/60 dark:border-white/10">
                <label className="flex items-start gap-3 cursor-pointer text-sm text-black/70 dark:text-white/60">
                  <input
                    type="checkbox"
                    checked={isAiGenerated}
                    onChange={(e) => setIsAiGenerated(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2563EB]"
                  />
                  <span>Este contenido fue generado o asistido por <strong>Inteligencia Artificial</strong></span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer text-sm text-black/70 dark:text-white/60">
                  <input
                    type="checkbox"
                    checked={isSensitive}
                    onChange={(e) => setIsSensitive(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#2563EB]"
                  />
                  <span>Contiene material <strong>sensible</strong> que requiere advertencia</span>
                </label>
              </div>

              <label className={`flex items-start gap-3 cursor-pointer text-sm p-4 rounded-xl border transition-colors ${
                acceptedRules
                  ? 'bg-[#2563EB]/10 border-[#2563EB]/40 text-[#0F172A] dark:text-white/80'
                  : 'bg-amber-500/5 border-amber-500/30 text-black/70 dark:text-white/60'
              }`}>
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#2563EB]"
                  required
                />
                <span className="leading-relaxed">
                  <ShieldCheck className="w-4 h-4 inline mr-1 text-[#2563EB]" />
                  Declaro que este contenido <strong>no es explícito, ilegal ni dañino para menores</strong>,
                  que tengo derecho a publicarlo y acepto las{' '}
                  <Link to="/terminos" className="text-[#2563EB] underline hover:text-[#1D4ED8]" onClick={(e) => e.stopPropagation()}>
                    reglas de la comunidad
                  </Link>. Entiendo que pasará por revisión de moderación.
                </span>
              </label>

              <div className="mt-auto pt-4 space-y-2">
                {validResult?.status === 'BLOCKED' && (
                  <p className="text-xs text-red-500 font-bold text-center flex items-center justify-center gap-1">
                    <Ban className="w-3.5 h-3.5" /> Esta imagen no cumple las normas y no puede publicarse.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || validating || validResult?.status === 'BLOCKED' || !file || !title.trim() || !acceptedRules}
                  className="w-full py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/40 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /><span>{file && isVideo(file) ? 'Subiendo video...' : 'Publicando...'}</span></>
                  ) : validating ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /><span>Validando imagen…</span></>
                  ) : validResult?.status === 'APPROVED' ? (
                    <><CheckCircle2 className="w-5 h-5" /><span>{file && isVideo(file) ? 'Publicar Video' : 'Publicar Nodo'}</span></>
                  ) : (
                    <span>{file && isVideo(file) ? 'Publicar Video' : 'Publicar Nodo'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
