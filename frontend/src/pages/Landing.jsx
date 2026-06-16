import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Network, Shield, ChevronDown } from 'lucide-react';
import { getFeed, resolveMediaUrl } from '../services/api';
import CSSHero from '../components/CSSHero';

function toBentoSrc(url, w = 600) {
  if (!url) return url;
  
  if (url.includes('/static/uploads/images/')) {
    const path = url.replace(/^https?:\/\/[^/]+\/static\//, '');
    return `http://localhost:8000/api/media/thumb?path=${encodeURIComponent(path)}&w=${w}`;
  }
  return url;
}

const MARQUEE_WORDS = ['NEXUS', 'RED VISUAL', 'CONOCIMIENTO', 'CURACIÓN', 'NODOS', 'CONSTELACIONES', 'INSPIRACIÓN', 'DISEÑO', 'NEXUS', 'RED VISUAL', 'CONOCIMIENTO', 'CURACIÓN', 'NODOS', 'CONSTELACIONES', 'INSPIRACIÓN', 'DISEÑO'];

const STEPS = [
  { n: '01', title: 'Descubre', desc: 'Explora miles de nodos visuales organizados por categorías dinámicas y conexiones semánticas.' },
  { n: '02', title: 'Organiza', desc: 'Crea tus propias constelaciones. Agrupa referencias, proyectos e ideas en mapas que crecen contigo.' },
  { n: '03', title: 'Conecta', desc: 'Comparte tus constelaciones con la comunidad y descubre conexiones inesperadas entre ideas.' },
];

const FEATURES = [
  { icon: Network, n: '01', t: 'Grafo Semántico', d: 'Las imágenes se relacionan de forma inteligente a través de categorías dinámicas y conexiones cruzadas, no carpetas rígidas.', to: '/explorar', cta: 'Ver en acción' },
  { icon: Zap,     n: '02', t: 'Velocidad Absoluta', d: 'APIs ultrarrápidas y layouts optimizados. Cada transición ocurre instantáneamente, sin tiempos de espera.', to: '/registro', cta: 'Crear cuenta' },
  { icon: Shield,  n: '03', t: 'Curaduría Ética', d: 'Sistema de moderación humano + IA que garantiza un espacio de conocimiento seguro, útil y sin ruido.', to: '/explorar', cta: 'Explorar' },
];

const FALLBACK_IMGS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop', title: 'Arquitectura Verde', span: 'col-span-2 row-span-2' },
  { id: 2, image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop', title: 'Geometrías de Red', span: 'col-span-1 row-span-1' },
  { id: 3, image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop', title: 'Sinergia de Nodos', span: 'col-span-1 row-span-1' },
  { id: 4, image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop', title: 'Interfaces Fractales', span: 'col-span-1 row-span-1' },
  { id: 5, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop', title: 'Redes de Luz', span: 'col-span-1 row-span-1' },
];

export default function Landing() {
  const [featuredPins, setFeaturedPins] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [heroActive, setHeroActive] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setHeroActive(y < window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeed(1);
        if (data && data.length > 0) {
          const spans = ['col-span-2 row-span-2', 'col-span-1 row-span-1', 'col-span-1 row-span-1', 'col-span-1 row-span-1', 'col-span-1 row-span-1'];
          setFeaturedPins(
            data.slice(0, 5).map((item, i) => ({
              id: item.PinId,
              title: item.Title || 'Nodo Nexus',
              image: resolveMediaUrl(item.MediaUrl),
              span: spans[i],
            }))
          );
        }
      } catch {  }
    };
    fetchFeatured();
  }, []);

  const bentoItems = featuredPins.length >= 4 ? featuredPins : FALLBACK_IMGS;
  const heroOpacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.7));

  return (
    <div className="w-full flex-1 min-h-screen bg-white dark:bg-[#020B18] text-[#0F172A] dark:text-[#F0F8FF] overflow-x-hidden transition-colors duration-300">

      <section className="relative h-screen w-full overflow-hidden bg-[#020B18]" aria-label="Presentación Nexus">
        <div className="absolute inset-0" style={{ opacity: heroOpacity }}>
          <CSSHero active={heroActive} />
        </div>

        <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(37,99,235,0.18), transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 80%, rgba(37,99,235,0.08), transparent 60%)' }} />

        <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 sm:pb-24 pl-16 pr-5 sm:px-8 md:px-16 pointer-events-none"
          style={{ opacity: heroOpacity }}>
          <div className="pointer-events-auto max-w-5xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2563EB]/40 bg-[#2563EB]/10 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#60A5FA]">Red Visual de Conocimiento</span>
            </span>

            <h1 className="font-serif font-black uppercase leading-[0.82] tracking-tight text-white" style={{ fontSize: 'clamp(2.1rem,12vw,10rem)' }}>
              El Universo<br />
              <span className="inline-block pb-1 bg-gradient-to-r from-[#60A5FA] via-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', fontSize: 'clamp(1.85rem,10.5vw,9rem)' }}>del Conocimiento</span><br />
              <span className="text-white/75">Visual.</span>
            </h1>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-end gap-6">
              <p className="text-white/80 text-base sm:text-lg max-w-xs leading-relaxed font-serif italic">
                Curación selectiva. Conexiones inteligentes.<br />Diseñado para mentes visuales.
              </p>
              <div className="flex gap-3 shrink-0">
                <Link to="/explorar"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-serif font-black uppercase text-xs tracking-widest shadow-[0_8px_30px_rgba(22,163,74,0.45)] hover:-translate-y-0.5 transition-all">
                  Explorar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/registro"
                  className="inline-flex items-center px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-serif font-black uppercase text-xs tracking-widest backdrop-blur-sm hover:-translate-y-0.5 transition-all">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-10 flex flex-col items-center gap-2 pointer-events-none z-10" style={{ opacity: heroOpacity }}>
          <ChevronDown className="w-4 h-4 text-white/30 animate-bounce" />
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/30" style={{ writingMode: 'vertical-rl' }}>scroll</span>
        </div>

        <div className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 font-mono font-black text-[clamp(8rem,20vw,18rem)] leading-none text-white/[0.03] select-none pointer-events-none z-0">N</div>
      </section>

      <div className="w-full overflow-hidden border-y border-black/8 dark:border-white/5 bg-[#E0EEFF] dark:bg-[#041020] py-5 relative z-10 transition-colors duration-300">
        <div className="flex animate-marquee whitespace-nowrap">
          {MARQUEE_WORDS.map((word, i) => (
            <span key={i} className="mx-8 font-mono text-xs uppercase tracking-[0.4em] text-black/70 dark:text-white/50 select-none">
              {word}<span className="ml-8 text-[#1e40af]/80 dark:text-[#60A5FA]/70">·</span>
            </span>
          ))}
        </div>
      </div>

      <section className="relative z-10 bg-[#E0EEFF] dark:bg-[#041020] py-12 sm:py-24 px-4 sm:px-6 md:px-16 transition-colors duration-300" aria-label="Galería destacada">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[#1e40af] dark:text-[#60A5FA] font-mono text-xs uppercase tracking-[0.3em] font-bold">Galería viva</span>
              <h2 className="font-serif text-4xl md:text-5xl text-[#0F172A] dark:text-white font-medium tracking-tight mt-2">
                Nodos Destacados
              </h2>
            </div>
            <Link to="/explorar"
              className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#1e40af] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-white uppercase font-bold transition-colors group">
              Ver todo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[160px] sm:auto-rows-[220px] gap-3">
            {bentoItems.map((item, i) => (
              <Link key={item.id} to="/explorar"
                className={`relative overflow-hidden rounded-2xl bg-[#E5DDD0] dark:bg-[#0A1830] border border-black/8 dark:border-white/5 group ${item.span}`}>
                <img src={toBentoSrc(item.image, i === 0 ? 600 : 400)} alt={item.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  decoding={i === 0 ? 'auto' : 'async'}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => { e.target.src = FALLBACK_IMGS[i % FALLBACK_IMGS.length].image; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3 sm:p-5">
                  <p className="font-serif font-bold text-white text-sm md:text-base line-clamp-1">{item.title}</p>
                  {i === 0 && <p className="font-mono text-[10px] uppercase tracking-widest text-[#60A5FA] mt-1">Destacado</p>}
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-[#2563EB] text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full">Ver nodo</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#020B18] py-16 sm:py-28 border-t border-black/8 dark:border-white/5 relative z-10 transition-colors duration-300" aria-label="Cómo funciona">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16">
          <div className="mb-16">
            <span className="text-[#1D4ED8] dark:text-[#60A5FA] font-mono text-xs uppercase tracking-[0.3em] font-bold">Proceso</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F172A] dark:text-white font-medium tracking-tight mt-2">
              ¿Cómo funciona Nexus?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8 dark:bg-white/5 rounded-3xl overflow-hidden">
            {STEPS.map((step, i) => (
              <div key={step.n} className="bg-white dark:bg-[#041020] p-6 sm:p-10 md:p-12 relative group hover:bg-[#F2F7FF] dark:hover:bg-[#0A1830] transition-colors duration-300">
                <span className="absolute top-6 right-8 font-mono font-black text-7xl text-black/[0.04] dark:text-white/[0.04] select-none group-hover:text-[#2563EB]/8 dark:group-hover:text-[#2563EB]/10 transition-colors">{step.n}</span>
                <div className="relative z-10 space-y-5">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center group-hover:bg-[#2563EB] group-hover:border-[#2563EB] transition-all duration-300">
                    <span className="font-mono text-xs font-bold text-[#1e40af] dark:text-[#60A5FA] group-hover:text-white transition-colors">{step.n}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#0F172A] dark:text-white">{step.title}</h3>
                  <p className="text-sm text-black/55 dark:text-white/55 leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-[#2563EB] z-20 border-2 border-white dark:border-[#041020]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#E0EEFF] dark:bg-[#041020] py-16 sm:py-28 border-t border-black/8 dark:border-white/5 relative z-10 overflow-hidden transition-colors duration-300" aria-label="Filosofía">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.06), transparent 70%)' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-16 relative z-10">
          <span className="text-[#1e40af] dark:text-[#60A5FA] font-mono text-xs uppercase tracking-[0.3em] font-bold">La Filosofía</span>
          <blockquote className="mt-8 font-serif font-medium text-[#0F172A] dark:text-white leading-[1.15] tracking-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3.5rem)' }}>
            <span className="text-[#2563EB] text-6xl leading-none select-none">&ldquo;</span><br />
            En la era de la distracción digital, Nexus propone un refugio para la{' '}
            <em className="text-[#2563EB] dark:text-[#60A5FA] not-italic">curación selectiva.</em>{' '}
            Cada nodo es un fragmento de conocimiento; cada constelación, una{' '}
            <em className="text-[#2563EB] dark:text-[#60A5FA] not-italic">sinapsis visual</em>{' '}
            de tus ideas.
          </blockquote>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-black/8 dark:border-white/5 pt-12">
            {[
              { val: '10K+', label: 'Nodos activos' },
              { val: '5K+', label: 'Usuarios' },
              { val: '200+', label: 'Categorías' },
              { val: '99.9%', label: 'Uptime' },
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <p className="font-mono font-black text-3xl md:text-4xl text-[#2563EB]">{stat.val}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-black/40 dark:text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link to="/explorar"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-serif font-black uppercase text-xs tracking-widest rounded-full shadow-lg shadow-[#2563EB]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Comenzar exploración <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#020B18] py-16 sm:py-28 border-t border-black/8 dark:border-white/5 relative z-10 transition-colors duration-300" aria-label="Características">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[#1D4ED8] dark:text-[#60A5FA] font-mono text-xs uppercase tracking-[0.3em] font-bold">Tecnología e innovación</span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#0F172A] dark:text-white font-medium leading-tight mt-3">
              Diseñado para la Era<br />de la Curación
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.n}
                  className="group relative bg-[#F2F7FF] dark:bg-[#0A1830] border border-black/8 dark:border-white/5 rounded-3xl p-8 hover:border-[#2563EB]/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
                  <span className="absolute top-4 right-6 font-mono font-black text-8xl text-black/[0.03] dark:text-white/[0.03] select-none">{f.n}</span>
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 30% 30%, rgba(22,163,74,0.05), transparent 70%)' }} />
                  <div className="relative z-10 flex flex-col flex-1 space-y-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center group-hover:bg-[#2563EB] group-hover:border-[#2563EB] transition-all duration-300">
                      <Icon className="w-5 h-5 text-[#2563EB] group-hover:text-white transition-colors" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0F172A] dark:text-white">{f.t}</h3>
                    <p className="text-sm text-black/55 dark:text-white/55 leading-relaxed flex-1">{f.d}</p>
                    <div className="pt-5 border-t border-black/8 dark:border-white/5">
                      <Link to={f.to} className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-[#1e40af] hover:text-[#1D4ED8] dark:text-[#60A5FA] dark:hover:text-white uppercase font-bold transition-colors group/link">
                        {f.cta} <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden border-t border-black/8 dark:border-white/5 transition-colors duration-300" aria-label="Llamada a la acción">
        <div className="absolute inset-0 bg-[#E0EEFF] dark:bg-[#0A1830] transition-colors duration-300" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(22,163,74,0.12), transparent 70%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#1e40af] dark:text-[#60A5FA]">Únete hoy</span>
          </span>

          <h2 className="font-serif font-black uppercase text-[#0F172A] dark:text-white leading-[0.9] tracking-tight" style={{ fontSize: 'clamp(2.5rem,8vw,6rem)' }}>
            ¿Listo para<br />
            <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text' }}>
              mapear tu
            </span>
            <br />inspiración?
          </h2>

          <p className="text-black/65 dark:text-white/65 max-w-lg mx-auto text-sm leading-relaxed font-serif italic">
            Únete a Nexus hoy y comienza a estructurar tu archivo visual. Descubre relaciones inesperadas entre tus referencias artísticas y técnicas.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link to="/registro"
              className="px-10 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-serif font-black uppercase text-xs tracking-widest rounded-full shadow-[0_8px_40px_rgba(22,163,74,0.3)] hover:shadow-[0_12px_50px_rgba(22,163,74,0.45)] hover:-translate-y-0.5 transition-all">
              Registrarse gratis
            </Link>
            <Link to="/explorar"
              className="px-10 py-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#0F172A] dark:text-white border border-black/15 dark:border-white/15 font-serif font-black uppercase text-xs tracking-widest rounded-full hover:-translate-y-0.5 transition-all">
              Explorar sin cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
