import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { NumberTicker, Typewriter, cn } from '@paladian/ui';
import { featuredDeals, deals } from '@/mock/deals';

const PLACEHOLDERS = [
  'Pretraži koncesije, subjekte, prostorne planove, fondove...',
  'Kupari',
  'Institut IGH',
  'Ivan Paladina',
  'Beravci gospodarska zona',
  'FZOEU 2025 calls',
  'UPU Velika Kopanica',
];

export function HomeRoute() {
  const nav = useNavigate();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const submit = () => {
    if (q.trim().toLowerCase().includes('kupari')) {
      nav('/deal/kupari');
    } else if (q.trim().toLowerCase().includes('paladina')) {
      nav('/entity/ivan-paladina');
    } else if (q.trim()) {
      nav(`/search?q=${encodeURIComponent(q.trim())}`);
    } else {
      nav('/search');
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-2.75rem)] flex-col items-center justify-center overflow-hidden px-10 py-14">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 40%, rgba(124,92,255,0.08), transparent 70%)',
        }}
      />

      {/* HERO */}
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-pulse animate-pulse-dot" />
          concessio · public procurement intelligence
        </div>

        <h1 className="font-editorial text-balance text-[5.5rem] leading-[0.92] text-text-primary">
          <TypewriterLines
            lines={['Every deal.', 'Every bidder.', 'Every amendment.', 'Every euro.']}
          />
        </h1>

        {/* SEARCH */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="group mt-14"
        >
          <div className="relative flex items-center rounded-md border border-border-bright bg-surface/80 px-5 transition-all focus-within:border-pulse focus-within:shadow-glow-pulse">
            <Search className="h-4 w-4 text-text-muted" strokeWidth={1.8} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              className="w-full bg-transparent px-4 py-5 font-mono text-base text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <div className="flex items-center gap-3">
              <kbd className="inline-flex h-6 items-center justify-center rounded-sm border border-border-bright bg-canvas px-2 font-mono text-[10px] text-text-muted">
                /
              </kbd>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                press slash to search
              </span>
            </div>
          </div>
        </form>

        {/* Live stats */}
        <div className="mt-6 flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
          <span>
            <span className="text-text-secondary">
              <NumberTicker value={47_283} />
            </span>{' '}
            concessions tracked
          </span>
          <span className="text-border-bright">·</span>
          <span>
            <span className="text-text-secondary">€8.2B</span> fund flows monitored
          </span>
          <span className="text-border-bright">·</span>
          <span>
            <span className="text-text-secondary">182</span> active UPU amendments
          </span>
          <span className="text-border-bright">·</span>
          <span>
            updated <Typewriter text="3 minutes ago" speed={60} cursor={false} />
          </span>
        </div>
      </div>

      {/* FEATURED CARDS */}
      <div className="relative z-10 mt-16 grid w-full max-w-5xl grid-cols-4 gap-3">
        {featuredDeals.map((slug, i) => {
          const d = deals.find((x) => x.slug === slug);
          if (!d) return null;
          return (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/deal/${slug}`}
                className="group block rounded-md border border-border bg-surface/50 p-5 transition-all hover:border-pulse hover:bg-surface hover:shadow-glow-pulse"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-block h-1.5 w-1.5 rounded-full',
                      d.status === 'active' && 'bg-pulse',
                      d.status === 'stalled' && 'bg-spark',
                      d.status === 'awarded' && 'bg-signal',
                      d.status === 'completed' && 'bg-gold',
                    )}
                  />
                  <ArrowRight className="h-3 w-3 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-pulse" />
                </div>
                <div className="mt-4 font-editorial text-xl text-text-primary">{d.name}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {d.location} · {d.category}
                </div>
                <div className="mt-3 font-mono text-[11px] tabular-nums text-text-secondary">
                  €{(d.investmentEUR / 1_000_000).toFixed(0)}M · {d.timelineYears}y
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function TypewriterLines({ lines }: { lines: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= lines.length) return;
    const t = setTimeout(() => setIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [idx, lines.length]);

  return (
    <>
      {lines.slice(0, idx).map((line, i) => {
        const isLast = i === lines.length - 1;
        return (
          <motion.span
            key={line}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            <span className={cn(isLast && 'text-pulse')}>{line}</span>
          </motion.span>
        );
      })}
      {idx < lines.length && (
        <span className="inline-block animate-cursor-blink text-pulse">█</span>
      )}
    </>
  );
}
