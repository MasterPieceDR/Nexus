import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Settings, Image as ImageIcon, Bookmark,
  Loader2, Grid3X3, MapPin, Mail, Heart, Eye, Star,
  Globe, Building2, Phone, ExternalLink
} from 'lucide-react';
import { getUserPins, getSavedPins, getLikedPins, getMyProfile, resolveMediaUrl } from '../services/api';
import { Camera } from 'lucide-react';
import MasonryGrid from '../components/MasonryGrid';
import PinDetailModal from '../components/PinDetailModal';
import ProfileEditModal from '../components/ProfileEditModal';

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n ?? 0);
}

function StatBadge({ icon: Icon, label, value, color = '#2563EB' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-5 py-4 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#BFDBFE] dark:border-white/10 shadow-sm backdrop-blur-md min-w-[90px] transition-all hover:scale-105 hover:shadow-md">
      <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-xl font-black font-serif text-[#0F172A] dark:text-[#F0F8FF]">{fmt(value)}</span>
      <span className="text-[10px] uppercase tracking-widest text-[#0F172A]/50 dark:text-white/40 font-mono font-bold">{label}</span>
    </div>
  );
}

function EmptyState({ tab }) {
  const cfg = {
    created: { icon: <ImageIcon className="w-10 h-10 text-[#2563EB]/50" />, title: 'Aún sin publicaciones', desc: 'Sube tu primer nodo visual y comienza a construir tu presencia en Nexus.' },
    saved:   { icon: <Bookmark className="w-10 h-10 text-purple-500/50" />, title: 'Sin guardados todavía', desc: 'Explora el feed y guarda los nodos que te inspiren.' },
    liked:   { icon: <Heart className="w-10 h-10 text-red-500/50" />, title: 'Sin reacciones todavía', desc: 'Reacciona con me gusta a los nodos que te encanten.' },
  }[tab] || {};

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white/30 dark:bg-white/5 rounded-3xl border border-[#BFDBFE]/40 dark:border-white/5 backdrop-blur-sm max-w-lg mx-auto shadow-sm">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[#0F172A]/5 dark:bg-white/5 border border-[#BFDBFE] dark:border-white/10 flex items-center justify-center shadow-inner">
          {cfg.icon}
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB]/20 animate-ping" />
      </div>
      <h3 className="text-xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] mb-2">{cfg.title}</h3>
      <p className="text-[#0F172A]/60 dark:text-white/50 max-w-xs text-sm leading-relaxed">{cfg.desc}</p>
    </div>
  );
}

export default function Profile() {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_user') || 'null'); } catch { return null; }
  });
  const [activeTab, setActiveTab] = useState('created');
  const [myPins,    setMyPins]    = useState([]);
  const [savedPins, setSavedPins] = useState([]);
  const [likedPins, setLikedPins] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const [scrollY,   setScrollY]   = useState(0);
  const [editOpen,  setEditOpen]  = useState(false);
  const [profile,   setProfile]   = useState(null);
  const navigate = useNavigate();
  const headerRef = useRef(null);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    getMyProfile().then(setProfile).catch(() => {});
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    Promise.all([getUserPins(), getSavedPins(), getLikedPins()])
      .then(([pins, saved, liked]) => {
        const mapPin = (item, extra = {}) => ({
          id: item.PinId,
          title: item.Title,
          description: item.Description,
          imageUrl: resolveMediaUrl(item.MediaUrl),
          savesCount: item.SavesCount || 0,
          reactionsCount: item.ReactionsCount || 0,
          viewsCount: item.ViewsCount || 0,
          ownerUserId: item.OwnerUserId ?? user?.UserId,
          ownerDisplayName: extra.owner || item.DisplayName || item.Username || 'Creador',
          isSaved: extra.isSaved ?? false,
          mediaKind: item.MediaKind || 'IMAGE',
          categoryId: item.CategoryId,
          categoryName: item.CategoryName,
          verifiedStatus: item.VerifiedStatus || 'UNVERIFIED',
          createdAt: item.CreatedAt || item.PublishedAt,
          publishedAt: item.PublishedAt || item.CreatedAt,
          sourceUrl: item.SourceUrl,
        });
        setMyPins(pins.map(p => mapPin(p, { owner: user.DisplayName || user.Username || 'Tú' })));
        setSavedPins(saved.map(p => mapPin(p, { isSaved: true })));
        setLikedPins(liked.map(p => mapPin(p)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpdatePin = (updated) => {
    if (selectedPin?.id === updated.id) setSelectedPin(updated);
    setMyPins(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSavedPins(prev => updated.isSaved === false
      ? prev.filter(p => p.id !== updated.id)
      : prev.map(p => p.id === updated.id ? updated : p));
    setLikedPins(prev => (updated.isLikedByViewer === false || updated.IsLikedByViewer === 0)
      ? prev.filter(p => p.id !== updated.id)
      : prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePin = (pinId) => {
    setMyPins(prev => prev.filter(p => p.id !== pinId));
    setSavedPins(prev => prev.filter(p => p.id !== pinId));
    setLikedPins(prev => prev.filter(p => p.id !== pinId));
    setSelectedPin(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    sessionStorage.removeItem('gh_code_processing');
    navigate('/login');
  };

  if (!user) return null;

  const displayName = user.DisplayName || `${user.FirstName || ''} ${user.LastName || ''}`.trim() || user.Username;
  const totalViews  = myPins.reduce((s, p) => s + (p.viewsCount || 0), 0);
  const totalSaves  = myPins.reduce((s, p) => s + (p.savesCount || 0), 0);
  const activePins  = activeTab === 'created' ? myPins : activeTab === 'saved' ? savedPins : likedPins;

  const initials = (displayName || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const avatarSrc = profile?.AvatarUrl ? resolveMediaUrl(profile.AvatarUrl) : null;

  return (
    <div className="min-h-screen bg-[#EFF6FF] dark:bg-[#041020] transition-colors duration-300">

      <div className="relative h-40 sm:h-56 md:h-72 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-[130%] bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1800&q=80)`,
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#EFF6FF] dark:from-[#041020] via-black/50 to-black/20" />
        <div className="absolute top-8 right-12 w-48 h-48 rounded-full bg-[#2563EB]/20 blur-3xl pointer-events-none" />

        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex gap-2 z-20">
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Editar perfil"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 transition-all hover:scale-105 active:scale-95 text-xs font-bold font-mono uppercase tracking-wider"
          >
            <Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white backdrop-blur-md border border-red-500/30 transition-all hover:scale-105 active:scale-95 text-xs font-mono uppercase tracking-wider font-bold"
          >
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 md:-mt-20 relative z-10" ref={headerRef}>

        <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-8">
          <div className="relative flex-shrink-0 group cursor-pointer self-center sm:self-auto" onClick={() => setEditOpen(true)} title="Cambiar foto">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl border-4 border-[#EFF6FF] dark:border-[#041020] shadow-[0_8px_32px_rgba(37,99,235,0.25)] dark:shadow-[0_0_48px_rgba(37,99,235,0.35)] overflow-hidden transition-transform duration-500 hover:scale-105">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
                  <span className="text-white font-black font-serif text-4xl select-none">{initials}</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2563EB] border-[3px] border-[#EFF6FF] dark:border-[#041020] shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse" />
          </div>

          <div className="flex-1 pb-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] tracking-tight drop-shadow-sm">
                {displayName}
              </h1>
              {profile?.IsCompany && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[10px] font-mono font-black uppercase tracking-widest text-[#2563EB]">
                  <Building2 className="w-3 h-3" /> Empresa
                </span>
              )}
            </div>

            <p className="text-sm font-mono text-[#2563EB] dark:text-[#60A5FA] mb-3">@{user.Username}</p>

            {profile?.Bio && (
              <p className="text-sm text-[#0F172A]/75 dark:text-white/65 max-w-xl leading-relaxed mb-3">
                {profile.Bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#BFDBFE]/50 dark:border-white/8 text-xs text-[#0F172A]/70 dark:text-white/55">
                <Mail className="w-3 h-3 text-[#2563EB]" /> {user.Email}
              </span>
              {(profile?.LocationName) && (
                <span className="flex items-center gap-1.5 bg-white/70 dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#BFDBFE]/50 dark:border-white/8 text-xs text-[#0F172A]/70 dark:text-white/55">
                  <MapPin className="w-3 h-3 text-[#2563EB]" /> {profile.LocationName}
                </span>
              )}
              {profile?.WebsiteUrl && (
                <a
                  href={profile.WebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white/70 dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#BFDBFE]/50 dark:border-white/8 text-xs text-[#2563EB] hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] transition-colors font-bold"
                >
                  <Globe className="w-3 h-3" /> {profile.WebsiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>

        {}
        {profile?.IsCompany && profile?.CompanyName && (
          <div className="mb-8 p-5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#BFDBFE] dark:border-white/10 max-w-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              <span className="text-sm font-black font-serif text-[#0F172A] dark:text-[#F0F8FF]">{profile.CompanyName}</span>
              {profile.ProfessionalArea && (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-mono font-bold uppercase tracking-wider">{profile.ProfessionalArea}</span>
              )}
            </div>
            <div className="space-y-1.5 text-xs text-[#0F172A]/65 dark:text-white/55 leading-relaxed">
              {profile.Mission && <p><strong className="text-[#0F172A]/80 dark:text-white/70">Misión:</strong> {profile.Mission}</p>}
              {profile.Vision  && <p><strong className="text-[#0F172A]/80 dark:text-white/70">Visión:</strong> {profile.Vision}</p>}
              {(profile.ContactEmail || profile.ContactPhone || profile.WebsiteUrl) && (
                <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-[#BFDBFE]/40 dark:border-white/5">
                  {profile.ContactEmail && (
                    <a href={`mailto:${profile.ContactEmail}`} className="flex items-center gap-1 text-[#2563EB] hover:underline">
                      <Mail className="w-3 h-3" /> {profile.ContactEmail}
                    </a>
                  )}
                  {profile.ContactPhone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#2563EB]" /> {profile.ContactPhone}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
          <StatBadge icon={ImageIcon} label="Nodos"    value={myPins.length}    color="#2563EB" />
          <StatBadge icon={Bookmark}  label="Guardados" value={savedPins.length} color="#8B5CF6" />
          <StatBadge icon={Heart}     label="Me Gusta"  value={likedPins.length} color="#F43F5E" />
          <StatBadge icon={Eye}       label="Vistas"    value={totalViews}        color="#0EA5E9" />
          <StatBadge icon={Star}      label="Guardas"   value={totalSaves}        color="#F59E0B" />
        </div>

        <div className="flex gap-1 mb-8 p-1.5 rounded-2xl bg-white/60 dark:bg-[#0D1B38] border border-[#BFDBFE] dark:border-white/5 shadow-sm w-full sm:w-fit overflow-x-auto">
          {[
            { id: 'created', label: 'Mis Nodos',  icon: Grid3X3, count: myPins.length,    activeColor: 'bg-[#2563EB]' },
            { id: 'saved',   label: 'Guardados',  icon: Bookmark, count: savedPins.length, activeColor: 'bg-[#8B5CF6]' },
            { id: 'liked',   label: 'Me Gusta',   icon: Heart,    count: likedPins.length, activeColor: 'bg-[#F43F5E]' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-serif font-black uppercase tracking-wider ${
                activeTab === tab.id
                  ? `${tab.activeColor} text-white shadow-md translate-y-[-1px]`
                  : 'text-[#0F172A]/55 dark:text-white/45 hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-black/8 dark:bg-white/10 text-[#0F172A]/55 dark:text-white/35'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
                <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-[#2563EB]/20 animate-ping" />
              </div>
              <p className="text-black/50 dark:text-white/35 font-mono text-xs uppercase tracking-widest font-bold">
                Cargando biblioteca visual…
              </p>
            </div>
          ) : activePins.length > 0 ? (
            <MasonryGrid pins={activePins} onPinClick={setSelectedPin} onUpdatePin={handleUpdatePin} />
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </div>
      </div>

      {selectedPin && (
        <PinDetailModal pin={selectedPin} onClose={() => setSelectedPin(null)} onUpdatePin={handleUpdatePin} onDeletePin={handleDeletePin} />
      )}

      {editOpen && (
        <ProfileEditModal onClose={() => setEditOpen(false)} onSaved={(updated) => setProfile(updated)} />
      )}
    </div>
  );
}
