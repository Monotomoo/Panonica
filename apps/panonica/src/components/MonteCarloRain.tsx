import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Binary, Play, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@paladian/ui';

/**
 * Monte Carlo Rain · particle simulation on <canvas>.
 *
 * 1000 simulated IRR outcomes fall as particles into 20 probability buckets.
 * Over ~5 seconds they settle, revealing the IRR distribution.
 * P10/P50/P90 markers appear when the rain is done.
 *
 * Replaces the static line-chart Monte Carlo with something truly cinematic.
 *
 * Algorithm:
 *   Each particle = one Monte Carlo draw from the IRR distribution.
 *   Draw = base + normal(0, stdDev) * (1 + market_shock)
 *   Each particle falls into a bucket by its rounded value.
 */

export interface MonteCarloRainProps {
  baseIrrPct: number;
  stdDev?: number;
  runs?: number;
  onResult?: (result: { p10: number; p50: number; p90: number }) => void;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  irr: number;
  color: string;
  settled: boolean;
  bucketIdx: number;
  finalX: number;
  finalY: number;
  radius: number;
}

export function MonteCarloRain({ baseIrrPct, stdDev = 2.5, runs = 1000, onResult, className }: MonteCarloRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // 0..1 progress
  const [stats, setStats] = useState<{ p10: number; p50: number; p90: number; runs: number } | null>(null);
  const [tickVersion, setTickVersion] = useState(0);

  // Buckets from IRR_MIN to IRR_MAX in 0.5pp increments
  const IRR_MIN = Math.max(0, Math.floor(baseIrrPct - 4));
  const IRR_MAX = Math.ceil(baseIrrPct + 4);
  const BUCKET_STEP = 0.5;
  const BUCKETS = Math.ceil((IRR_MAX - IRR_MIN) / BUCKET_STEP);

  const start = () => {
    setRunning(true);
    setElapsed(0);
    setStats(null);
    setTickVersion((v) => v + 1);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setStats(null);
  };

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Generate particles (all at once, but fall in staggered)
    const particles: Particle[] = [];
    for (let i = 0; i < runs; i++) {
      const u1 = Math.max(Math.random(), 1e-9);
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const irr = baseIrrPct + z * stdDev;
      const clamped = Math.max(IRR_MIN, Math.min(IRR_MAX - 0.01, irr));
      const bucketIdx = Math.floor((clamped - IRR_MIN) / BUCKET_STEP);
      const color =
        irr < baseIrrPct - 2 ? 'rgba(255,61,113,0.75)' :
        irr > baseIrrPct + 2 ? 'rgba(74,222,128,0.75)' :
        'rgba(124,92,255,0.75)';

      particles.push({
        x: (bucketIdx + 0.5) * (w / BUCKETS) + (Math.random() - 0.5) * (w / BUCKETS) * 0.8,
        y: -Math.random() * 200 - (i / runs) * 400,
        vx: 0,
        vy: 0,
        irr,
        color,
        settled: false,
        bucketIdx,
        finalX: 0,
        finalY: 0,
        radius: 1.4 + Math.random() * 0.6,
      });
    }

    // Compute bucket final resting positions (column stacks)
    const bucketCounts: number[] = new Array(BUCKETS).fill(0);
    for (const p of particles) bucketCounts[p.bucketIdx]++;
    const maxBucket = Math.max(1, ...bucketCounts);
    const bucketWidth = w / BUCKETS;
    const stackUnitHeight = (h - 60) / maxBucket;

    const bucketFillIdx: number[] = new Array(BUCKETS).fill(0);
    // Precompute final positions sorted so lower-in-stack particles land first
    particles.sort((a, b) => a.y - b.y);
    for (const p of particles) {
      const fill = bucketFillIdx[p.bucketIdx]++;
      const bucketX = (p.bucketIdx + 0.5) * bucketWidth;
      p.finalX = bucketX + (Math.random() - 0.5) * bucketWidth * 0.8;
      p.finalY = h - 10 - fill * stackUnitHeight;
    }

    const startTs = performance.now();
    const DURATION = 4500; // ms

    const draw = () => {
      const now = performance.now();
      const t = Math.min(1, (now - startTs) / DURATION);
      setElapsed(t);

      ctx.clearRect(0, 0, w, h);

      // Ground gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(10,10,11,0)');
      grad.addColorStop(1, 'rgba(124,92,255,0.04)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Bucket axis line
      ctx.strokeStyle = 'rgba(42,42,48,0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, h - 5);
      ctx.lineTo(w, h - 5);
      ctx.stroke();

      // Axis labels (every 2 pp)
      ctx.fillStyle = 'rgba(138,138,148,0.6)';
      ctx.font = '9px JetBrains Mono, monospace';
      for (let v = IRR_MIN; v <= IRR_MAX; v += 2) {
        const x = ((v - IRR_MIN) / (IRR_MAX - IRR_MIN)) * w;
        ctx.fillText(`${v}%`, x - 8, h - 32);
        ctx.beginPath();
        ctx.moveTo(x, h - 5);
        ctx.lineTo(x, h - 20);
        ctx.strokeStyle = 'rgba(42,42,48,0.6)';
        ctx.stroke();
      }

      // Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Stagger release: each particle has its own start delay
        const delay = (i / runs) * 0.45; // 0..0.45
        const particleT = Math.max(0, (t - delay) / (1 - delay));
        if (particleT <= 0) continue;

        // Bezier-like ease-in-out, with slight horizontal drift to finalX
        const eased = 1 - Math.pow(1 - particleT, 2.8);
        p.x = p.x + (p.finalX - p.x) * eased * 0.08;
        p.y = -100 + (p.finalY + 100) * eased;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      if (t >= 1 && !stats) {
        // Compute percentiles
        const sortedIrr = particles.map((p) => p.irr).sort((a, b) => a - b);
        const p10 = sortedIrr[Math.floor(runs * 0.1)];
        const p50 = sortedIrr[Math.floor(runs * 0.5)];
        const p90 = sortedIrr[Math.floor(runs * 0.9)];
        const result = { p10, p50, p90, runs };
        setStats(result);
        onResult?.({ p10, p50, p90 });
        setRunning(false);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, tickVersion, baseIrrPct, stdDev, runs]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
          <Binary className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
          monte carlo rain · {runs.toLocaleString()} outcomes · falling live
        </div>
        <div className="flex items-center gap-2">
          {stats && (
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em]">
              <span className="text-spark">p10 · {stats.p10.toFixed(1)}%</span>
              <span className="text-pulse">median · {stats.p50.toFixed(1)}%</span>
              <span className="text-agri">p90 · {stats.p90.toFixed(1)}%</span>
            </div>
          )}
          <button
            onClick={running ? reset : start}
            disabled={running}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-all',
              running
                ? 'border-sun/40 bg-sun/10 text-sun'
                : 'border-pulse/40 bg-pulse/10 text-pulse hover:bg-pulse/20 hover:shadow-glow-pulse',
            )}
          >
            {running ? (
              <>
                <Sparkles className="h-3 w-3 animate-pulse-dot" strokeWidth={1.8} />
                raining… {Math.floor(elapsed * 100)}%
              </>
            ) : (
              <>
                <Play className="h-3 w-3" strokeWidth={1.8} />
                {stats ? 'rerun' : 'release the rain'}
              </>
            )}
          </button>
          {stats && (
            <button
              onClick={reset}
              className="rounded-md border border-border-bright bg-surface p-1.5 text-text-muted transition-colors hover:border-spark hover:text-spark"
              title="Reset"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      {/* Canvas stage */}
      <div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-border bg-canvas">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Idle state · call to action */}
        <AnimatePresence>
          {!running && !stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
            >
              <Sparkles className="h-8 w-8 text-pulse" strokeWidth={1.4} />
              <span className="font-display text-xl uppercase tracking-tech-tight text-text-primary">
                1,000 simulated futures
              </span>
              <span className="max-w-md font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
                each particle is one possible equity IRR outcome · fall speed scales with probability · spectrum colors · press release to run
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Markers overlay when complete */}
        {stats && (
          <>
            <StatMarker
              label="P10"
              value={`${stats.p10.toFixed(1)}%`}
              position={((stats.p10 - IRR_MIN) / (IRR_MAX - IRR_MIN)) * 100}
              tone="spark"
            />
            <StatMarker
              label="P50"
              value={`${stats.p50.toFixed(1)}%`}
              position={((stats.p50 - IRR_MIN) / (IRR_MAX - IRR_MIN)) * 100}
              tone="pulse"
            />
            <StatMarker
              label="P90"
              value={`${stats.p90.toFixed(1)}%`}
              position={((stats.p90 - IRR_MIN) / (IRR_MAX - IRR_MIN)) * 100}
              tone="agri"
            />
          </>
        )}

        {/* Axis label */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          equity IRR · {BUCKETS} buckets · {BUCKET_STEP}pp each
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-spark" /> downside tail
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-pulse" /> base case band
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-agri" /> upside tail
        </span>
        <span className="ml-4 text-text-muted">base IRR · {baseIrrPct.toFixed(1)}% · σ {stdDev.toFixed(1)}</span>
      </div>
    </div>
  );
}

function StatMarker({ label, value, position, tone }: { label: string; value: string; position: number; tone: 'spark' | 'pulse' | 'agri' }) {
  const toneCls = { spark: 'text-spark border-spark bg-spark/10', pulse: 'text-pulse border-pulse bg-pulse/10', agri: 'text-agri border-agri bg-agri/10' }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="pointer-events-none absolute top-3 flex flex-col items-center"
      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
    >
      <div className={cn('rounded-md border bg-canvas/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] backdrop-blur', toneCls)}>
        <span className="mr-1.5 text-text-muted">{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className={cn('h-full w-px', `bg-${tone}/50`)} style={{ height: '260px' }} />
    </motion.div>
  );
}
