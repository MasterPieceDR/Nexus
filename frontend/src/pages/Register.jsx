import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, googleLogin, checkUsername } from '../services/api';
import { UserPlus, ArrowLeft, Mail, Lock, User, AtSign, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import NetworkBackground from '../components/NetworkBackground';
import { motion, AnimatePresence } from 'framer-motion';

function evalStrength(val) {
  if (!val) return { score: 0, text: '', color: '', width: '0%' };
  let s = 0;
  if (val.length >= 8) s++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val)) s++;
  if (/[@$!%*?&]/.test(val)) s++;
  if (val.length < 8) return { score: 1, text: 'Muy corta', color: 'bg-red-500', width: '25%', textColor: 'text-red-500' };
  if (s === 1) return { score: 1, text: 'Débil', color: 'bg-orange-400', width: '40%', textColor: 'text-orange-400' };
  if (s === 2) return { score: 2, text: 'Media', color: 'bg-yellow-400', width: '68%', textColor: 'text-yellow-500' };
  return { score: 3, text: 'Segura', color: 'bg-[#2563EB]', width: '100%', textColor: 'text-[#2563EB]' };
}

const PERKS = [
  { icon: <Check className="w-3.5 h-3.5" />, text: 'Guarda y organiza tu inspiración visual' },
  { icon: <Check className="w-3.5 h-3.5" />, text: 'Conecta con expertos de tu área' },
  { icon: <Check className="w-3.5 h-3.5" />, text: 'Comparte tu trabajo con la comunidad' },
  { icon: <Check className="w-3.5 h-3.5" />, text: 'Acceso a colecciones temáticas exclusivas' },
  { icon: <Check className="w-3.5 h-3.5" />, text: 'Panel personal con historial y estadísticas' },
];

function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col items-center justify-center overflow-hidden">
      <NetworkBackground />

      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(108deg, rgba(2,11,24,0.1) 0%, rgba(4,16,32,0.9) 100%)' }} />
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 42% 50%, transparent 30%, rgba(2,11,24,0.5) 100%)' }} />

      <div className="relative z-10 w-full max-w-lg px-12 xl:px-16">
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center backdrop-blur-sm shadow-[0_0_18px_rgba(37,99,235,0.28)]">
            <svg viewBox="0 0 100 100" className="w-6 h-6">
              <circle cx="50" cy="50" r="41" fill="none" stroke="#60A5FA" strokeWidth="4" strokeDasharray="6 4" opacity="0.75"/>
              <path d="M35 68 L35 32 L65 68 L65 32" fill="none" stroke="#93C5FD" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="35" cy="32" r="5.5" fill="#60A5FA"/>
              <circle cx="35" cy="68" r="5.5" fill="#60A5FA"/>
              <circle cx="65" cy="32" r="5.5" fill="#60A5FA"/>
              <circle cx="65" cy="68" r="5.5" fill="#60A5FA"/>
              <circle cx="50" cy="50" r="4" fill="#BAE6FD"/>
            </svg>
          </div>
          <span className="font-serif font-black text-xl tracking-[0.3em] text-white/88">NEXUS</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.62 }}
          className="mb-10">
          <h2 className="font-serif text-4xl xl:text-[2.6rem] font-black text-white leading-[1.15] mb-4">
            Únete al nexo<br />del{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #60A5FA, #818CF8)' }}>
              conocimiento
            </span>
          </h2>
          <p className="text-white/50 text-[0.92rem] font-serif leading-relaxed">
            Una cuenta gratuita te da acceso a todo<br />lo que Nexus tiene para ofrecer.
          </p>
        </motion.div>

        <div className="space-y-3.5">
          {PERKS.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.09 }}
              className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/35 flex items-center justify-center text-[#60A5FA] shrink-0">
                {p.icon}
              </div>
              <span className="text-white/62 text-sm">{p.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
          className="mt-12 pt-6 border-t border-white/[0.08]">
          <p className="text-white/30 text-xs">
            Al registrarte aceptas nuestros{' '}
            <Link to="/terminos" className="text-[#60A5FA]/70 hover:text-[#60A5FA] transition-colors">Términos de Servicio</Link>
            {' '}y{' '}
            <Link to="/terminos" className="text-[#60A5FA]/70 hover:text-[#60A5FA] transition-colors">Política de Privacidad</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function IconInput({ icon: Icon, className = '', ...props }) {
  return (
    <div className="relative group">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]/30 dark:text-white/25 group-focus-within:text-[#2563EB] transition-colors pointer-events-none" />
      <input
        {...props}
        className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#020B18]/70 border border-[#BFDBFE] dark:border-white/10 rounded-xl text-[#0F172A] dark:text-[#F0F8FF] text-sm placeholder:text-[#0F172A]/28 dark:placeholder:text-white/20 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all ${className}`}
      />
    </div>
  );
}

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/;

export default function Register() {
  const [formData, setFormData] = useState({ email: '', username: '', password: '', first_name: '', last_name: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const usernameTimer = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [ghPrevUser, setGhPrevUser] = useState(() => {
    try {
      const prev = localStorage.getItem('nexus_prev_gh_user');
      return prev && !localStorage.getItem('nexus_token') ? prev : '';
    } catch { return ''; }
  });

  const strength = evalStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'username') {
      setUsernameStatus(null);
      clearTimeout(usernameTimer.current);
      if (!value) return;
      if (!USERNAME_RE.test(value)) { setUsernameStatus('invalid'); return; }
      setUsernameStatus('checking');
      usernameTimer.current = setTimeout(async () => {
        try {
          const res = await checkUsername(value);
          setUsernameStatus(res.available ? 'available' : 'taken');
        } catch {
          setUsernameStatus(null);
        }
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (usernameStatus !== 'available') {
      setError(usernameStatus === 'taken' ? 'El nombre de usuario ya está en uso.' : 'Verifica el nombre de usuario antes de continuar.');
      return;
    }
    if (formData.password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) { setError('Contraseña débil: mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos (@$!%*?&).'); return; }
    setLoading(true);
    try {
      const data = await register(formData);
      localStorage.setItem('nexus_token', data.access_token);
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      navigate('/explorar');
    }
    catch (err) { setError(err.message || 'Error al crear la cuenta. Intenta de nuevo.'); }
    finally { setLoading(false); }
  };

  const handleGitHubLogin = (forceNew = false) => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (forceNew) {
      localStorage.removeItem('nexus_prev_gh_user');
      setGhPrevUser('');
    }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  const handleGoogleCallback = useCallback(async (response) => {
    setError(''); setLoading(true);
    try {
      const data = await googleLogin(response.credential);
      localStorage.setItem('nexus_token', data.access_token);
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      navigate('/explorar');
    } catch (err) { setError(err.message || 'Error al registrarse con Google.'); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    if (window.google?.accounts) {
      window.google.accounts.id.initialize({ client_id: '442423936060-s95fggmhk7jndiet7gcomjljf8vsfn9e.apps.googleusercontent.com', callback: handleGoogleCallback, context: 'signup' });
      window.google.accounts.id.renderButton(document.getElementById('googleButtonContainerReg'), { theme: 'outline', size: 'large', width: '320', text: 'signup_with', shape: 'pill' });
    }
  }, [handleGoogleCallback]);

  const labelCls = 'block text-[11px] font-semibold text-[#0F172A]/50 dark:text-white/38 mb-1.5 uppercase tracking-wide';

  return (
    <div className="min-h-screen flex bg-[#020B18] overflow-hidden">
      <BrandPanel />

      <div className="w-full lg:w-[48%] xl:w-[45%] relative flex flex-col min-h-screen lg:bg-[#F8FAFF] lg:dark:bg-[#041020]">
        <div className="lg:hidden absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 72% 18%, rgba(37,99,235,0.18) 0%, rgba(2,11,24,0) 58%), radial-gradient(ellipse at 18% 82%, rgba(99,102,241,0.14) 0%, rgba(2,11,24,0) 52%), #020B18' }} />

        <div className="relative z-20 flex items-center justify-between px-6 pt-6 shrink-0">
          <Link to="/"
            className="flex items-center gap-1.5 text-[#0F172A]/55 dark:text-white/50 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /><span>Volver</span>
          </Link>
          <button onClick={toggleTheme}
            className="p-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-[#BFDBFE]/60 dark:border-white/10 text-[#0F172A]/55 dark:text-white/50 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-all"
            title="Cambiar tema">
            {isDarkMode
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
        </div>

        <div className="relative z-10 flex-1 flex items-start lg:items-center justify-center px-6 py-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm lg:bg-transparent lg:shadow-none lg:rounded-none lg:p-0 bg-[#F8FAFF]/95 dark:bg-[#041020]/95 backdrop-blur-xl lg:backdrop-blur-none rounded-2xl p-7 shadow-2xl"
          >
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-4 h-4">
                  <path d="M35 68 L35 32 L65 68 L65 32" fill="none" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="50" cy="50" r="4" fill="#93C5FD"/>
                </svg>
              </div>
              <span className="font-serif font-black text-sm tracking-[0.25em] text-white">NEXUS</span>
            </div>

            <div className="mb-6">
              <h1 className="text-[1.75rem] font-black text-[#0F172A] dark:text-white tracking-tight leading-none mb-1.5">
                Crear cuenta
              </h1>
              <p className="text-[#0F172A]/50 dark:text-white/42 text-sm font-serif">
                Completa tus datos y únete al Nexo.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl text-red-600 dark:text-red-400 text-xs text-center overflow-hidden leading-snug"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <IconInput icon={User} type="text" name="first_name" required aria-label="Nombre" value={formData.first_name} onChange={handleChange} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className={labelCls}>Apellido</label>
                  <IconInput icon={User} type="text" name="last_name" required aria-label="Apellido" value={formData.last_name} onChange={handleChange} placeholder="Apellido" />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Nombre de usuario
                  {usernameStatus === 'available' && <span className="ml-2 text-[#2563EB] normal-case font-normal">disponible</span>}
                  {usernameStatus === 'taken' && <span className="ml-2 text-red-500 normal-case font-normal">ya está en uso</span>}
                  {usernameStatus === 'invalid' && <span className="ml-2 text-orange-500 normal-case font-normal">3-20 caracteres, sin espacios</span>}
                </label>
                <div className="relative group">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]/30 dark:text-white/25 group-focus-within:text-[#2563EB] transition-colors pointer-events-none" />
                  <input
                    type="text" name="username" required autoComplete="username"
                    value={formData.username} onChange={handleChange}
                    placeholder="usuario123"
                    className={`w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#020B18]/70 border rounded-xl text-[#0F172A] dark:text-[#F0F8FF] text-sm placeholder:text-[#0F172A]/28 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all
                      ${usernameStatus === 'available' ? 'border-[#2563EB] focus:border-[#2563EB] focus:ring-[#2563EB]/20' :
                        usernameStatus === 'taken' ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' :
                        usernameStatus === 'invalid' ? 'border-orange-400 focus:border-orange-400 focus:ring-orange-400/20' :
                        'border-[#BFDBFE] dark:border-white/10 focus:border-[#2563EB] focus:ring-[#2563EB]/20'}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />}
                    {usernameStatus === 'available' && <Check className="w-4 h-4 text-[#2563EB]" />}
                    {usernameStatus === 'taken' && <span className="text-red-500 text-base font-bold leading-none">✕</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Correo electrónico</label>
                <IconInput icon={Mail} type="email" name="email" required aria-label="Correo electrónico" value={formData.email} onChange={handleChange} placeholder="tu@email.com" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Contraseña</label>
                  <IconInput icon={Lock} type="password" name="password" required aria-label="Contraseña" value={formData.password} onChange={handleChange} placeholder="Mín. 8 chars" />
                </div>
                <div>
                  <label className={labelCls}>Confirmar</label>
                  <IconInput icon={Lock} type="password" required aria-label="Verificar contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repetir" />
                </div>
              </div>

              <AnimatePresence>
                {formData.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden">
                    <div className="w-full bg-[#EFF6FF] dark:bg-white/8 h-1 rounded-full overflow-hidden mb-1">
                      <motion.div
                        className={`h-full rounded-full ${strength.color}`}
                        initial={{ width: '0%' }}
                        animate={{ width: strength.width }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className={`font-semibold ${strength.textColor}`}>{strength.text}</span>
                      {confirmPassword && (
                        <span className={formData.password === confirmPassword ? 'text-[#2563EB] font-medium' : 'text-red-500 font-medium'}>
                          {formData.password === confirmPassword ? '✓ Coinciden' : '✗ No coinciden'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.975 }}
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/38 transition-all flex items-center justify-center gap-2 mt-1"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creando cuenta…</span></>
                  : <><UserPlus className="w-4 h-4" /><span>Crear mi cuenta</span><ChevronRight className="w-4 h-4 opacity-60" /></>
                }
              </motion.button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#BFDBFE] dark:border-white/10" /></div>
              <div className="relative flex justify-center"><span className="px-3 bg-[#F8FAFF] dark:bg-[#041020] text-[#0F172A]/35 dark:text-white/28 text-[11px]">O registrarse con</span></div>
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-full flex justify-center min-h-[40px]">
                <div id="googleButtonContainerReg" className="w-full max-w-[320px] flex justify-center" />
              </div>
              <div className="w-full max-w-[320px] flex flex-col items-center gap-1.5">
                <button type="button" onClick={() => handleGitHubLogin()} disabled={loading}
                  className="w-full py-2.5 px-4 rounded-full bg-[#24292F] hover:bg-[#1a1f24] text-white border border-white/10 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-all disabled:opacity-60">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>{ghPrevUser ? `Continuar como @${ghPrevUser}` : 'Registrarse con GitHub'}</span>
                </button>
                {ghPrevUser && (
                  <button type="button" onClick={() => handleGitHubLogin(true)} disabled={loading}
                    className="text-[11px] text-black/40 dark:text-white/30 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors">
                    ¿No eres @{ghPrevUser}? Usar otra cuenta
                  </button>
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-sm text-[#0F172A]/45 dark:text-white/35">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#2563EB] hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] font-semibold transition-colors">
                Inicia sesión →
              </Link>
            </p>
          </motion.div>
        </div>

        <div className="relative z-20 px-6 pb-4 text-center shrink-0">
          <p className="text-[10px] text-[#0F172A]/25 dark:text-white/18">
            © 2025 Nexus · <Link to="/terminos" className="hover:text-[#2563EB] transition-colors">Términos de uso</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
