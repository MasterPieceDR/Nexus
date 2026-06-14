import { useState, useEffect } from 'react';
import { Compass, PlusSquare, User, Bell, LogIn, Sun, Moon, LogOut, X, Shield, Key, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight, Star, Loader2, ShieldCheck, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/theme-context';
import { useSidebar } from '../contexts/sidebar-context';
import { getUserNotifications, submitFeedback, isModeratorRole } from '../services/api';
import UserSearchModal from './UserSearchModal';

const PREFETCH = {
  '/': () => import('../pages/Landing'),
  '/explorar': () => import('../pages/Feed'),
  '/crear': () => import('../pages/CreatePin'),
  '/perfil': () => import('../pages/Profile'),
  '/admin': () => import('../pages/AdminPanel'),
  '/login': () => import('../pages/Login'),
  '/registro': () => import('../pages/Register'),
};

function NotifIcon({ icon, type }) {
  const base = 'w-5 h-5 flex-shrink-0';
  if (type === 'warning') return <AlertTriangle className={`${base} text-amber-400`} />;
  if (type === 'success') return <CheckCircle className={`${base} text-blue-400`} />;
  if (icon === 'google')  return <CheckCircle className={`${base} text-blue-400`} />;
  if (icon === 'key')     return <Key className={`${base} text-blue-400`} />;
  return <Shield className={`${base} text-blue-400`} />;
}

function NotificationsPanel({ isOpen, onClose, notifications, loading }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Por favor, selecciona una calificación.'); return; }
    setSubmitting(true); setError(null);
    try {
      await submitFeedback(rating, comment);
      setSubmitted(true); setRating(0); setComment('');
    } catch (err) {
      setError('Ocurrió un error al enviar tu comentario.'); console.error(err);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-[22rem] max-w-[90vw] z-50 flex flex-col bg-white dark:bg-[#060E1E] border-l border-[#BFDBFE] dark:border-white/10 shadow-[-8px_0_32px_rgba(37,99,235,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#BFDBFE] dark:border-white/10 bg-[#EFF6FF] dark:bg-[#04101E]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-[#2563EB]" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2563EB] rounded-full animate-pulse" />
              )}
            </div>
            <span className="font-serif font-black tracking-widest uppercase text-sm text-[#0F172A] dark:text-[#F0F8FF]">Avisos</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Cerrar panel de avisos">
            <X className="w-5 h-5 text-black/60 dark:text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#EFF6FF]/80 dark:bg-white/5 border border-[#BFDBFE] dark:border-white/10 shadow-sm">
            <h4 className="text-xs font-serif font-black uppercase tracking-wider text-[#0F172A] dark:text-[#F0F8FF] mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#2563EB] fill-[#2563EB]" />
              ¿Qué te parece Nexus?
            </h4>
            {submitted ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle className="w-8 h-8 text-[#2563EB] mx-auto" />
                <p className="text-xs font-serif font-bold text-[#0F172A] dark:text-[#F0F8FF]">¡Gracias por tu opinión!</p>
                <p className="text-[10px] text-black/50 dark:text-white/45">Nos ayuda a mejorar la aplicación constantemente.</p>
                <button onClick={() => setSubmitted(false)} className="text-[10px] text-[#2563EB] hover:underline font-mono uppercase tracking-widest mt-2 font-bold">Enviar otro</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-[11px] text-[#0F172A]/60 dark:text-white/40 leading-relaxed">Califica tu experiencia con la aplicación y ayúdanos a mejorar.</p>
                <div className="flex items-center gap-1.5 justify-center py-1.5">
                  {[1,2,3,4,5].map(star => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button key={star} type="button" aria-label={`${star} estrella${star > 1 ? 's' : ''}`} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-0.5 transition-transform hover:scale-125 focus:outline-none">
                        <Star className={`w-6 h-6 transition-colors ${isFilled ? 'text-yellow-500 fill-yellow-500' : 'text-black/25 dark:text-white/20'}`} />
                      </button>
                    );
                  })}
                </div>
                <textarea value={comment} onChange={e => { setComment(e.target.value); setError(null); }} placeholder="Tu opinión o sugerencias..." maxLength={400}
                  className="w-full min-h-[60px] p-2.5 rounded-xl text-xs bg-white dark:bg-black/20 border border-[#BFDBFE] dark:border-white/10 focus:outline-none focus:border-[#2563EB] dark:focus:border-[#2563EB] text-[#0F172A] dark:text-[#F0F8FF] placeholder-[#0F172A]/35 dark:placeholder-white/35 resize-none" />
                {error && <p className="text-[10px] text-red-500 font-mono font-bold">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/50 text-white text-[10px] font-mono uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1.5">
                  {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enviando...</> : 'Enviar valoración'}
                </button>
              </form>
            )}
          </div>

          <div className="h-px bg-black/10 dark:bg-white/10 my-2" />

          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-black/40 dark:text-white/40 font-serif uppercase tracking-wider">Cargando avisos…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Info className="w-10 h-10 text-black/20 dark:text-white/20" />
              <p className="text-sm text-black/40 dark:text-white/40 font-serif">Sin avisos recientes</p>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div key={notif.id ?? idx}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:shadow-sm ${
                  notif.isRead === false
                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700/30'
                    : 'bg-white dark:bg-[#0D1B38] border-black/8 dark:border-white/8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}>
                {notif.isRead === false && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_6px_#2563EB]" />
                )}
                <div className="mt-0.5"><NotifIcon icon={notif.icon} type={notif.type} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-serif font-black uppercase tracking-wider text-[#0F172A] dark:text-[#F0F8FF] leading-tight mb-1">{notif.title}</p>
                  <p className="text-[11px] text-black/55 dark:text-white/50 leading-relaxed break-words">{notif.body}</p>
                  <p className="text-[10px] text-black/30 dark:text-white/25 mt-1.5 font-mono">{notif.date}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015]">
          <p className="text-[10px] text-black/35 dark:text-white/25 font-serif uppercase tracking-widest text-center leading-relaxed">
            Solo se muestran los últimos 15 accesos · Protegido por Nexus Security
          </p>
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const isLoggedIn = !!localStorage.getItem('nexus_token');

  useEffect(() => {
    if (!isLoggedIn) return;
    getUserNotifications().then(data => {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    }).catch(() => {});
  }, [isLoggedIn]);

  const handleOpenNotifications = async () => {
    setNotifOpen(true);
    if (notifications.length === 0) {
      setNotifLoading(true);
      try { const data = await getUserNotifications(); setNotifications(data); setUnreadCount(0); }
      catch {  } finally { setNotifLoading(false); }
    } else { setUnreadCount(0); }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    sessionStorage.removeItem('gh_code_processing');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Inicio',   path: '/',         icon: <div className="w-5 h-5 flex items-center justify-center font-serif text-lg font-bold">N</div> },
    { name: 'Explorar', path: '/explorar', icon: <Compass className="w-5 h-5" /> },
  ];
  if (isLoggedIn) {
    menuItems.push({ name: 'Crear',  path: '/crear',  icon: <PlusSquare className="w-5 h-5" /> });
    menuItems.push({ name: 'Perfil', path: '/perfil', icon: <User className="w-5 h-5" /> });
    if (isModeratorRole()) menuItems.push({ name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-5 h-5" /> });
  }

  const mobileNavItems = [
    { name: 'Inicio',   path: '/',         icon: null },
    { name: 'Explorar', path: '/explorar', icon: <Compass className="w-5 h-5" /> },
  ];
  if (isLoggedIn) {
    mobileNavItems.push({ name: 'Crear',  path: '/crear',  icon: <PlusSquare className="w-5 h-5" /> });
    mobileNavItems.push({ name: 'Perfil', path: '/perfil', icon: <User className="w-5 h-5" /> });
  } else {
    mobileNavItems.push({ name: 'Acceder', path: '/login', icon: <LogIn className="w-5 h-5" /> });
  }

  return (
    <>
      <nav className={`hidden md:flex fixed inset-y-0 left-0 z-40 flex-col bg-[#EFF6FF] dark:bg-[#041020] border-r border-[#BFDBFE] dark:border-white/10 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <button onClick={toggleSidebar}
          className="absolute top-1/2 -right-3.5 -translate-y-1/2 z-50 w-7 h-7 bg-[#F8FAFF] dark:bg-[#041020] border border-[#BFDBFE] dark:border-white/15 rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label={isSidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}>
          {isSidebarCollapsed
            ? <ChevronRight className="w-4 h-4 text-[#2563EB]" />
            : <ChevronLeft  className="w-4 h-4 text-[#2563EB]" />}
        </button>

        <div className="flex flex-col items-center pt-12 pb-8">
          <Link to="/" onMouseEnter={() => PREFETCH['/']?.()} className="flex flex-col items-center gap-2 mb-10 group mt-4">
            <div className={`relative rounded-full border border-[#BFDBFE]/70 dark:border-white/15 bg-[#F8FAFF] dark:bg-[#0D1B38] flex items-center justify-center shadow-[0_4px_16px_rgba(37,99,235,0.06)] dark:shadow-[0_0_20px_rgba(37,99,235,0.18)] transition-all duration-[800ms] group-hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] group-hover:scale-105 ${
              isSidebarCollapsed ? 'w-12 h-12' : 'w-20 h-20'
            }`}>
              <svg viewBox="0 0 100 100" className={`transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[360deg] ${
                isSidebarCollapsed ? 'w-8 h-8' : 'w-14 h-14'
              }`}>
                <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 4" className="text-[#2563EB] opacity-60" />
                <path d="M35 68 L35 32 L65 68 L65 32" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#2563EB] dark:text-[#60A5FA]" />
                <circle cx="35" cy="32" r="4" className="fill-[#2563EB] dark:fill-white stroke-none" />
                <circle cx="35" cy="68" r="4" className="fill-[#2563EB] dark:fill-white stroke-none" />
                <circle cx="65" cy="32" r="4" className="fill-[#2563EB] dark:fill-white stroke-none" />
                <circle cx="65" cy="68" r="4" className="fill-[#2563EB] dark:fill-white stroke-none" />
                <circle cx="50" cy="50" r="2.5" className="fill-[#60A5FA] animate-ping" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-1.5 mt-4">
                <span className="font-serif font-black text-2xl tracking-[0.25em] text-[#0F172A] dark:text-[#F0F8FF] uppercase transition-colors duration-500">NEXUS</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB] animate-pulse" />
              </div>
            )}
          </Link>
        </div>

        <div className={`flex-1 flex flex-col mt-4 ${isSidebarCollapsed ? 'gap-4 px-2' : 'gap-3.5 px-5'}`}>
          <button onClick={() => setSearchOpen(true)} title={isSidebarCollapsed ? 'Buscar usuarios' : ''}
            className={`group flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSidebarCollapsed
                ? 'justify-center w-12 h-12 rounded-full mx-auto border'
                : 'gap-4 px-5 py-3 rounded-full border'
            } bg-transparent text-[#0F172A]/60 dark:text-[#F0F8FF]/60 border-transparent hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-[#2563EB]/5 dark:hover:bg-white/5`}>
            <Search className="w-5 h-5 text-[#0F172A]/40 group-hover:text-[#2563EB] dark:text-[#F0F8FF]/40 transition-colors" />
            {!isSidebarCollapsed && <span className="font-serif font-black tracking-widest uppercase text-xs">Buscar</span>}
          </button>

          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={index} to={item.path} onMouseEnter={() => PREFETCH[item.path]?.()} title={isSidebarCollapsed ? item.name : ''}
                className={`group flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isSidebarCollapsed
                    ? 'justify-center w-12 h-12 rounded-full mx-auto border'
                    : 'gap-4 px-5 py-3 rounded-full border'
                } ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-transparent shadow-[0_4px_12px_rgba(37,99,235,0.30)] dark:bg-[#2563EB]/15 dark:text-white dark:border-[#2563EB]/40 dark:shadow-[0_0_15px_rgba(37,99,235,0.18)] -translate-y-px'
                    : 'bg-transparent text-[#0F172A]/60 dark:text-[#F0F8FF]/60 border-transparent hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-[#2563EB]/5 dark:hover:bg-white/5'
                }`}>
                <div className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#0F172A]/40 group-hover:text-[#2563EB] dark:text-[#F0F8FF]/40'}`}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && <span className="font-serif font-black tracking-widest uppercase text-xs">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className={`border-t border-black/10 dark:border-white/10 flex flex-col gap-3 bg-black/[0.02] dark:bg-white/[0.02] ${
          isSidebarCollapsed ? 'p-3' : 'p-6'
        }`}>
          {isLoggedIn ? (
            <>
              <button onClick={handleOpenNotifications} title={isSidebarCollapsed ? 'Avisos' : ''}
                className={`flex items-center rounded-full border border-transparent hover:border-[#BFDBFE] dark:hover:border-white/10 transition-colors text-[#0F172A]/60 dark:text-[#F0F8FF]/60 hover:text-[#0F172A] dark:hover:text-[#F0F8FF] group ${
                  isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'gap-4 px-5 py-2.5 w-full text-left'
                }`}>
                <div className="relative">
                  <Bell className="w-5 h-5 text-[#0F172A]/40 dark:text-[#F0F8FF]/40 group-hover:text-[#2563EB] transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#2563EB] rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-[9px] font-black text-white leading-none px-0.5">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </span>
                  )}
                </div>
                {!isSidebarCollapsed && <span className="font-serif font-black tracking-widest uppercase text-xs">Avisos</span>}
              </button>

              <button onClick={handleLogout} title={isSidebarCollapsed ? 'Cerrar Sesión' : ''}
                className={`flex items-center rounded-full border border-transparent hover:border-red-500/20 hover:bg-red-500/5 transition-colors text-red-600/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 group ${
                  isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'gap-4 px-5 py-2.5 w-full text-left'
                }`}>
                <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                {!isSidebarCollapsed && <span className="font-serif font-black tracking-widest uppercase text-xs">Cerrar Sesión</span>}
              </button>
            </>
          ) : (
            <Link to="/login" onMouseEnter={() => PREFETCH['/login']?.()} title={isSidebarCollapsed ? 'Acceder' : ''}
              className={`flex items-center rounded-full border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-[#2563EB] dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-[#0F172A] dark:text-white shadow-sm hover:shadow-md hover:-translate-y-px group ${
                isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto shadow-none border-black/20 dark:border-white/20' : 'gap-4 px-5 py-2.5'
              }`}>
              <LogIn className="w-5 h-5 text-[#2563EB] group-hover:text-white dark:group-hover:text-black transition-colors" />
              {!isSidebarCollapsed && <span className="font-serif font-black tracking-widest uppercase text-xs">Acceder</span>}
            </Link>
          )}

          <button onClick={toggleTheme} title={isSidebarCollapsed ? `Tema ${isDarkMode ? 'Claro' : 'Oscuro'}` : ''}
            className={`flex items-center rounded-full border border-[#DBEAFE] dark:border-white/10 bg-white dark:bg-[#0D1B38] text-black/60 dark:text-[#F0F8FF]/60 hover:text-black dark:hover:text-[#F0F8FF] shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0.5 transition-all group font-serif font-black tracking-widest uppercase text-xs ${
              isSidebarCollapsed ? 'justify-center w-12 h-12 mx-auto shadow-none border-transparent' : 'gap-4 px-5 py-3 w-full text-left'
            }`}>
            <div className="text-black/40 dark:text-[#F0F8FF]/40 group-hover:text-[#2563EB] transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            {!isSidebarCollapsed && <span>Tema {isDarkMode ? 'Claro' : 'Oscuro'}</span>}
          </button>
        </div>
      </nav>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#EFF6FF]/95 dark:bg-[#041020]/95 backdrop-blur-xl border-t border-[#BFDBFE] dark:border-white/10 shadow-[0_-4px_20px_rgba(37,99,235,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch h-14">
          {mobileNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onTouchStart={() => PREFETCH[item.path]?.()}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors duration-200 ${
                  isActive ? 'text-[#2563EB]' : 'text-[#0F172A]/40 dark:text-white/35'
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon ?? (
                    <span className="flex items-center justify-center w-5 h-5 font-serif text-[1.1rem] font-black leading-none">N</span>
                  )}
                </div>
                <span className={`text-[9px] font-mono uppercase tracking-widest leading-tight ${isActive ? 'font-black' : 'font-bold'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {isLoggedIn ? (
            <button
              onClick={handleOpenNotifications}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 text-[#0F172A]/40 dark:text-white/35 transition-colors duration-200"
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#2563EB] rounded-full flex items-center justify-center">
                    <span className="text-[7px] font-black text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest leading-tight font-bold">Avisos</span>
            </button>
          ) : (
            <button
              onClick={toggleTheme}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 text-[#0F172A]/40 dark:text-white/35 transition-colors duration-200"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-[9px] font-mono uppercase tracking-widest leading-tight font-bold">Tema</span>
            </button>
          )}
        </div>
      </nav>

      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} loading={notifLoading} />
      {searchOpen && <UserSearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
