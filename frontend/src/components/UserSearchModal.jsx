import { useState, useEffect, useRef } from 'react';
import { X, Search, User, Loader2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, resolveMediaUrl } from '../services/api';

export default function UserSearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    
    if (query.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const data = await searchUsers(query.trim());
        setResults(data || []);
        setSearched(true);
      } catch {
        setResults([]);
      } finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer.current);
  }, [query]);

  const goToProfile = (userId) => {
    onClose();
    navigate(`/usuario/${userId}`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#060E1E] border border-[#BFDBFE] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#BFDBFE] dark:border-white/10">
          <Search className="w-4.5 h-4.5 text-[#2563EB] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar usuario por nombre o @username…"
            className="flex-1 bg-transparent text-sm text-[#0F172A] dark:text-[#F0F8FF] placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none"
          />
          {loading
            ? <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
            : <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-black/40 dark:text-white/40" />
              </button>
          }
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-[#EFF6FF] dark:divide-white/5">
          {results.length > 0 ? (
            results.map(u => {
              const initials = (u.DisplayName || u.Username || '?')
                .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
              return (
                <button
                  key={u.UserId}
                  onClick={() => goToProfile(u.UserId)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-[#EFF6FF] dark:hover:bg-white/5 transition-colors text-left"
                >
                  {u.AvatarUrl ? (
                    <img src={resolveMediaUrl(u.AvatarUrl)} alt={u.DisplayName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-[#BFDBFE] dark:border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-sm font-serif">{initials}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-[#0F172A] dark:text-[#F0F8FF] truncate">{u.DisplayName || u.Username}</p>
                      {u.IsCompany && <Building2 className="w-3 h-3 text-[#2563EB] shrink-0" />}
                    </div>
                    <p className="text-xs text-[#2563EB] dark:text-[#60A5FA] font-mono truncate">@{u.Username}</p>
                    {u.Bio && <p className="text-xs text-black/40 dark:text-white/30 truncate mt-0.5">{u.Bio}</p>}
                  </div>
                </button>
              );
            })
          ) : searched && !loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <User className="w-8 h-8 text-[#2563EB]/25" />
              <p className="text-sm text-black/40 dark:text-white/35">No se encontraron usuarios</p>
            </div>
          ) : !loading && query.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Search className="w-8 h-8 text-[#2563EB]/20" />
              <p className="text-xs text-black/35 dark:text-white/30">Escribe al menos 2 caracteres</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
