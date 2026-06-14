import { useState, useEffect, useRef } from 'react';
import { Heart, Bookmark, Play } from 'lucide-react';
import { likePin, savePin } from '../services/api';

const CATEGORY_FALLBACKS = {
  'Arte': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  'Diseño': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&q=80',
  'Fotografía': 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=600&q=80',
  'Tecnología': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  'Inteligencia Artificial': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&q=80',
  'Cloud Computing': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
  'Ciberseguridad': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
  'DevOps': 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=600&q=80',
  'Diseño UI/UX': 'https://images.unsplash.com/photo-1581291518655-9523c932dedf?w=600&q=80',
  'Programación Web': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  'Innovación': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
  'Sostenibilidad Tecnológica': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
  'Bases de Datos': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
  'Redes': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
  'Prototipos': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80',
  'Robótica e IoT': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
};
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80';

export default function PinCard({ pin, onClick, onUpdatePin }) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState(pin.imageUrl || DEFAULT_FALLBACK);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.1, rootMargin: '50px' }
    );
    const node = cardRef.current;
    if (node) observer.observe(node);
    return () => { if (node) observer.unobserve(node); };
  }, []);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!localStorage.getItem('nexus_token')) { window.location.href = '/login'; return; }
    try {
      const res = await likePin(pin.id);
      if (onUpdatePin) onUpdatePin({ ...pin, reactionsCount: res.liked ? (pin.reactionsCount || 0) + 1 : Math.max((pin.reactionsCount || 0) - 1, 0), isLiked: res.liked });
    } catch {  }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!localStorage.getItem('nexus_token')) { window.location.href = '/login'; return; }
    try {
      const res = await savePin(pin.id);
      if (onUpdatePin) onUpdatePin({ ...pin, savesCount: res.saved ? (pin.savesCount || 0) + 1 : Math.max((pin.savesCount || 0) - 1, 0), isSaved: res.saved });
    } catch {  }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`masonry-item relative group rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-[#0D1B38] border border-[#DBEAFE] dark:border-white/10 shadow-[0_4px_20px_rgba(37,99,235,0.06)] dark:shadow-[0_4px_20px_rgba(37,99,235,0.10)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.15)] dark:hover:shadow-[0_16px_40px_rgba(37,99,235,0.22)] transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={imgSrc}
          alt={pin.title}
          className="w-full h-auto object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          loading="lazy"
          onError={() => setImgSrc(CATEGORY_FALLBACKS[pin.categoryName] || DEFAULT_FALLBACK)}
        />

        {pin.mediaKind === 'VIDEO' && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-mono font-bold pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-current" /> VIDEO
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="flex items-center justify-between">
            {pin.categoryName && (
              <span className="text-[9px] font-mono font-black uppercase tracking-widest bg-[#2563EB]/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/20">
                {pin.categoryName}
              </span>
            )}
            <span className="text-[10px] text-white/80 font-mono ml-auto backdrop-blur-sm bg-black/30 px-2 py-0.5 rounded-full">
              {pin.ownerDisplayName}
            </span>
          </div>

          <div>
            <h3 className="text-white font-serif font-bold text-sm leading-snug drop-shadow-md line-clamp-2">
              {pin.title}
            </h3>
          </div>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-mono font-bold transition-[background-color,border-color] ${pin.isLiked ? 'bg-red-500/80 border-red-400/50 text-white' : 'bg-black/40 border-white/20 text-white/80 hover:bg-red-500/70 hover:border-red-400/50'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${pin.isLiked ? 'fill-current' : ''}`} />
            <span>{pin.reactionsCount || 0}</span>
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-mono font-bold transition-[background-color,border-color] ${pin.isSaved ? 'bg-[#2563EB]/80 border-blue-400/50 text-white' : 'bg-black/40 border-white/20 text-white/80 hover:bg-[#2563EB]/70 hover:border-blue-400/50'}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${pin.isSaved ? 'fill-current' : ''}`} />
            <span>{pin.isSaved ? 'Guardado' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
