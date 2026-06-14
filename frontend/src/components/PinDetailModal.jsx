import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, MessageSquare, Heart, Bookmark, Calendar, User, Loader2, Flag, BadgeCheck, AlertTriangle, ExternalLink, Play, Trash2 } from 'lucide-react';
import { getPinComments, createPinComment, likePin, savePin, searchPins, resolveMediaUrl, deletePin, getStoredUser } from '../services/api';
import MasonryGrid from './MasonryGrid';
import ReportModal from './ReportModal';

export default function PinDetailModal({ pin, onClose, onUpdatePin, onDeletePin }) {
  const navigate = useNavigate();
  const [activePin, setActivePin] = useState(pin);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [similarPins, setSimilarPins] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showStickyPrompt, setShowStickyPrompt] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const modalRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem('nexus_token');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const currentUser = getStoredUser();
  const isOwner = !!(currentUser && (
    (activePin.ownerUserId && Number(currentUser.UserId) === Number(activePin.ownerUserId)) ||
    (activePin.ownerUsername && currentUser.Username &&
      activePin.ownerUsername.toLowerCase() === currentUser.Username.toLowerCase())
  ));

  const [prevPin, setPrevPin] = useState(pin);
  if (prevPin !== pin) {
    setPrevPin(pin);
    setActivePin(pin);
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const data = await getPinComments(activePin.id);
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePin.id, onClose]);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoadingSimilar(true);
      try {
        const categoryId = activePin.CategoryId || activePin.categoryId;
        const data = await searchPins(null, categoryId);
        const filtered = data
          .filter(p => p.PinId !== activePin.id)
          .map(item => ({
            id: item.PinId,
            title: item.Title,
            description: item.Description,
            imageUrl: resolveMediaUrl(item.MediaUrl),
            savesCount: item.SavesCount || 0,
            reactionsCount: item.ReactionsCount || 0,
            viewsCount: item.ViewsCount || 0,
            ownerDisplayName: item.DisplayName || item.Username || 'Creador',
            isSaved: item.IsSavedByViewer === 1,
            isLiked: item.IsLikedByViewer === 1
          }));
        setSimilarPins(filtered);
      } catch (err) {
        console.error('Error fetching similar pins:', err);
      } finally {
        setLoadingSimilar(false);
      }
    };
    if (activePin.id) {
      fetchSimilar();
    }
  }, [activePin.id, activePin.CategoryId, activePin.categoryId]);

  const handleScroll = (e) => {
    if (isLoggedIn) return;
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 180) {
      setShowStickyPrompt(true);
    } else {
      setShowStickyPrompt(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await likePin(activePin.id);
      const updated = {
        ...activePin,
        reactionsCount: res.liked ? (activePin.reactionsCount || 0) + 1 : Math.max((activePin.reactionsCount || 0) - 1, 0),
        isLiked: res.liked
      };
      setActivePin(updated);
      onUpdatePin(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await savePin(activePin.id);
      const updated = {
        ...activePin,
        savesCount: res.saved ? (activePin.savesCount || 0) + 1 : Math.max((activePin.savesCount || 0) - 1, 0),
        isSaved: res.saved
      };
      setActivePin(updated);
      onUpdatePin(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePin(activePin.id);
      if (onDeletePin) onDeletePin(activePin.id);
      else onClose();
    } catch (err) {
      alert(err.message || 'Error al eliminar la publicación');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await createPinComment(activePin.id, newComment);
      const updatedComments = await getPinComments(activePin.id);
      setComments(updatedComments);
      setNewComment('');

      const updated = {
        ...activePin,
        commentsCount: (activePin.commentsCount || 0) + 1
      };
      setActivePin(updated);
      onUpdatePin(updated);
    } catch (err) {
      setError(err.message || 'Error al enviar el comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleUpdateSimilarPin = (updated) => {
    setSimilarPins(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6 md:p-10 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        onScroll={handleScroll}
        className="bg-white dark:bg-[#020B18] border border-[#DBEAFE] dark:border-white/10 w-full max-w-5xl h-[85vh] sm:h-[80vh] rounded-3xl overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[4px_4px_20px_rgba(37,99,235,0.15)] relative animate-scale-up custom-scrollbar flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 bg-[#EFF6FF]/90 dark:bg-[#0F172A]/90 border border-black/10 dark:border-white/20 text-black dark:text-white p-2.5 rounded-full hover:bg-black/5 hover:text-[#2563EB] dark:hover:bg-white dark:hover:text-black transition-all shadow-sm backdrop-blur-sm"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row w-full min-h-fit md:min-h-[500px]">
          <div className="w-full md:w-[55%] h-[320px] md:h-auto md:min-h-[500px] bg-black/5 dark:bg-black/40 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-[#DBEAFE] dark:border-white/10 overflow-hidden">
            {activePin.mediaKind === 'VIDEO' ? (
              <video
                src={activePin.imageUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain bg-black"
                style={{ maxHeight: '100%' }}
              />
            ) : (
              <img
                src={activePin.imageUrl}
                alt={activePin.title}
                className="w-full h-full object-cover transition-transform duration-[1s] hover:scale-105"
              />
            )}
            {activePin.categoryName && (
              <span className="absolute top-4 left-4 bg-[#2563EB] text-white border border-[#2563EB] dark:border-none px-4 py-1.5 rounded-full text-xs font-serif font-black tracking-widest uppercase shadow-sm">
                {activePin.categoryName}
              </span>
            )}
            {activePin.mediaKind === 'VIDEO' && (
              <span className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[11px] font-mono font-bold">
                <Play className="w-3 h-3 fill-current" /> VIDEO
              </span>
            )}
          </div>

          <div className="w-full md:w-[45%] flex flex-col justify-between p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-black/50 dark:text-[#F0F8FF]/50 font-serif tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(activePin.publishedAt || activePin.createdAt)}</span>
                  <span className="mx-1">•</span>
                  <User className="w-3.5 h-3.5" />
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/usuario/${activePin.ownerUserId}`);
                    }}
                    className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-white underline underline-offset-2 transition-colors"
                  >
                    {activePin.ownerDisplayName || 'Creador'}
                  </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#0F172A] dark:text-[#F0F8FF] tracking-tight leading-tight">
                  {activePin.title}
                </h2>
                <p className="text-sm text-black/65 dark:text-[#F0F8FF]/70 mt-3 leading-relaxed">
                  {activePin.description || 'Sin descripción adicional para este nodo.'}
                </p>

                <div className="mt-3">
                  {activePin.verifiedStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Información verificada por moderación
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Información sin verificar: evalúala con criterio
                    </span>
                  )}
                  {activePin.sourceUrl && (
                    <a
                      href={activePin.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ml-2 text-[11px] text-[#2563EB] hover:underline font-bold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Fuente original
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-black/10 dark:border-white/10">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 bg-transparent text-black dark:text-white hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-5 h-5 transition-transform ${activePin.isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-current hover:fill-red-500'}`} />
                  <span className="font-serif font-bold text-sm">{activePin.reactionsCount || 0}</span>
                </button>

                <button className="flex items-center gap-2 bg-transparent text-black dark:text-white pointer-events-none">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-serif font-bold text-sm">{comments.length}</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 bg-transparent transition-colors ml-auto ${activePin.isSaved ? 'text-[#2563EB]' : 'text-black dark:text-white hover:text-[#2563EB]'}`}
                >
                  <Bookmark className={`w-5 h-5 ${activePin.isSaved ? 'fill-[#2563EB]' : 'fill-none'}`} />
                  <span className="font-serif font-bold text-sm">
                    {activePin.isSaved ? 'Guardado' : 'Guardar'}
                  </span>
                </button>

                {isOwner && (
                  confirmDelete ? (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[11px] text-red-500 font-bold font-mono">¿Eliminar?</span>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 text-black dark:text-white text-[11px] font-bold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      aria-label="Eliminar publicación"
                      title="Eliminar mi publicación"
                      className="flex items-center gap-1.5 bg-transparent text-black/40 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-serif font-bold text-xs">Eliminar</span>
                    </button>
                  )
                )}

                <button
                  onClick={() => isLoggedIn ? setReportOpen(true) : (window.location.href = '/login')}
                  aria-label="Reportar este contenido"
                  title="Reportar contenido"
                  className={`flex items-center gap-1.5 bg-transparent text-black/50 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors ${isOwner ? '' : 'ml-auto'}`}
                >
                  <Flag className="w-4 h-4" />
                  <span className="font-serif font-bold text-xs">Reportar</span>
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-black/50 dark:text-[#F0F8FF]/50 font-serif mb-4 flex items-center gap-2">
                  <span>Comentarios</span>
                  <span className="bg-black/10 dark:bg-white/10 text-black dark:text-white text-xs px-2 py-0.5 rounded-full font-mono font-normal">{comments.length}</span>
                </h3>

                {loadingComments ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-black/40 dark:text-[#F0F8FF]/40 italic py-4">No hay comentarios en este nodo. ¡Sé el primero en aportar!</p>
                ) : (
                  <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {comments.map((comment) => (
                      <div
                        key={comment.CommentId}
                        className="bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-2xl p-4 transition-all hover:bg-black/[0.05] dark:hover:bg-white/[0.05]"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-serif font-black text-xs text-[#2563EB]">{comment.author_name}</span>
                          <span className="text-[10px] text-black/40 dark:text-[#F0F8FF]/40">{formatDate(comment.CreatedAt)}</span>
                        </div>
                        <p className="text-xs text-black/85 dark:text-[#F0F8FF]/85 leading-relaxed font-sans">{comment.Content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-mono font-bold mt-4" role="alert">{error}</p>
            )}
            <form
              onSubmit={handleSubmitComment}
              className="pt-4 border-t border-[#DBEAFE] dark:border-white/10 flex gap-3 mt-6 items-end"
            >
              <textarea
                rows={1}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe una aportación al nodo..."
                className="flex-1 bg-black/5 dark:bg-white/[0.05] border border-[#DBEAFE] dark:border-white/10 rounded-2xl px-4 py-3 text-xs md:text-sm text-black dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30 transition-all resize-none placeholder:text-black/35 dark:placeholder:text-white/20 custom-scrollbar"
                style={{ maxHeight: '100px' }}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-[#2563EB] text-white border border-transparent p-3.5 rounded-2xl disabled:bg-[#2563EB]/50 hover:bg-[#1D4ED8] transition-all shadow-sm hover:shadow-md translate-y-[-1px] active:translate-y-0 disabled:translate-y-0 disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-[#DBEAFE] dark:border-white/10 relative bg-[#F9F6F0]/40 dark:bg-white/[0.01]">
          <h3 className="text-xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] mb-6 uppercase tracking-wider flex items-center gap-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB]" />
            Más para explorar
          </h3>

          {loadingSimilar ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
              <p className="text-xs text-black/40 dark:text-white/30 font-mono uppercase tracking-widest">Buscando similares...</p>
            </div>
          ) : similarPins.length === 0 ? (
            <p className="text-xs text-black/45 dark:text-white/40 italic text-center py-8">
              No se encontraron nodos relacionados en esta categoría.
            </p>
          ) : (
            <div className={`transition-all duration-500 ${showStickyPrompt ? 'blur-[3px] pointer-events-none select-none' : ''}`}>
              <MasonryGrid
                pins={similarPins}
                onPinClick={(clicked) => {
                  setActivePin(clicked);
                  if (modalRef.current) {
                    modalRef.current.scrollTop = 0;
                  }
                }}
                onUpdatePin={handleUpdateSimilarPin}
              />
            </div>
          )}

          {showStickyPrompt && (
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#020B18] dark:via-[#020B18]/85 dark:to-transparent z-25 flex items-center justify-center pointer-events-auto" />
          )}
        </div>

        {showStickyPrompt && (
          <div className="sticky bottom-0 left-0 right-0 z-30 p-6 bg-white/95 dark:bg-[#041020]/95 border-t border-[#BFDBFE] dark:border-white/10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-5 animate-slide-up">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
                Más ideas, solo para ti
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
              </h3>
              <p className="text-xs text-black/60 dark:text-white/50 mt-1 leading-relaxed">
                Inicia sesión o regístrate en Nexus para seguir explorando y comenzar a guardar tus colecciones visuales.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-mono uppercase tracking-widest font-black transition-all shadow-md active:translate-y-[1px]"
              >
                Continuar con correo
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-[#0D1B38] border border-[#2563EB]/50 text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/5 text-[11px] font-mono uppercase tracking-widest font-black transition-all"
              >
                Únete gratis
              </button>
            </div>
          </div>
        )}
      </div>

      {reportOpen && (
        <ReportModal
          entityType="PIN"
          entityId={activePin.id}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
