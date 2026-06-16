import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleLogin, ldapLogin, GITHUB_CLIENT_ID } from '../services/api';
import { LogIn, ArrowLeft, KeyRound, Building2, Mail, Lock, Globe, Server, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import NetworkBackground from '../components/NetworkBackground';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
      </svg>
    ),
    title: 'Descubre',
    desc: 'Contenido curado por expertos, ordenado por relevancia e interés profesional.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
      </svg>
    ),
    title: 'Conecta',
    desc: 'Red activa de profesionales que comparten conocimiento visual e ideas.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>
      </svg>
    ),
    title: 'Organiza',
    desc: 'Colecciones inteligentes para estructurar y recuperar tu flujo de ideas.',
  },
];

function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col items-center justify-center overflow-hidden">
      <NetworkBackground />

      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(105deg, rgba(2,11,24,0.15) 0%, rgba(4,16,32,0.88) 100%)' }} />
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 40% 50%, transparent 35%, rgba(2,11,24,0.55) 100%)' }} />

      <div className="relative z-10 w-full max-w-lg px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-11 h-11 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center backdrop-blur-sm shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <circle cx="50" cy="50" r="41" fill="none" stroke="#60A5FA" strokeWidth="4" strokeDasharray="6 4" opacity="0.75"/>
              <path d="M35 68 L35 32 L65 68 L65 32" fill="none" stroke="#93C5FD" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="35" cy="32" r="5.5" fill="#60A5FA"/>
              <circle cx="35" cy="68" r="5.5" fill="#60A5FA"/>
              <circle cx="65" cy="32" r="5.5" fill="#60A5FA"/>
              <circle cx="65" cy="68" r="5.5" fill="#60A5FA"/>
              <circle cx="50" cy="50" r="4" fill="#BAE6FD"/>
            </svg>
          </div>
          <span className="font-serif font-black text-xl tracking-[0.3em] text-white/90">NEXUS</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="font-serif text-4xl xl:text-[2.75rem] font-black text-white leading-[1.15] mb-4 overflow-visible">
            La red visual<br />
            del{' '}
            <span
              className="text-transparent bg-clip-text inline-block pb-[3px]"
              style={{ backgroundImage: 'linear-gradient(90deg, #60A5FA, #818CF8, #60A5FA)', backgroundSize: '200% 100%' }}
            >
              conocimiento
            </span>
          </h2>
          <p className="text-white/52 text-[0.95rem] font-serif leading-relaxed">
            Inspírate, conecta y organiza ideas con<br />los mejores profesionales del sector.
          </p>
        </motion.div>

        <div className="space-y-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 + i * 0.11 }}
              className="flex items-start gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#60A5FA] shrink-0 backdrop-blur-sm">
                {f.icon}
              </div>
              <div>
                <p className="text-white/90 font-semibold text-sm">{f.title}</p>
                <p className="text-white/42 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72 }}
          className="mt-12 pt-6 border-t border-white/[0.08] flex items-center gap-8"
        >
          {[['10K+', 'Usuarios activos'], ['50K+', 'Pins publicados'], ['200+', 'Categorías']].map(([val, label]) => (
            <div key={label}>
              <p className="text-white font-black text-lg font-serif leading-none">{val}</p>
              <p className="text-white/35 text-[11px] mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative group">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]/30 dark:text-white/25 group-focus-within:text-[#2563EB] transition-colors pointer-events-none" />
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#020B18]/70 border border-[#BFDBFE] dark:border-white/10 rounded-xl text-[#0F172A] dark:text-[#F0F8FF] text-sm placeholder:text-[#0F172A]/30 dark:placeholder:text-white/20 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
      />
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('standard');
  const [ldapUsername, setLdapUsername] = useState('');
  const [ldapPassword, setLdapPassword] = useState('');
  const [ldapDomain, setLdapDomain] = useState('NEXUS.LAB');
  const [ghPrevUser, setGhPrevUser] = useState(() => {
    try {
      const prev = localStorage.getItem('nexus_prev_gh_user');
      return prev && !localStorage.getItem('nexus_token') ? prev : '';
    } catch { return ''; }
  });

  const { isDarkMode, toggleTheme } = useTheme();

  const handleGitHubLogin = (forceNew = false) => {
    const clientId = GITHUB_CLIENT_ID;
    if (forceNew) {
      localStorage.removeItem('nexus_prev_gh_user');
      setGhPrevUser('');
    }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  const handleLdapSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await ldapLogin({ username: ldapUsername.trim(), password: ldapPassword, domain: ldapDomain.trim() });
      navigate('/explorar');
    } catch (err) { setError(err.message || 'Error al conectar con Active Directory.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('nexus_token', data.access_token);
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      navigate('/explorar');
    } catch (err) { setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.'); }
    finally { setLoading(false); }
  };

  const handleGoogleCallback = useCallback(async (response) => {
    setError(''); setLoading(true);
    try {
      const data = await googleLogin(response.credential);
      localStorage.setItem('nexus_token', data.access_token);
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      navigate('/explorar');
    } catch (err) { setError(err.message || 'Error al iniciar sesión con Google.'); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    if (!document.getElementById('gsi-script')) {
      const s = document.createElement('script');
      s.id = 'gsi-script';
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    let intervalId;
    const renderGoogleButton = () => {
      if (window.google?.accounts?.id) {
        const container = document.getElementById('googleButtonContainer');
        if (container) {
          window.google.accounts.id.initialize({ client_id: '442423936060-s95fggmhk7jndiet7gcomjljf8vsfn9e.apps.googleusercontent.com', callback: handleGoogleCallback, context: 'signin' });
          window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: '320', text: 'signin_with', shape: 'pill' });
          if (intervalId) clearInterval(intervalId);
        }
      }
    };
    if (activeTab === 'standard') { renderGoogleButton(); intervalId = setInterval(renderGoogleButton, 100); }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [activeTab, handleGoogleCallback]);

  const tabCls = (active) =>
    `flex-1 pb-3 text-sm font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
      active
        ? 'border-[#2563EB] text-[#2563EB]'
        : 'border-transparent text-[#0F172A]/45 dark:text-white/35 hover:text-[#0F172A]/70 dark:hover:text-white/60'
    }`;

  return (
    <div className="min-h-screen flex bg-[#020B18] overflow-hidden">
      <BrandPanel />

      <div className="w-full lg:w-[45%] xl:w-[42%] relative flex flex-col lg:bg-[#F8FAFF] lg:dark:bg-[#041020]">
        <div className="lg:hidden absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(37,99,235,0.18) 0%, rgba(2,11,24,0) 60%), radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.14) 0%, rgba(2,11,24,0) 55%), #020B18' }} />

        <div className="relative z-20 flex items-center justify-between px-6 pt-6">
          <Link to="/"
            className="flex items-center gap-1.5 text-[#0F172A]/60 dark:text-white/55 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /><span>Volver</span>
          </Link>
          <button onClick={toggleTheme}
            className="p-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-[#BFDBFE]/60 dark:border-white/10 text-[#0F172A]/60 dark:text-white/55 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-all"
            title="Cambiar tema">
            {isDarkMode
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm lg:bg-transparent lg:shadow-none lg:rounded-none lg:p-0 bg-[#F8FAFF]/95 dark:bg-[#041020]/95 backdrop-blur-xl lg:backdrop-blur-none rounded-2xl p-7 shadow-2xl"
          >
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-5 h-5">
                  <path d="M35 68 L35 32 L65 68 L65 32" fill="none" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="50" cy="50" r="4" fill="#93C5FD"/>
                </svg>
              </div>
              <span className="font-serif font-black text-base tracking-[0.25em] text-white">NEXUS</span>
            </div>

            <div className="mb-7">
              <h1 className="text-[1.85rem] font-black text-[#0F172A] dark:text-white tracking-tight leading-none mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-[#0F172A]/52 dark:text-white/45 text-sm font-serif">
                Ingresa con tu método de acceso preferido.
              </p>
            </div>

            <div className="flex border-b border-[#BFDBFE] dark:border-white/10 mb-6">
              <button onClick={() => setActiveTab('standard')} className={tabCls(activeTab === 'standard')}>
                <KeyRound className="w-3.5 h-3.5" /><span>Estándar</span>
              </button>
              <button onClick={() => setActiveTab('corporate')} className={tabCls(activeTab === 'corporate')}>
                <Building2 className="w-3.5 h-3.5" /><span>Corporativo</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl text-red-600 dark:text-red-400 text-sm text-center leading-snug overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {activeTab === 'standard' ? (
                <motion.div key="std" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A]/55 dark:text-white/40 mb-1.5 uppercase tracking-wide">Correo electrónico</label>
                      <IconInput icon={Mail} type="email" required aria-label="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#0F172A]/55 dark:text-white/40 uppercase tracking-wide">Contraseña</label>
                        <Link to="/login" className="text-xs text-[#2563EB] hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] transition-colors">¿Olvidaste tu contraseña?</Link>
                      </div>
                      <IconInput icon={Lock} type="password" required aria-label="Contraseña" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.015 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Verificando…</span></>
                        : <><LogIn className="w-4 h-4" /><span>Iniciar sesión</span><ChevronRight className="w-4 h-4 opacity-60" /></>
                      }
                    </motion.button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#BFDBFE] dark:border-white/10" /></div>
                    <div className="relative flex justify-center"><span className="px-3 bg-[#F8FAFF] dark:bg-[#041020] text-[#0F172A]/38 dark:text-white/30 text-xs">O continuar con</span></div>
                  </div>

                  <div className="flex flex-col items-center gap-2.5 w-full">
                    <div className="w-full flex justify-center min-h-[44px]">
                      <div id="googleButtonContainer" className="w-full max-w-[320px] flex justify-center" />
                    </div>
                    <div className="w-full max-w-[320px] flex flex-col items-center gap-1.5">
                      <button type="button" onClick={() => handleGitHubLogin()} disabled={loading}
                        className="w-full py-2.5 px-4 rounded-full bg-[#24292F] hover:bg-[#1a1f24] text-white border border-white/10 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-all disabled:opacity-60">
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        <span>{ghPrevUser ? `Continuar como @${ghPrevUser}` : 'Acceder con GitHub'}</span>
                      </button>
                      {ghPrevUser && (
                        <button type="button" onClick={() => handleGitHubLogin(true)} disabled={loading}
                          className="text-[11px] text-black/40 dark:text-white/30 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors">
                          ¿No eres @{ghPrevUser}? Usar otra cuenta
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="corp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <form onSubmit={handleLdapSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A]/55 dark:text-white/40 mb-1.5 uppercase tracking-wide">Usuario del dominio</label>
                      <IconInput icon={Globe} type="text" required aria-label="Usuario del dominio" value={ldapUsername} onChange={e => setLdapUsername(e.target.value)} placeholder="ej: d.santillan" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A]/55 dark:text-white/40 mb-1.5 uppercase tracking-wide">Contraseña de red</label>
                      <IconInput icon={Lock} type="password" required aria-label="Contraseña de red" value={ldapPassword} onChange={e => setLdapPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A]/55 dark:text-white/40 mb-1.5 uppercase tracking-wide">Dominio Active Directory</label>
                      <IconInput icon={Server} type="text" required aria-label="Dominio" value={ldapDomain} onChange={e => setLdapDomain(e.target.value)} placeholder="ej: nexus.local" />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.015 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Autenticando…</span></>
                        : <><LogIn className="w-4 h-4" /><span>Iniciar sesión corporativa</span></>
                      }
                    </motion.button>
                    <div className="p-3.5 bg-[#EFF6FF]/50 dark:bg-[#020B18]/50 border border-[#BFDBFE]/50 dark:border-white/5 rounded-xl text-xs text-[#0F172A]/50 dark:text-white/38 leading-relaxed">
                      Requiere conectividad con el controlador de dominio Windows Server de tu organización. Las credenciales son validadas en el Active Directory corporativo.
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-8 text-center text-sm text-[#0F172A]/48 dark:text-white/38">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-[#2563EB] hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] font-semibold transition-colors">
                Únete a Nexus →
              </Link>
            </p>
          </motion.div>
        </div>

        <div className="relative z-20 px-6 pb-5 text-center">
          <p className="text-[10px] text-[#0F172A]/28 dark:text-white/20">
            © 2025 Nexus · <Link to="/terminos" className="hover:text-[#2563EB] transition-colors">Términos de uso</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
