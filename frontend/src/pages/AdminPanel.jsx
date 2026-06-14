import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Image as ImageIcon, Flag, Bot, Star,
  ScrollText, Loader2, CheckCircle2, XCircle, EyeOff, BadgeCheck, RefreshCw
} from 'lucide-react';
import {
  isModeratorRole, adminGetMetrics, adminGetUsers, adminGetPins, adminGetReports,
  adminGetReportStats, adminGetValidations, adminGetRatingsSummary, adminGetAudit,
  updatePinStatus, verifyPin, adminResolveReport, resolveMediaUrl,
} from '../services/api';

const TABS = [
  { id: 'metrics', label: 'Métricas', icon: LayoutDashboard },
  { id: 'pins', label: 'Nodos', icon: ImageIcon },
  { id: 'reports', label: 'Reportes', icon: Flag },
  { id: 'validations', label: 'IA / OCR', icon: Bot },
  { id: 'ratings', label: 'Valoraciones', icon: Star },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'audit', label: 'Auditoría', icon: ScrollText },
];

const statusBadge = (status) => {
  const map = {
    PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    APPROVED: 'bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/25',
    REJECTED: 'bg-red-500/15 text-red-500 border-red-500/25',
    HIDDEN: 'bg-gray-500/15 text-gray-500 border-gray-500/25',
    OPEN: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    RESOLVED: 'bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/25',
    BLOCKED: 'bg-red-500/15 text-red-500 border-red-500/25',
    VERIFIED: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
    UNVERIFIED: 'bg-gray-500/15 text-gray-500 border-gray-500/25',
    PENDING_VERIFICATION: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
  };
  return `inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${map[status] || map.UNVERIFIED}`;
};

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-[#060E1E] border border-[#BFDBFE] dark:border-white/10 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
    </div>
  );
}

function MetricsTab() {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => { adminGetMetrics().then(setMetrics).catch(console.error); }, []);
  if (!metrics) return <SectionLoader />;

  const items = [
    { label: 'Usuarios', value: metrics.TotalUsers, color: '#2563EB' },
    { label: 'Nodos totales', value: metrics.TotalPins, color: '#0EA5E9' },
    { label: 'Pendientes', value: metrics.PendingPins, color: '#F59E0B' },
    { label: 'Aprobados', value: metrics.ApprovedPins, color: '#2563EB' },
    { label: 'Rechazados', value: metrics.RejectedPins, color: '#EF4444' },
    { label: 'Reportes abiertos', value: metrics.OpenReports, color: '#EF4444' },
    { label: 'Validaciones IA', value: metrics.AiValidations, color: '#8B5CF6' },
    { label: 'Valoración media', value: metrics.AvgRating ? Number(metrics.AvgRating).toFixed(1) + ' ★' : '—', color: '#F59E0B' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((m) => (
        <Card key={m.label} className="p-5 text-center">
          <p className="text-3xl font-black font-serif" style={{ color: m.color }}>{m.value ?? 0}</p>
          <p className="text-[11px] uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mt-1">{m.label}</p>
        </Card>
      ))}
    </div>
  );
}

function PinsTab() {
  const [pins, setPins] = useState(null);
  const [filter, setFilter] = useState('PENDING');
  const [busy, setBusy] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [prevFilter, setPrevFilter] = useState(filter);
  if (prevFilter !== filter) {
    setPrevFilter(filter);
    setPins(null);
  }

  useEffect(() => {
    let cancelled = false;
    adminGetPins(filter === 'ALL' ? null : filter)
      .then((data) => { if (!cancelled) setPins(data); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [filter, reloadKey]);

  const act = async (pinId, fn) => {
    setBusy(pinId);
    try {
      await fn();
      setPins(null);
      setReloadKey((k) => k + 1);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'ALL'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-black font-mono uppercase tracking-wider border transition-all ${
              filter === s ? 'bg-[#2563EB] text-white border-transparent' : 'bg-transparent text-black/60 dark:text-white/50 border-[#BFDBFE] dark:border-white/15'
            }`}
          >
            {s === 'ALL' ? 'Todos' : s}
          </button>
        ))}
      </div>

      {!pins ? <SectionLoader /> : pins.length === 0 ? (
        <Card className="p-10 text-center text-sm text-black/50 dark:text-white/40">Sin nodos en este estado.</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pins.map((p) => (
            <Card key={p.PinId} className="p-4 flex gap-4">
              {p.MediaUrl && (
                <img
                  src={resolveMediaUrl(p.MediaUrl)}
                  alt={p.Title}
                  className="w-24 h-24 object-cover rounded-xl border border-black/5 dark:border-white/10 flex-shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F0F8FF] truncate">{p.Title}</h3>
                  <span className={statusBadge(p.Status)}>{p.Status}</span>
                </div>
                <p className="text-xs text-black/50 dark:text-white/40">
                  @{p.Username} · {p.CategoryName || 'Sin categoría'}
                  {p.IsAiGenerated ? ' · IA' : ''}{p.IsSensitive ? ' · Sensible' : ''}
                </p>
                <span className={statusBadge(p.VerifiedStatus)}>{p.VerifiedStatus}</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => act(p.PinId, () => updatePinStatus(p.PinId, 'APPROVED'))}
                    disabled={busy === p.PinId}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB] hover:text-white text-[11px] font-bold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                  </button>
                  <button
                    onClick={() => act(p.PinId, () => updatePinStatus(p.PinId, 'REJECTED'))}
                    disabled={busy === p.PinId}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[11px] font-bold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </button>
                  <button
                    onClick={() => act(p.PinId, () => updatePinStatus(p.PinId, 'HIDDEN'))}
                    disabled={busy === p.PinId}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white text-[11px] font-bold transition-colors"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Ocultar
                  </button>
                  <button
                    onClick={() => act(p.PinId, () => verifyPin(p.PinId, p.VerifiedStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED'))}
                    disabled={busy === p.PinId}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white text-[11px] font-bold transition-colors"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" /> {p.VerifiedStatus === 'VERIFIED' ? 'Quitar sello' : 'Verificar info'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const REPORT_REASON_LABELS = {
  CONTENIDO_PARA_MENORES: 'Menores',
  CONTENIDO_EXPLICITO: 'Explícito',
  SPAM: 'Spam',
  VIOLENCIA: 'Violencia',
  DERECHOS_AUTOR: 'Derechos',
  OTRO: 'Otro',
};

function ReportsTab() {
  const [reports, setReports] = useState(null);
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([adminGetReports(), adminGetReportStats()])
      .then(([rRes, sRes]) => {
        if (cancelled) return;
        setReports(rRes.status === 'fulfilled' ? rRes.value : []);
        setStats(sRes.status === 'fulfilled' ? sRes.value : { summary: { Total: 0, Open: 0, Resolved: 0 }, by_reason: [], by_action: [] });
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [reloadKey]);

  const resolve = async (id, action) => {
    setBusy(id);
    try {
      await adminResolveReport(id, action, `Resuelto desde panel: ${action}`);
      setReports(null); setStats(null);
      setReloadKey((k) => k + 1);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (!reports || !stats) return <SectionLoader />;

  const { summary = {}, by_reason = [], by_action = [] } = stats;
  const maxReason = Math.max(1, ...by_reason.map((r) => r.Count));
  const actionMap = Object.fromEntries(by_action.map((a) => [a.Action, a.Count]));
  const totalActions = by_action.reduce((s, a) => s + a.Count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-4xl font-black font-serif text-[#0F172A] dark:text-[#F0F8FF]">{summary.Total ?? 0}</p>
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mt-1">Total</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-4xl font-black font-serif text-amber-500">{summary.Open ?? 0}</p>
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mt-1">Abiertos</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-4xl font-black font-serif text-[#2563EB]">{summary.Resolved ?? 0}</p>
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mt-1">Resueltos</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mb-4">Acción tomada · buenos vs malos</p>
          {totalActions === 0 ? (
            <p className="text-sm text-black/40 dark:text-white/30 italic">Sin decisiones registradas aún.</p>
          ) : (
            <div className="space-y-3">
              {[
                { key: 'CONTENT_REMOVED', label: 'Contenido retirado', color: 'from-red-500 to-rose-400' },
                { key: 'NO_ACTION', label: 'Sin acción (descartado)', color: 'from-[#2563EB] to-[#60A5FA]' },
              ].map(({ key, label, color }) => {
                const count = actionMap[key] || 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-36 text-black/60 dark:text-white/50 leading-tight shrink-0">{label}</span>
                    <div className="flex-1 h-5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${(count / totalActions) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-6 text-right text-black/60 dark:text-white/50">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mb-4">Reportes por razón</p>
          {by_reason.length === 0 ? (
            <p className="text-sm text-black/40 dark:text-white/30 italic">Sin datos todavía.</p>
          ) : (
            <div className="space-y-2">
              {by_reason.map(({ Reason, Count }) => (
                <div key={Reason} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-24 text-black/60 dark:text-white/50 truncate shrink-0">
                    {REPORT_REASON_LABELS[Reason] || Reason}
                  </span>
                  <div className="flex-1 h-5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-700"
                      style={{ width: `${(Count / maxReason) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-6 text-right text-black/60 dark:text-white/50">{Count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {reports.length === 0 ? (
        <Card className="p-10 text-center text-sm text-black/50 dark:text-white/40">No hay reportes. 🎉</Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.ReportId} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={statusBadge(r.Status)}>{r.Status}</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-[#F0F8FF]">{r.Reason}</span>
                </div>
                <p className="text-xs text-black/50 dark:text-white/40 mt-1">
                  {r.EntityType} #{r.EntityId} · reportado por @{r.ReporterUsername || 'anónimo'} · {new Date(r.CreatedAt).toLocaleString('es-ES')}
                </p>
                {r.Details && <p className="text-xs text-black/60 dark:text-white/50 mt-1 italic">"{r.Details}"</p>}
              </div>
              {r.Status === 'OPEN' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolve(r.ReportId, 'CONTENT_REMOVED')}
                    disabled={busy === r.ReportId}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-colors"
                  >
                    Retirar contenido
                  </button>
                  <button
                    onClick={() => resolve(r.ReportId, 'NO_ACTION')}
                    disabled={busy === r.ReportId}
                    className="px-3 py-2 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white text-xs font-bold transition-colors"
                  >
                    Sin acción
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidationsTab() {
  const [rows, setRows] = useState(null);
  useEffect(() => { adminGetValidations().then(setRows).catch(console.error); }, []);
  if (!rows) return <SectionLoader />;
  if (rows.length === 0) return <Card className="p-10 text-center text-sm text-black/50 dark:text-white/40">Aún no hay validaciones de IA/OCR registradas.</Card>;

  return (
    <div className="space-y-3">
      {rows.map((v) => (
        <Card key={v.ValidationId} className="p-4">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={statusBadge(v.Status)}>{v.Status}</span>
            <span className="text-xs font-mono font-bold text-[#8B5CF6]">{v.Provider}</span>
            {v.Score != null && <span className="text-xs font-mono text-black/50 dark:text-white/40">score: {Number(v.Score).toFixed(2)}</span>}
            <span className="text-xs text-black/40 dark:text-white/30 ml-auto">{new Date(v.CreatedAt).toLocaleString('es-ES')}</span>
          </div>
          <p className="text-sm font-bold text-[#0F172A] dark:text-[#F0F8FF]">
            {v.PinTitle ? `Nodo: ${v.PinTitle}` : `Pin #${v.PinId ?? '—'}`}
          </p>
          <p className="text-xs text-black/55 dark:text-white/45 mt-1">{v.Reason}</p>
          <div className="flex gap-3 mt-2 text-[10px] font-mono uppercase tracking-wider">
            <span className={v.IsExplicit ? 'text-red-500 font-black' : 'text-black/35 dark:text-white/25'}>Explícito: {v.IsExplicit ? 'Sí' : 'No'}</span>
            <span className={v.IsIllegal ? 'text-red-500 font-black' : 'text-black/35 dark:text-white/25'}>Ilegal: {v.IsIllegal ? 'Sí' : 'No'}</span>
            <span className={!v.IsSafeForMinors ? 'text-red-500 font-black' : 'text-[#2563EB]'}>Apto menores: {v.IsSafeForMinors ? 'Sí' : 'No'}</span>
          </div>
          {v.OcrText && (
            <p className="text-xs text-black/45 dark:text-white/35 mt-2 italic line-clamp-2">OCR: "{v.OcrText}"</p>
          )}
        </Card>
      ))}
    </div>
  );
}

function RatingsTab() {
  const [data, setData] = useState(null);
  useEffect(() => { adminGetRatingsSummary().then(setData).catch(console.error); }, []);
  if (!data) return <SectionLoader />;

  const maxCount = Math.max(1, ...data.by_star.map((s) => s.Count));
  const starsMap = Object.fromEntries(data.by_star.map((s) => [s.Rating, s.Count]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <p className="text-5xl font-black font-serif text-[#F59E0B]">
            {data.average ? data.average.toFixed(1) : '—'}
          </p>
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mt-2">
            Promedio general · {data.total} valoraciones
          </p>
        </Card>

        <Card className="p-6 md:col-span-2">
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mb-4">Distribución por estrellas</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starsMap[star] || 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold w-8 text-black/60 dark:text-white/50">{star} ★</span>
                  <div className="flex-1 h-5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-8 text-right text-black/60 dark:text-white/50">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {data.by_date.length > 0 && (
        <Card className="p-6">
          <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mb-4">Evolución por fecha</p>
          <div className="flex items-end gap-1.5 h-32 overflow-x-auto pb-2">
            {data.by_date.map((d) => {
              const maxDay = Math.max(...data.by_date.map((x) => x.Count));
              return (
                <div key={d.Date} className="flex flex-col items-center gap-1 min-w-[44px]" title={`${d.Date}: ${d.Count} valoraciones (prom. ${Number(d.Average).toFixed(1)})`}>
                  <span className="text-[9px] font-mono text-black/50 dark:text-white/40">{Number(d.Average).toFixed(1)}★</span>
                  <div
                    className="w-7 bg-[#2563EB]/70 hover:bg-[#2563EB] rounded-t-md transition-colors"
                    style={{ height: `${Math.max(8, (d.Count / maxDay) * 80)}px` }}
                  />
                  <span className="text-[8px] font-mono text-black/40 dark:text-white/30 rotate-0">
                    {new Date(d.Date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <p className="text-xs uppercase tracking-widest text-black/50 dark:text-white/40 font-mono mb-4">Comentarios recientes</p>
        {data.recent_comments.length === 0 ? (
          <p className="text-sm text-black/40 dark:text-white/30 italic">Sin comentarios todavía.</p>
        ) : (
          <div className="space-y-3">
            {data.recent_comments.map((c) => (
              <div key={c.RatingId} className="border-b border-black/5 dark:border-white/5 pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-[#F0F8FF]">{c.DisplayName}</span>
                  <span className="text-[#F59E0B] text-xs">{'★'.repeat(c.Rating)}{'☆'.repeat(5 - c.Rating)}</span>
                  <span className="text-[10px] text-black/35 dark:text-white/25 ml-auto">{new Date(c.CreatedAt).toLocaleDateString('es-ES')}</span>
                </div>
                <p className="text-xs text-black/60 dark:text-white/50 mt-1">{c.Comment}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(null);
  useEffect(() => { adminGetUsers().then(setUsers).catch(console.error); }, []);
  if (!users) return <SectionLoader />;

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-black/45 dark:text-white/35 border-b border-[#BFDBFE] dark:border-white/10">
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Nodos</th>
            <th className="px-4 py-3">Registro</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.UserId} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
              <td className="px-4 py-3">
                <p className="font-bold text-[#0F172A] dark:text-[#F0F8FF]">{u.DisplayName}</p>
                <p className="text-xs text-black/45 dark:text-white/35">@{u.Username}</p>
              </td>
              <td className="px-4 py-3 text-xs text-black/60 dark:text-white/50">{u.Email}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                  [1, 2].includes(u.RoleId) ? 'bg-[#2563EB]/15 text-[#2563EB]' :
                  u.RoleId === 3 ? 'bg-blue-500/15 text-blue-500' : 'bg-gray-500/10 text-gray-500'
                }`}>
                  {u.RoleName}
                </span>
              </td>
              <td className="px-4 py-3 text-xs font-mono">{u.PinsCount}</td>
              <td className="px-4 py-3 text-xs text-black/45 dark:text-white/35">{new Date(u.CreatedAt).toLocaleDateString('es-ES')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function AuditTab() {
  const [rows, setRows] = useState(null);
  useEffect(() => { adminGetAudit().then(setRows).catch(console.error); }, []);
  if (!rows) return <SectionLoader />;

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-black/45 dark:text-white/35 border-b border-[#BFDBFE] dark:border-white/10">
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Acción</th>
            <th className="px-4 py-3">Entidad</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.AuditId} className="border-b border-black/5 dark:border-white/5">
              <td className="px-4 py-2.5 text-black/50 dark:text-white/40 whitespace-nowrap">{new Date(a.EventTime).toLocaleString('es-ES')}</td>
              <td className="px-4 py-2.5 font-bold text-[#0F172A] dark:text-[#F0F8FF]">{a.ActorUsername || '—'}</td>
              <td className="px-4 py-2.5 font-mono text-[#2563EB]">{a.ActionName}</td>
              <td className="px-4 py-2.5 text-black/50 dark:text-white/40">{a.EntityName} {a.EntityId ? `#${a.EntityId}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('metrics');
  const [reloadKey, setReloadKey] = useState(0);

  if (!isModeratorRole()) {
    return <Navigate to="/explorar" replace />;
  }

  return (
    <div className="min-h-screen bg-[#EFF6FF] dark:bg-[#041020] py-10 px-4 sm:px-6 lg:px-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#0F172A] dark:text-[#F0F8FF] tracking-tight">
              Panel de Moderación
            </h1>
            <p className="text-sm text-black/50 dark:text-white/40 mt-1">
              Gestión de contenido, usuarios, reportes y métricas de Nexus.
            </p>
          </div>
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#BFDBFE] dark:border-white/10 text-sm font-bold text-black/60 dark:text-white/50 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </header>

        <nav className="flex gap-1.5 mb-8 p-1.5 rounded-2xl bg-white/60 dark:bg-[#0D1B38] border border-[#BFDBFE] dark:border-white/5 shadow-sm w-fit max-w-full overflow-x-auto" aria-label="Secciones del panel">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-xs font-serif font-black uppercase tracking-wider whitespace-nowrap ${
                tab === t.id
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-black/55 dark:text-white/45 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        <main key={`${tab}-${reloadKey}`}>
          {tab === 'metrics' && <MetricsTab />}
          {tab === 'pins' && <PinsTab />}
          {tab === 'reports' && <ReportsTab />}
          {tab === 'validations' && <ValidationsTab />}
          {tab === 'ratings' && <RatingsTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'audit' && <AuditTab />}
        </main>
      </div>
    </div>
  );
}
