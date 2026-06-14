import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Globe, MapPin, Image as ImageIcon, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { getPublicProfile, getPublicUserPins, resolveMediaUrl } from '../services/api';
import MasonryGrid from '../components/MasonryGrid';
import PinDetailModal from '../components/PinDetailModal';

function mapPin(item) {
  return {
    id: item.PinId,
    title: item.Title,
    description: item.Description,
    imageUrl: resolveMediaUrl(item.MediaUrl),
    mediaKind: item.MediaKind || 'IMAGE',
    savesCount: item.SavesCount || 0,
    reactionsCount: item.ReactionsCount || 0,
    viewsCount: item.ViewsCount || 0,
    commentsCount: item.CommentsCount || 0,
    categoryId: item.CategoryId,
    categoryName: item.CategoryName,
    ownerDisplayName: item.DisplayName || item.Username || 'Creador',
    ownerUserId: item.OwnerUserId,
    ownerUsername: item.Username,
    publishedAt: item.PublishedAt,
    createdAt: item.CreatedAt,
  };
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);

  useEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      getPublicProfile(userId),
      getPublicUserPins(userId),
    ])
      .then(([prof, rawPins]) => {
        setProfile(prof);
        setPins((rawPins || []).map(mapPin));
      })
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUpdatePin = (updated) => {
    setPins(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selectedPin?.id === updated.id) setSelectedPin(updated);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#EFF6FF] dark:bg-[#020B18]">
        <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 bg-[#EFF6FF] dark:bg-[#020B18] px-4">
        <User className="w-14 h-14 text-[#2563EB]/30" />
        <h2 className="text-xl font-black font-serif text-[#0F172A] dark:text-[#F0F8FF]">Usuario no encontrado</h2>
        <p className="text-sm text-black/50 dark:text-white/40">Este perfil no existe o fue eliminado.</p>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-bold hover:bg-[#1D4ED8] transition-all">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    );
  }

  const initials = (profile.DisplayName || profile.Username || '?')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#EFF6FF] dark:bg-[#020B18] transition-colors duration-300">

      <div className="w-full h-40 sm:h-52 bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #60A5FA 0%, transparent 50%), radial-gradient(circle at 75% 30%, #818CF8 0%, transparent 45%)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 sm:-mt-20 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-shrink-0">
            {profile.AvatarUrl ? (
              <img src={profile.AvatarUrl} alt={profile.DisplayName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-[#020B18] object-cover shadow-xl" />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-[#020B18] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-xl">
                <span className="text-white font-black font-serif text-3xl select-none">{initials}</span>
              </div>
            )}
          </div>

          <button onClick={() => navigate(-1)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#BFDBFE] dark:border-white/10 text-sm text-[#0F172A]/60 dark:text-white/50 hover:text-[#2563EB] dark:hover:text-[#60A5FA] bg-white/80 dark:bg-[#041020]/80 backdrop-blur-sm transition-all self-start mt-20">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#0F172A] dark:text-[#F0F8FF] tracking-tight">
              {profile.DisplayName || profile.Username}
            </h1>
            {profile.IsCompany && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#2563EB] dark:text-[#60A5FA] text-[11px] font-bold">
                <Building2 className="w-3 h-3" /> Empresa
              </span>
            )}
          </div>
          <p className="text-[#2563EB] dark:text-[#60A5FA] font-mono text-sm mt-0.5">@{profile.Username}</p>

          {profile.Bio && (
            <p className="mt-3 text-sm text-black/65 dark:text-white/55 leading-relaxed max-w-xl">{profile.Bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3">
            {profile.LocationName && (
              <span className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/40">
                <MapPin className="w-3.5 h-3.5" /> {profile.LocationName}
              </span>
            )}
            {profile.WebsiteUrl && (
              <a href={profile.WebsiteUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline">
                <Globe className="w-3.5 h-3.5" /> {profile.WebsiteUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5 text-xs text-black/50 dark:text-white/40">
              <ImageIcon className="w-3.5 h-3.5" />
              <strong className="text-[#0F172A] dark:text-white">{profile.PinsCount || 0}</strong> nodos publicados
            </span>
          </div>
        </div>

        <div className="pb-12">
          <h2 className="text-sm font-black uppercase tracking-widest text-black/40 dark:text-white/30 font-mono mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            Publicaciones
          </h2>

          {pins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <ImageIcon className="w-10 h-10 text-[#2563EB]/25" />
              <p className="text-sm text-black/40 dark:text-white/30">Este usuario aún no tiene publicaciones.</p>
            </div>
          ) : (
            <MasonryGrid
              pins={pins}
              onPinClick={setSelectedPin}
              onUpdatePin={handleUpdatePin}
            />
          )}
        </div>
      </div>

      {selectedPin && (
        <PinDetailModal
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onUpdatePin={handleUpdatePin}
        />
      )}
    </div>
  );
}
