const IMGS = [
  { url: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=300&q=60&auto=format&fit=crop', pos: { top: '8%', left: '3%' }, w: 160, h: 200, delay: '0s', dur: '6s' },
  { url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&q=60&auto=format&fit=crop', pos: { top: '5%', right: '4%' }, w: 150, h: 190, delay: '1.5s', dur: '7s' },
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=60&auto=format&fit=crop', pos: { bottom: '14%', left: '2%' }, w: 175, h: 125, delay: '0.8s', dur: '5.5s' },
  { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=60&auto=format&fit=crop', pos: { bottom: '12%', right: '3%' }, w: 155, h: 155, delay: '2s', dur: '6.5s' },
  { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=60&auto=format&fit=crop', pos: { top: '8%', left: 'calc(50% - 88px)' }, w: 175, h: 115, delay: '1s', dur: '8s', hideMobile: true },
  { url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&q=60&auto=format&fit=crop', pos: { bottom: '7%', left: 'calc(50% - 98px)' }, w: 195, h: 115, delay: '3s', dur: '7.5s', hideMobile: true },
];

export default function CSSHero({ active = true }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {IMGS.map((img, i) => (
        <div
          key={i}
          className={`absolute${img.hideMobile ? ' hidden sm:block' : ''}`}
          style={img.pos}
        >
          <div
            className="overflow-hidden rounded-xl border border-white/10 shadow-2xl"
            style={{
              width: img.w,
              height: img.h,
              willChange: 'transform',
              animation: active
                ? `nexus-float ${img.dur} ease-in-out ${img.delay} infinite`
                : 'none',
            }}
          >
            <img
              src={img.url}
              alt=""
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="w-full h-full object-cover"
              style={{ opacity: 0.88 }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(2,11,24,0.45), transparent 60%)' }}
            />
          </div>
        </div>
      ))}

      <div
        className="absolute pointer-events-none"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            willChange: 'transform',
            animation: active ? 'nexus-breathe 4s ease-in-out infinite' : 'none',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.3), rgba(37,99,235,0.4) 45%, transparent 68%)',
              filter: 'blur(10px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '18%', right: '18%', bottom: '18%', left: '18%',
              background: 'radial-gradient(circle at 38% 30%, #BFDBFE, #2563EB 55%, #1e40af)',
              boxShadow: '0 0 70px rgba(37,99,235,0.6), 0 0 28px rgba(96,165,250,0.45), inset 0 0 35px rgba(255,255,255,0.16)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '37%', right: '37%', bottom: '37%', left: '37%',
              background: 'radial-gradient(circle at 40% 36%, rgba(255,255,255,0.92), rgba(219,234,254,0.55))',
              filter: 'blur(1px)',
            }}
          />
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 65% 65% at center, transparent 22%, #020B18 70%)' }}
      />
    </div>
  );
}
