import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MasonryGrid from '../components/MasonryGrid';
import PinDetailModal from '../components/PinDetailModal';
import { getFeed, getForYouFeed, searchPins, getCategories, resolveThumbUrl } from '../services/api';
import { useTheme } from '../contexts/theme-context';
import { Loader2, SearchX, Search, Sparkles, Globe, BadgeCheck, Clock, Flame, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_DATA = [
  { src: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80', label: 'Inteligencia Artificial', darkBlob1: 'rgba(37,99,235,0.45)', darkBlob2: 'rgba(99,102,241,0.30)', lightBlob1: 'rgba(37,99,235,0.18)', lightBlob2: 'rgba(99,102,241,0.12)' },
  { src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', label: 'Ciberseguridad',         darkBlob1: 'rgba(2,132,199,0.40)',  darkBlob2: 'rgba(79,70,229,0.28)',  lightBlob1: 'rgba(2,132,199,0.18)',  lightBlob2: 'rgba(79,70,229,0.12)'  },
  { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', label: 'Programación Web',    darkBlob1: 'rgba(234,179,8,0.35)',  darkBlob2: 'rgba(99,102,241,0.25)',  lightBlob1: 'rgba(234,179,8,0.14)',  lightBlob2: 'rgba(99,102,241,0.10)'  },
  { src: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&q=80', label: 'DevOps & Cloud',      darkBlob1: 'rgba(249,115,22,0.38)', darkBlob2: 'rgba(239,68,68,0.22)',  lightBlob1: 'rgba(249,115,22,0.14)', lightBlob2: 'rgba(239,68,68,0.10)'  },
  { src: 'https://images.unsplash.com/photo-1581291518655-9523c932dedf?w=800&q=80', label: 'Diseño UI/UX',        darkBlob1: 'rgba(168,85,247,0.40)', darkBlob2: 'rgba(236,72,153,0.25)', lightBlob1: 'rgba(168,85,247,0.15)', lightBlob2: 'rgba(236,72,153,0.10)' },
];

const SLOTS = [
  { tx: -47, ty: -48, scale: 0.50, ry:  22, opacity: 0.35, blur: 3.5, z: 1, px: 0.022, py: 0.011 },
  { tx: -26, ty: -52, scale: 0.73, ry:  13, opacity: 0.62, blur: 1.2, z: 2, px: 0.055, py: 0.028 },
  { tx:   0, ty: -55, scale: 1.00, ry:   0, opacity: 1.00, blur: 0.0, z: 5, px: 0.110, py: 0.055 },
  { tx:  26, ty: -52, scale: 0.73, ry: -13, opacity: 0.62, blur: 1.2, z: 2, px: 0.055, py: 0.028 },
  { tx:  47, ty: -48, scale: 0.50, ry: -22, opacity: 0.35, blur: 3.5, z: 1, px: 0.022, py: 0.011 },
];

function getSlot(imgIdx, activeIdx, n) {
  const offset = ((imgIdx - activeIdx) % n + n) % n;
  if (offset === 0)     return 2;
  if (offset === 1)     return 3;
  if (offset === 2 && n > 2) return 4;
  if (offset === n - 1) return 1;
  if (offset === n - 2 && n > 2) return 0;
  return -1;
}

function DepthGalleryHero({ apiPins = [] }) {
  const { isDarkMode } = useTheme();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const mouseRef   = useRef({ x: 0, y: 0, lx: 0, ly: 0 });
  const frameRef   = useRef(null);
  const innerRefs  = useRef([]);
  const activeRef  = useRef(0);
  const pausedRef  = useRef(false);
  const timerRef   = useRef(null);
  const dragRef    = useRef({ down: false, startX: 0, startY: 0, moved: false });
  const containerRef = useRef(null);

  const items = apiPins.length >= 3
    ? apiPins.slice(0, 5).map((p, i) => ({
        src: p.imageUrl,
        label: p.title || GALLERY_DATA[i % GALLERY_DATA.length].label,
        darkBlob1:  GALLERY_DATA[i % GALLERY_DATA.length].darkBlob1,
        darkBlob2:  GALLERY_DATA[i % GALLERY_DATA.length].darkBlob2,
        lightBlob1: GALLERY_DATA[i % GALLERY_DATA.length].lightBlob1,
        lightBlob2: GALLERY_DATA[i % GALLERY_DATA.length].lightBlob2,
      }))
    : GALLERY_DATA;

  const n = items.length;

  useEffect(() => {
    items.forEach(item => {
      const img = new Image();
      img.src = item.src;
    });
  }, []); 

  const goTo = useCallback((idx) => {
    const next = ((idx % n) + n) % n;
    setActiveIdx(next);
    activeRef.current = next;
  }, [n]);

  const goNext = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) goNext();
    }, 4500);
  }, [goNext]);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  { goPrev(); startTimer(); }
      if (e.key === 'ArrowRight') { goNext(); startTimer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, startTimer]);

  useEffect(() => {
    const loop = () => {
      const m = mouseRef.current;
      m.lx += (m.x - m.lx) * 0.055;
      m.ly += (m.y - m.ly) * 0.055;

      innerRefs.current.forEach((el, imgIdx) => {
        if (!el) return;
        const slot = getSlot(imgIdx, activeRef.current, n);
        if (slot === -1) return;
        const s = SLOTS[slot];
        const px = m.lx * s.px * 90;
        const py = m.ly * s.py * 60;
        el.style.transform = `translate3d(${px}px,${py}px,0)`;
      });

      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [n]);

  const onMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    mouseRef.current.y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current.x = 0;
    mouseRef.current.y = 0;
  }, []);

  const onMouseEnter = useCallback(() => {
    setPaused(true);
    pausedRef.current = true;
  }, []);
  const onHeroLeave = useCallback(() => {
    setPaused(false);
    pausedRef.current = false;
  }, []);

  const onPointerDown = useCallback((e) => {
    dragRef.current = { down: true, startX: e.clientX, startY: e.clientY, moved: false };
  }, []);
  const onPointerUp = useCallback((e) => {
    const d = dragRef.current;
    if (!d.down) return;
    dragRef.current.down = false;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? goNext() : goPrev();
      startTimer();
      dragRef.current.moved = true;
    }
  }, [goNext, goPrev, startTimer]);

  const onSlotClick = useCallback((slotPos) => {
    if (dragRef.current.moved) { dragRef.current.moved = false; return; }
    if (slotPos < 2)  { goPrev(); startTimer(); }
    if (slotPos > 2)  { goNext(); startTimer(); }
  }, [goPrev, goNext, startTimer]);

  const active = items[activeIdx] ?? GALLERY_DATA[0];
  const blob1  = isDarkMode ? active.darkBlob1  : active.lightBlob1;
  const blob2  = isDarkMode ? active.darkBlob2  : active.lightBlob2;
  const bgBase = isDarkMode ? '#020B18' : '#E0EEFF';
  const textColor   = isDarkMode ? 'text-white'    : 'text-[#0F172A]';
  const subColor    = isDarkMode ? 'text-white/40'  : 'text-black/40';
  const shadowCard  = isDarkMode
    ? '0 40px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)'
    : '0 30px 70px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)';

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={(e) => { onMouseLeave(e); onHeroLeave(e); }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="relative w-full overflow-hidden select-none touch-pan-y"
      style={{ height: '100svh', minHeight: 620, background: bgBase, cursor: 'grab' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 60% at 28% 38%, ${blob1}, transparent 68%),
                       radial-gradient(ellipse 55% 50% at 72% 65%, ${blob2}, transparent 68%)`,
          transition: 'background 1.4s ease-in-out',
        }}
      />

      <div className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isDarkMode ? 0.045 : 0.025,
          mixBlendMode: 'overlay',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute top-8 inset-x-0 flex justify-between items-center pl-16 pr-4 sm:px-8 md:px-16 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse shadow-[0_0_8px_#2563EB]" />
          <span className={`font-mono text-[9px] uppercase tracking-[0.4em] ${subColor} transition-colors duration-500`}>
            Nexus · Explorar
          </span>
        </div>
        <span
          className={`font-mono text-[9px] uppercase tracking-[0.3em] ${subColor} transition-all duration-700`}
          key={activeIdx}
          style={{ animation: 'fadeUp 0.5s ease forwards' }}
        >
          {active.label}
        </span>
      </div>

      <div className="absolute inset-0" style={{ perspective: '1200px', perspectiveOrigin: '50% 45%' }}>
        {items.map((item, imgIdx) => {
          const slot = getSlot(imgIdx, activeIdx, n);
          if (slot === -1) return null;
          const s = SLOTS[slot];
          const isCenter = slot === 2;
          const isLeft   = slot < 2;
          const isRight  = slot > 2;

          return (
            <div
              key={imgIdx}
              onClick={() => onSlotClick(slot)}
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width:  'clamp(140px, 26vw, 480px)',
                aspectRatio: '3 / 4',
                transform: `translateX(calc(-50% + ${s.tx}vw)) translateY(${s.ty}%) scale(${s.scale}) rotateY(${s.ry}deg)`,
                opacity: s.opacity,
                filter:  s.blur ? `blur(${s.blur}px)` : 'none',
                zIndex:  s.z,
                cursor:  isCenter ? 'grab' : 'pointer',
                willChange: 'transform, opacity, filter',
                transition: 'transform 0.88s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.65s ease-in-out, filter 0.55s ease-in-out',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: isCenter ? shadowCard : (isDarkMode ? '0 20px 40px rgba(0,0,0,0.45)' : '0 16px 36px rgba(0,0,0,0.12)'),
              }}
            >
              <div
                ref={el => { innerRefs.current[imgIdx] = el; }}
                style={{ width: '100%', height: '100%', willChange: 'transform' }}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  draggable={false}
                  className="w-full h-full object-cover"
                  loading={imgIdx < 3 ? 'eager' : 'lazy'}
                  fetchpriority={imgIdx === 0 ? 'high' : 'auto'}
                  onError={e => { e.target.src = GALLERY_DATA[imgIdx % GALLERY_DATA.length].src; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 pointer-events-none" />

                {isCenter && (
                  <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#60A5FA]">{item.label}</p>
                  </div>
                )}
              </div>

              {(isLeft || isRight) && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/20">
                  {isLeft
                    ? <ChevronLeft  className="w-8 h-8 text-white drop-shadow-lg" />
                    : <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-4 sm:left-8 md:left-16 z-10 pointer-events-none">
        <h1
          className={`font-serif font-black uppercase leading-[0.82] tracking-tight drop-shadow-sm ${textColor} transition-colors duration-500`}
          style={{ fontSize: 'clamp(2.8rem, 9vw, 8rem)' }}
        >
          Descubre<br />
          <span className="bg-gradient-to-r from-[#60A5FA] via-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
            el universo.
          </span>
        </h1>
      </div>

      <button
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 dark:bg-white/10 hover:bg-black/35 dark:hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all"
        onClick={() => { goPrev(); startTimer(); }}
        aria-label="Imagen anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 dark:bg-white/10 hover:bg-black/35 dark:hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all"
        onClick={() => { goNext(); startTimer(); }}
        aria-label="Imagen siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); startTimer(); }}
            aria-label={`Ir a imagen ${i + 1}`}
            style={{
              width: activeIdx === i ? 28 : 8, height: 8, borderRadius: 4,
              background: activeIdx === i ? '#2563EB' : (isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'),
              transition: 'width 0.4s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>

      {paused && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className={`font-mono text-[8px] uppercase tracking-[0.35em] ${isDarkMode ? 'text-white/25' : 'text-black/25'}`}>
            ⏸ pausado
          </span>
        </div>
      )}

      <button
        onClick={() => document.getElementById('feed-content')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-10 right-8 md:right-16 flex flex-col items-center gap-1.5 z-20 group pointer-events-auto"
        aria-label="Ver contenido"
      >
        <span className={`font-mono text-[8px] uppercase tracking-[0.35em] ${subColor} group-hover:text-[#2563EB] transition-colors`}>
          Explorar
        </span>
        <ChevronDown className={`w-4 h-4 ${subColor} group-hover:text-[#2563EB] animate-bounce transition-colors`} />
      </button>
    </div>
  );
}

export default function Feed() {
  const [pins, setPins] = useState([]);
  const [galleryPins, setGalleryPins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [feedMode, setFeedMode] = useState('general');

  const categoriesRef = useRef(null);
  const isDraggingCat = useRef(false);
  const catDragStartX = useRef(0);
  const catScrollLeft = useRef(0);
  const catDragMoved  = useRef(false);

  const location = useLocation();
  const navigate  = useNavigate();
  const query = new URLSearchParams(location.search).get('q');
  const [searchQuery, setSearchQuery] = useState(query || '');

  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) { setPrevQuery(query); setSearchQuery(query || ''); }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchQuery.trim() ? navigate(`/explorar?q=${encodeURIComponent(searchQuery.trim())}`) : navigate('/explorar');
  };

  const onCatDragStart = e => { isDraggingCat.current = true; catDragMoved.current = false; catDragStartX.current = e.pageX - (categoriesRef.current?.offsetLeft || 0); catScrollLeft.current = categoriesRef.current?.scrollLeft || 0; };
  const onCatDragEnd   = () => { isDraggingCat.current = false; };
  const onCatDragMove  = e => {
    if (!isDraggingCat.current) return; e.preventDefault();
    const walk = (e.pageX - (categoriesRef.current?.offsetLeft || 0) - catDragStartX.current) * 1.5;
    if (Math.abs(walk) > 5) catDragMoved.current = true;
    if (categoriesRef.current) categoriesRef.current.scrollLeft = catScrollLeft.current - walk;
  };
  const onCatClick = (id, e) => { if (catDragMoved.current) { e.preventDefault(); return; } setSelectedCategoryId(id); };

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setLoadingCategories(false));
    getFeed(1, 5).then(data => setGalleryPins(data.map(item => ({
      imageUrl: resolveThumbUrl(item.MediaUrl, 800),
      title: item.Title, categoryName: item.CategoryName,
    })))).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPins = async () => {
      setLoading(true); setError('');
      try {
        let data;
        const hasFilters = query || selectedCategoryId || verifiedOnly || sortBy !== 'recent';
        if (feedMode === 'foryou' && !hasFilters) data = await getForYouFeed();
        else if (hasFilters) data = await searchPins(query, selectedCategoryId, 1, 30, { sort: sortBy, verifiedOnly });
        else data = await getFeed();
        setPins(data.map(item => ({
          id: item.PinId, title: item.Title, description: item.Description,
          imageUrl: resolveThumbUrl(item.MediaUrl, 600),
          savesCount: item.SavesCount || 0, commentsCount: item.CommentsCount || 0,
          reactionsCount: item.ReactionsCount || 0, viewsCount: item.ViewsCount || 0,
          createdAt: item.CreatedAt || item.PublishedAt, publishedAt: item.PublishedAt || item.CreatedAt,
          ownerUserId: item.OwnerUserId, ownerUsername: item.Username,
          ownerDisplayName: item.DisplayName || item.Username || 'Creador',
          categoryId: item.CategoryId, categoryName: item.CategoryName, sourceUrl: item.SourceUrl,
          verifiedStatus: item.VerifiedStatus || 'UNVERIFIED',
          mediaKind: item.MediaKind || 'IMAGE',
          isSaved: !!item.IsSavedByViewer, isLiked: !!item.IsLikedByViewer,
        })));
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchPins();
  }, [query, selectedCategoryId, sortBy, verifiedOnly, feedMode]);

  const handleUpdatePin = updated => {
    if (selectedPin?.id === updated.id) setSelectedPin(updated);
    setPins(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePin = (pinId) => {
    setPins(prev => prev.filter(p => p.id !== pinId));
    setSelectedPin(null);
  };

  const showHero   = !query;
  const isLoggedIn = !!localStorage.getItem('nexus_token');

  return (
    <div className="min-h-screen bg-[#EFF6FF] dark:bg-[#020B18] transition-colors duration-500">

      {showHero && <DepthGalleryHero apiPins={galleryPins} />}

      <div
        id="feed-content"
        className="relative bg-[#EFF6FF] dark:bg-[#041020] transition-colors duration-500"
        style={{ borderRadius: showHero ? '28px 28px 0 0' : 0, marginTop: showHero ? -28 : 0 }}
      >
        <div className="sticky top-0 z-30 bg-[#EFF6FF]/96 dark:bg-[#041020]/96 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors duration-300">

          <div className="px-4 sm:px-6 lg:px-8 max-w-[2000px] mx-auto pt-5 pb-3 flex items-center gap-3 flex-wrap">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0 max-w-md" role="search">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30 dark:text-white/25 pointer-events-none" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar nodos..." aria-label="Buscar nodos"
                className="w-full bg-white dark:bg-[#0A1830] border border-black/10 dark:border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F0F8FF] placeholder:text-black/28 dark:placeholder:text-white/20 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all shadow-sm" />
            </form>

            <div className="flex items-center gap-2 ml-auto">
              {isLoggedIn && (
                <div className="flex p-0.5 rounded-full bg-white dark:bg-[#0A1830] border border-black/8 dark:border-white/10 shadow-sm">
                  {[['general', <Globe key="g" className="w-3 h-3" />, 'General'], ['foryou', <Sparkles key="s" className="w-3 h-3" />, 'Para ti']].map(([mode, icon, label]) => (
                    <button key={mode} onClick={() => setFeedMode(mode)} aria-pressed={feedMode === mode}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${feedMode === mode ? 'bg-[#2563EB] text-white' : 'text-black/45 dark:text-white/35'}`}>
                      {icon}<span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex p-0.5 rounded-full bg-white dark:bg-[#0A1830] border border-black/8 dark:border-white/10 shadow-sm">
                {[['recent', <Clock key="c" className="w-3 h-3" />, 'Recientes'], ['popular', <Flame key="f" className="w-3 h-3" />, 'Populares']].map(([sort, icon, label]) => (
                  <button key={sort} onClick={() => setSortBy(sort)} aria-pressed={sortBy === sort} title={label}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold transition-all ${sortBy === sort ? 'bg-[#2563EB] text-white' : 'text-black/40 dark:text-white/35'}`}>
                    {icon}
                  </button>
                ))}
              </div>

              <button onClick={() => setVerifiedOnly(v => !v)} aria-pressed={verifiedOnly} title="Solo verificados"
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-mono font-bold border shadow-sm transition-all ${verifiedOnly ? 'bg-blue-500 text-white border-transparent' : 'bg-white dark:bg-[#0A1830] text-black/40 dark:text-white/35 border-black/8 dark:border-white/10'}`}>
                <BadgeCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!loadingCategories && categories.length > 0 && (
            <div className="relative overflow-hidden pb-4">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#EFF6FF] dark:from-[#041020] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#EFF6FF] dark:from-[#041020] to-transparent z-10 pointer-events-none" />
              <div ref={categoriesRef}
                onMouseDown={onCatDragStart} onMouseLeave={onCatDragEnd} onMouseUp={onCatDragEnd} onMouseMove={onCatDragMove}
                className="flex gap-2 overflow-x-auto px-4 sm:px-8 hide-scrollbar snap-x cursor-grab active:cursor-grabbing select-none">
                {[{ id: null, name: 'Todos' }, ...categories].map(cat => (
                  <button key={cat.id ?? 'all'} onClick={e => onCatClick(cat.id, e)}
                    className={`snap-start shrink-0 px-5 py-2 rounded-full font-mono font-bold text-[11px] uppercase tracking-wider border transition-all whitespace-nowrap ${selectedCategoryId === cat.id
                      ? 'bg-[#2563EB] text-white border-transparent shadow-[0_2px_10px_rgba(22,163,74,0.3)]'
                      : 'bg-white dark:bg-[#0A1830] text-black/65 dark:text-white/55 border-black/8 dark:border-white/10 hover:-translate-y-px'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {}
        {(query || selectedCategoryId) && (
          <div className="pt-10 px-4 sm:px-6 lg:px-8 max-w-[2000px] mx-auto mb-2">
            {query
              ? <><h2 className="text-3xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF]">Resultados para <span className="text-[#2563EB]">"{query}"</span></h2><p className="text-black/40 dark:text-white/35 mt-1 font-mono text-xs uppercase tracking-widest">{pins.length} nodos</p></>
              : (() => { const cat = categories.find(c => c.id === selectedCategoryId); return cat ? <><span className="font-mono text-xs uppercase tracking-[0.3em] text-[#2563EB] font-bold">Categoría</span><h2 className="text-4xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] mt-1">{cat.name}</h2></> : null; })()
            }
          </div>
        )}

        {}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
            <span className="font-mono text-xs uppercase tracking-widest text-black/25 dark:text-white/25">Cargando nodos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center"><SearchX className="w-7 h-7 text-red-400" /></div>
            <p className="font-serif text-lg font-bold text-[#0F172A] dark:text-white">Sin conexión</p>
            <p className="text-xs text-black/40 dark:text-white/35 font-mono">Backend en <span className="text-[#2563EB]">localhost:8000</span></p>
          </div>
        ) : pins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center"><SearchX className="w-7 h-7 text-black/25 dark:text-white/25" /></div>
            <p className="font-serif text-xl font-black text-[#0F172A] dark:text-[#F0F8FF]">Sin nodos</p>
            <p className="text-xs text-black/40 dark:text-white/35 max-w-xs">Prueba otra categoría.</p>
          </div>
        ) : (
          <MasonryGrid pins={pins} onPinClick={setSelectedPin} onUpdatePin={handleUpdatePin} />
        )}
      </div>

      {selectedPin && (
        <PinDetailModal pin={selectedPin} onClose={() => setSelectedPin(null)} onUpdatePin={handleUpdatePin} onDeletePin={handleDeletePin} />
      )}
    </div>
  );
}
