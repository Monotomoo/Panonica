import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Battery,
  Clock,
  DollarSign,
  Layers,
  Leaf,
  Radio,
  ShieldCheck,
  Sparkles,
  SunMedium,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import { useProjectStore } from '@/store/projectStore';
import { useConfigStore } from '@/store/configStore';
import { useScenariosStore } from '@/store/scenariosStore';
import { useProgressStore, DEMO_ROUTES } from '@/store/progressStore';
import { deriveBuilderBom, deriveBuilderFinance } from '@/lib/builderDerive';
import { validateProject } from '@/lib/validationEngine';
import { DnaGlyph } from '@/components/DnaGlyph';
import { Sparkline } from '@/components/Sparkline';

/**
 * Mission Control · fullscreen command-center overlay.
 *
 * Triggered via Cmd/Ctrl+Shift+F (or via Command Palette / StatusBar button).
 * Strips all chrome. Shows a wall of 12 giant pulsing metrics, the DNA glyph,
 * the session clock, a health dial, and an ambient particle backdrop.
 *
 * Designed to be the opening spectacle OR the closing "here's everything
 * at a glance" moment of the pitch.
 */
export function MissionControl() {
  const [open, setOpen] = useState(false);
  const [sessionStart] = useState(() => Date.now());
  const [tick, setTick] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const project = useProjectStore();
  const config = useConfigStore();
  const scenarios = useScenariosStore((s) => s.scenarios);
  const visits = useProgressStore((s) => s.visits);

  const bom = useMemo(() => deriveBuilderBom(project), [project]);
  const finance = useMemo(() => deriveBuilderFinance(project, bom), [project, bom]);
  const validation = useMemo(() => validateProject(project), [project]);

  const visitedCount = DEMO_ROUTES.filter((r) => visits[r.path]).length;
  const filledScenarios = (Object.values(scenarios).filter(Boolean)).length;

  // Global hotkey · Cmd/Ctrl+Shift+F
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Tick for clock + ambient animations
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [open]);

  // Fast smooth tick for live-drift metrics (IRR/MoM/DSCR flutter · €/min counter)
  const [smoothTick, setSmoothTick] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setSmoothTick((t) => t + 1), 420);
    return () => clearInterval(id);
  }, [open]);

  // External event support
  useEffect(() => {
    const h = () => setOpen((o) => !o);
    window.addEventListener('panonica:mission-control-toggle', h);
    return () => window.removeEventListener('panonica:mission-control-toggle', h);
  }, []);

  // Keyboard 1-9 route jumps (only when open)
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    const keymap: Record<string, string> = {
      '1': '/', '2': '/context', '3': '/land', '4': '/solar', '5': '/grid',
      '6': '/agriculture', '7': '/configurator', '8': '/roi', '9': '/subsidies',
      'm': '/market', 'b': '/build',
    };
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = keymap[e.key.toLowerCase()];
      if (target) {
        navigate(target);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, navigate]);

  // Ambient particle backdrop (starfield-lite)
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 0.4,
      hue: 220 + Math.random() * 80,
      alpha: Math.random() * 0.4 + 0.2,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.alpha})`;
        ctx.fill();
        // subtle lines between close particles
        particles.slice(i + 1).forEach((q) => {
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2}, 60%, 60%, ${0.08 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [open]);

  if (!open) return null;

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // Live-drift: sub-second flutter on IRR/DSCR/MoM so metrics feel alive
  const driftPhase = smoothTick * 0.7;
  const irrDrift = Math.sin(driftPhase) * 0.018;
  const dscrDrift = Math.cos(driftPhase * 1.3) * 0.005;
  const momDrift = Math.sin(driftPhase * 0.8 + 0.4) * 0.008;
  const euroPerMin = Math.round(
    (finance.annualYieldGwh * 1000 * 95) / (365 * 24 * 60) + Math.sin(driftPhase * 1.7) * 3,
  );
  const tCo2PerSec = ((project.esgExit.crcfCarbonCreditAnnualTco2 / (365 * 24 * 3600)) + Math.sin(driftPhase * 0.5) * 0.00003).toFixed(5);

  const metrics: MissionMetric[] = [
    { label: 'CAPEX', value: `€${(bom.capexTotal / 1_000_000).toFixed(1)}M`, sub: `${(bom.capexTotal / project.generation.capacityDcKw / 1000).toFixed(0)}k €/MW`, icon: DollarSign, tone: 'sun', spark: sparkTrend('capex', 'sun', 14) },
    { label: 'IRR · equity', value: `${(finance.irrPct + irrDrift).toFixed(3)}%`, sub: finance.irrPct >= 11 ? 'above target · live' : 'below target · live', icon: TrendingUp, tone: finance.irrPct >= 10 ? 'agri' : 'sun', live: true, spark: sparkTrend('irr', finance.irrPct >= 10 ? 'agri' : 'sun', 14) },
    { label: 'DSCR · Y1', value: `${(finance.dscrY1 + dscrDrift).toFixed(3)}×`, sub: finance.dscrY1 >= 1.3 ? 'bankable · live' : 'tight · live', icon: Activity, tone: finance.dscrY1 >= 1.3 ? 'agri' : 'spark', live: true, spark: sparkTrend('dscr', 'agri', 14) },
    { label: '€ / minute', value: `€${euroPerMin}`, sub: 'PPA-derived run rate', icon: DollarSign, tone: 'agri', live: true, spark: sparkTrend('eur-min', 'agri', 14) },
    { label: 'Annual yield', value: `${finance.annualYieldGwh.toFixed(1)} GWh`, sub: `PR ${(project.operations.performanceRatioTarget * 100).toFixed(1)}%`, icon: SunMedium, tone: 'agri', spark: sparkTrend('yield', 'agri', 14) },
    { label: 'Exit EV · Y10', value: `€${(finance.exitEvEur / 1_000_000).toFixed(0)}M`, sub: `${project.finance.exitCapRatePct}% cap`, icon: ArrowUpRight, tone: 'sun', spark: sparkTrend('exit-ev', 'sun', 14) },
    { label: 'Equity MoM', value: `${(finance.equityMom + momDrift).toFixed(3)}×`, sub: `${project.finance.exitYear}-yr hold · live`, icon: Sparkles, tone: 'agri', live: true, spark: sparkTrend('mom', 'agri', 14) },
    { label: 'Capacity DC', value: `${(project.generation.capacityDcKw / 1000).toFixed(1)} MW`, sub: `${bom.moduleCount.toLocaleString()} modules`, icon: Zap, tone: 'signal', spark: sparkTrend('capacity', 'signal', 14) },
    { label: 'Storage', value: project.storage.enabled ? `${project.storage.energyMwh} MWh` : 'none', sub: project.storage.enabled ? project.storage.chemistry.toUpperCase() : '—', icon: Battery, tone: 'pulse', spark: sparkTrend('storage', 'pulse', 14) },
    { label: 'CO₂ / second', value: `${tCo2PerSec} t`, sub: `${(project.esgExit.crcfCarbonCreditAnnualTco2 / 1000).toFixed(0)}k t/yr · live`, icon: Leaf, tone: 'agri', live: true, spark: sparkTrend('co2', 'agri', 14) },
    { label: 'Queue', value: `#${project.gridConnection.gridQueuePosition}`, sub: `of ${project.gridConnection.gridQueueTotal} · promoting`, icon: Layers, tone: 'pulse', spark: sparkTrend('queue', 'pulse', 14) },
    { label: 'Health', value: `${validation.healthScore}/100`, sub: `${validation.errorCount}E · ${validation.warnCount}W`, icon: ShieldCheck, tone: validation.errorCount > 0 ? 'spark' : validation.warnCount > 2 ? 'sun' : 'agri', spark: sparkTrend('health', 'agri', 14) },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-canvas"
      >
        {/* Ambient canvas */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 25%, rgba(124,92,255,0.10), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 90%, rgba(74,222,128,0.08), transparent 60%)',
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-border/60 px-10 py-4">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-pulse/60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pulse" />
            </span>
            <span className="font-display text-lg uppercase tracking-tech-tight text-text-primary">
              panonica · mission control
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
              {project.site.projectName || 'kopanica-beravci · paladina'} · {project.site.areaHa} ha · all live
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <span className="flex items-center gap-1.5 text-text-primary tabular-nums">
              <Clock className="h-3 w-3 text-pulse" strokeWidth={1.8} />
              {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="tabular-nums text-text-primary">
              session · {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="text-agri tabular-nums">
              {visitedCount} / {DEMO_ROUTES.length} routes
            </span>
            <span className="text-pulse tabular-nums">
              {filledScenarios} scenarios saved
            </span>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-bright bg-surface/60 px-3 py-1.5 text-text-muted transition-colors hover:border-spark hover:text-spark"
            >
              <X className="h-3 w-3" strokeWidth={1.8} />
              exit
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="relative z-10 flex flex-1 gap-6 overflow-hidden px-10 py-6">
          {/* LEFT · 12 metric wall */}
          <div className="grid flex-1 grid-cols-4 grid-rows-3 gap-4">
            {metrics.map((m, i) => (
              <MetricTile key={m.label} metric={m} delay={i * 0.05} />
            ))}
          </div>

          {/* RIGHT · Croatia map + DNA + status */}
          <div className="flex w-[300px] shrink-0 flex-col gap-4">
            {/* Rotating Croatia SVG with sun rays to Kopanica-Beravci */}
            <CroatiaRadar tick={smoothTick} />

            <div className="flex flex-col items-center gap-3 rounded-lg border border-pulse/30 bg-surface/30 p-4 backdrop-blur">
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
                deal DNA · morphs live
              </span>
              <DnaGlyph config={config} size={160} />
            </div>

            <div className="flex-1 rounded-lg border border-agri/30 bg-agri/5 p-3 font-mono text-[10px] leading-relaxed text-text-secondary backdrop-blur">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-agri">
                <Radio className="h-3 w-3 animate-pulse" strokeWidth={1.8} />
                keyboard · jump
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">1</kbd>hero</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">2</kbd>context</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">3</kbd>land</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">4</kbd>solar</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">5</kbd>grid</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">6</kbd>agri</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">7</kbd>config</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">8</kbd>finance</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">9</kbd>subsidies</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">M</kbd>market</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">B</kbd>builder</span>
                <span><kbd className="mr-1 rounded bg-surface px-1 text-text-primary">esc</kbd>exit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live news ticker — scrolls right-to-left */}
        <div className="relative z-10 overflow-hidden border-y border-border/60 bg-canvas/60 py-2">
          <NewsTicker />
        </div>

        {/* Footer hint */}
        <div className="relative z-10 flex items-center justify-between border-t border-border/60 px-10 py-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          <span>
            <kbd className="mx-1 rounded border border-border-bright bg-surface px-1.5 py-0.5">⌘⇧F</kbd>
            toggle PSOC
          </span>
          <span className="text-text-secondary">
            PSOC · pannonian solar operations center · {new Date().toISOString().slice(0, 10)}
          </span>
          <span>
            <kbd className="mx-1 rounded border border-border-bright bg-surface px-1.5 py-0.5">esc</kbd>
            exit
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ======================== CROATIA RADAR ======================== */

function CroatiaRadar({ tick }: { tick: number }) {
  const rot = (tick * 1.4) % 360;
  // Kopanica-Beravci position in this simplified SVG (viewBox 0 0 100 70)
  const kopX = 74;
  const kopY = 46;
  return (
    <div className="relative flex flex-col items-center gap-2 overflow-hidden rounded-lg border border-signal/30 bg-surface/30 p-4 backdrop-blur">
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal">
        radar · croatia · kopanica-beravci
      </span>
      <svg viewBox="0 0 100 70" className="w-full" style={{ aspectRatio: '100/70' }}>
        {/* Simplified Croatia silhouette (tight approximation) */}
        <path
          d="M 6 28 L 12 22 L 20 19 L 28 18 L 35 21 L 40 23 L 48 22 L 54 24 L 62 23 L 72 25 L 82 28 L 90 32 L 92 38 L 88 45 L 82 50 L 76 52 L 80 60 L 70 64 L 56 60 L 40 54 L 28 58 L 18 52 L 10 44 L 8 36 Z"
          fill="#2A2E38"
          fillOpacity={0.4}
          stroke="#4FA6D9"
          strokeOpacity={0.5}
          strokeWidth={0.4}
        />
        {/* Radar sweep cone */}
        <defs>
          <linearGradient id="radar-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4FA6D9" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#4FA6D9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`rotate(${rot} ${kopX} ${kopY})`}>
          <path
            d={`M ${kopX} ${kopY} L ${kopX + 40} ${kopY - 14} A 42 42 0 0 1 ${kopX + 40} ${kopY + 14} Z`}
            fill="url(#radar-sweep)"
          />
        </g>
        {/* Concentric rings */}
        {[8, 16, 24].map((r) => (
          <circle
            key={r}
            cx={kopX}
            cy={kopY}
            r={r}
            fill="none"
            stroke="#4FA6D9"
            strokeOpacity={0.25}
            strokeWidth={0.3}
            strokeDasharray="1 2"
          />
        ))}
        {/* Kopanica-Beravci marker */}
        <circle cx={kopX} cy={kopY} r={2.2} fill="#7C5CFF" stroke="#FAFAFA" strokeWidth={0.6}>
          <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x={kopX + 4} y={kopY - 2} fill="#B89CFF" fontFamily="monospace" fontSize={3}>
          KOPANICA-BERAVCI
        </text>
        {/* Coordinates corner */}
        <text x={6} y={6} fill="#6B7180" fontFamily="monospace" fontSize={2.4}>
          45.1348°N  18.4130°E
        </text>
        <text x={94} y={68} fill="#6B7180" fontFamily="monospace" fontSize={2.4} textAnchor="end">
          PSOC · LIVE
        </text>
      </svg>
    </div>
  );
}

/* ======================== NEWS TICKER ======================== */

function NewsTicker() {
  const items = [
    { t: 'FZOEU pool', v: 'OI-2026-03 · €42M · deadline 2026-07-15', tone: 'sun' },
    { t: 'HOPS queue', v: 'Kopanica-Beravci #14 · promoting to #8 by Oct 2026', tone: 'pulse' },
    { t: 'HROTE avg', v: '€94.3/MWh this week · peak €116 17:00-21:00', tone: 'agri' },
    { t: 'NPOO call', v: 'Green transition · window open · match with FZOEU', tone: 'signal' },
    { t: 'ENTSO-E', v: 'HR↔BiH cross-border coupling · €380k/yr export upside', tone: 'signal' },
    { t: 'TS Slav. Brod 1', v: 'Q2 substation study scheduled · 22.8 km PCC', tone: 'pulse' },
    { t: 'Solarna Hrvatska', v: '2026 record 1,892 MW approved · Slavonia +312 MW', tone: 'sun' },
    { t: 'UPU amendment', v: 'Velika Kopanica · public consultation 2026-05-20', tone: 'agri' },
  ];
  // Duplicate the strip so the CSS marquee has no seam
  const strip = [...items, ...items];
  return (
    <div className="relative flex w-full overflow-hidden">
      <motion.div
        className="flex shrink-0 gap-10 pl-[100%] font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
      >
        {strip.map((it, i) => {
          const toneCls = {
            pulse: 'text-pulse',
            sun: 'text-sun',
            agri: 'text-agri',
            signal: 'text-signal',
          }[it.tone] ?? 'text-text-secondary';
          return (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap">
              <span className={cn('inline-block h-1.5 w-1.5 rounded-full', it.tone === 'pulse' ? 'bg-pulse' : it.tone === 'sun' ? 'bg-sun' : it.tone === 'agri' ? 'bg-agri' : 'bg-signal')} />
              <span className={toneCls}>{it.t}</span>
              <span className="text-text-secondary">·</span>
              <span className="text-text-primary">{it.v}</span>
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}

/* =============================== TILE ================================= */

interface MissionMetric {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark';
  spark?: number[];
  live?: boolean;  // adds "LIVE" indicator + faster pulse
}

/** Deterministic pseudo-random sparkline trend seeded by label. */
function sparkTrend(seed: string, tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark', n = 14): number[] {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const uptrend = tone === 'agri' || tone === 'pulse' || tone === 'signal';
  const base = 0.45 + rand() * 0.25;
  return Array.from({ length: n }, (_, i) => {
    const drift = uptrend ? i / (n * 1.2) : -i / (n * 2);
    const noise = (rand() - 0.5) * 0.22;
    return base + drift + noise;
  });
}

function MetricTile({ metric, delay }: { metric: MissionMetric; delay: number }) {
  const { label, value, sub, icon: Icon, tone, spark, live } = metric;
  const toneCls = {
    pulse: 'text-pulse border-pulse/40 shadow-pulse/30',
    sun: 'text-sun border-sun/40 shadow-sun/30',
    agri: 'text-agri border-agri/40 shadow-agri/30',
    signal: 'text-signal border-signal/40 shadow-signal/30',
    spark: 'text-spark border-spark/40 shadow-spark/30',
  }[tone];
  const glow = {
    pulse: '0 0 40px rgba(124,92,255,0.15)',
    sun: '0 0 40px rgba(255,184,0,0.15)',
    agri: '0 0 40px rgba(74,222,128,0.15)',
    signal: '0 0 40px rgba(0,217,255,0.15)',
    spark: '0 0 40px rgba(255,61,113,0.2)',
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-xl border bg-surface/30 p-4 backdrop-blur',
        toneCls,
      )}
      style={{ boxShadow: glow }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-3.5 w-3.5', toneCls.split(' ')[0])} strokeWidth={1.8} />
          <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-text-muted">
            {label}
          </span>
        </div>
        {live && (
          <span className="inline-flex items-center gap-1 rounded-sm border border-spark/40 bg-spark/10 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.24em] text-spark">
            <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-spark" />
            live
          </span>
        )}
      </div>
      <motion.div
        key={live ? undefined : value}
        initial={live ? undefined : { opacity: 0.5, y: -4 }}
        animate={live ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          'font-display font-light leading-none tracking-tech-tight tabular-nums',
          toneCls.split(' ')[0],
          live ? 'text-[clamp(1.7rem,2.8vw,2.6rem)]' : 'text-[clamp(2rem,3.4vw,3rem)]',
        )}
      >
        {value}
      </motion.div>
      <div className="flex items-end justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          {sub}
        </span>
        {spark && (
          <Sparkline
            values={spark}
            tone={tone as 'pulse' | 'sun' | 'agri' | 'signal' | 'spark'}
            width={72}
            height={20}
            strokeWidth={1.3}
          />
        )}
      </div>

      {/* ambient pulse dot */}
      <motion.span
        className={cn('absolute right-3 top-3 inline-block h-1.5 w-1.5 rounded-full', `bg-${tone}`)}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

function LiveStatusRow({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string; tone: 'pulse' | 'sun' | 'agri' | 'signal' | 'spark' }) {
  const toneCls = { pulse: 'text-pulse', sun: 'text-sun', agri: 'text-agri', signal: 'text-signal', spark: 'text-spark' }[tone];
  return (
    <div className="flex items-center gap-3 border-b border-border/40 py-1.5 last:border-b-0">
      <Icon className={cn('h-3 w-3 shrink-0', toneCls)} strokeWidth={1.8} />
      <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </span>
      <span className={cn('font-mono text-[10px] tabular-nums', toneCls)}>{value}</span>
    </div>
  );
}
