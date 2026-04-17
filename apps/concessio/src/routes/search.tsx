import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, User, FileText, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@paladian/ui';
import { deals } from '@/mock/deals';
import { entities } from '@/mock/entities';

type ResultType = 'deal' | 'entity' | 'location' | 'document';

interface Result {
  type: ResultType;
  title: string;
  subtitle: string;
  to: string;
  tag?: string;
  date?: string;
}

export function SearchRoute() {
  const [params] = useSearchParams();
  const initial = params.get('q') ?? 'Kupari';
  const [q, setQ] = useState(initial);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const nav = useNavigate();

  const results = useMemo<Result[]>(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return [];

    const dealHits: Result[] = deals
      .filter((d) => d.name.toLowerCase().includes(needle) || d.slug.includes(needle))
      .map((d) => ({
        type: 'deal',
        title: d.name,
        subtitle: `${d.location} · ${d.category} · €${(d.investmentEUR / 1_000_000).toFixed(0)}M`,
        to: `/deal/${d.slug}`,
        tag: d.status,
      }));

    const entityHits: Result[] = entities
      .filter((e) => e.name.toLowerCase().includes(needle) || e.slug.includes(needle))
      .slice(0, 8)
      .map((e) => ({
        type: 'entity',
        title: e.name,
        subtitle: `${e.type} · ${e.country}${e.status ? ` · ${e.status}` : ''}`,
        to: `/entity/${e.slug}`,
      }));

    // For Kupari specifically, inject the "extras" the brief calls out
    const extras: Result[] = [];
    if (needle === 'kupari' || needle.startsWith('kup')) {
      extras.push(
        {
          type: 'deal',
          title: 'Kupari Luxury Hotels d.o.o. — registration',
          subtitle: 'company formation · 2016',
          to: '/entity/kupari-luxury-hotels',
          date: '2016',
        },
        {
          type: 'deal',
          title: 'Kupari I — UPU amendment',
          subtitle: 'spatial plan · adopted 2024',
          to: '/deal/kupari',
          date: '2024',
        },
        {
          type: 'location',
          title: 'Kupari, Župa Dubrovačka',
          subtitle: 'settlement · Dubrovnik-Neretva',
          to: '/deal/kupari',
        },
        {
          type: 'document',
          title: 'Kupari Concession Contract',
          subtitle: 'government of croatia · 2016-03-31',
          to: '/deal/kupari',
          tag: 'PDF',
        },
        {
          type: 'document',
          title: 'Amendment I Kupari',
          subtitle: 'narodne novine · 2018-06',
          to: '/deal/kupari',
          tag: 'PDF',
        },
        {
          type: 'document',
          title: 'Amendment II Kupari',
          subtitle: 'hina · 2023-04-27',
          to: '/deal/kupari',
          tag: 'PDF',
        },
        {
          type: 'document',
          title: 'UPU Kupari I',
          subtitle: 'općina župa dubrovačka · 2024-06',
          to: '/deal/kupari',
          tag: 'PDF',
        },
      );
    }

    return [...dealHits, ...extras, ...entityHits];
  }, [q]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIdx]) {
        e.preventDefault();
        nav(results[selectedIdx].to);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [results, selectedIdx, nav]);

  const grouped = useMemo(() => {
    const g: Record<ResultType, Result[]> = {
      deal: [],
      entity: [],
      location: [],
      document: [],
    };
    results.forEach((r) => g[r.type].push(r));
    return g;
  }, [results]);

  return (
    <section className="relative min-h-[calc(100vh-2.75rem)] px-10 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="relative flex items-center rounded-md border border-pulse/40 bg-surface/80 px-5 shadow-glow-pulse">
          <Search className="h-4 w-4 text-pulse" strokeWidth={1.8} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent px-4 py-5 font-mono text-base text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
            {results.length} result{results.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-md border border-border bg-surface/50">
          {Object.entries(grouped).map(([type, items]) => {
            if (!items.length) return null;
            return (
              <div key={type} className="border-b border-border last:border-0">
                <div className="sticky top-0 bg-surface px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {type}s
                </div>
                {items.map((r) => {
                  const flatIdx = results.indexOf(r);
                  const isActive = flatIdx === selectedIdx;
                  return (
                    <Link
                      key={`${r.type}-${r.title}`}
                      to={r.to}
                      onMouseEnter={() => setSelectedIdx(flatIdx)}
                      className={cn(
                        'flex items-center justify-between gap-4 border-t border-border px-5 py-3 transition-colors first:border-0',
                        isActive ? 'bg-pulse/10' : 'hover:bg-surface-raised/60',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ResultIcon type={r.type} active={isActive} />
                        <div>
                          <div
                            className={cn(
                              'font-mono text-sm',
                              isActive ? 'text-pulse' : 'text-text-primary',
                            )}
                          >
                            {r.title}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                            {r.subtitle}
                          </div>
                        </div>
                      </div>
                      {r.tag && (
                        <span
                          className={cn(
                            'rounded-sm border border-border bg-canvas px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]',
                            r.tag === 'active' && 'border-pulse/40 text-pulse',
                            r.tag === 'stalled' && 'border-spark/40 text-spark',
                            r.tag === 'PDF' && 'text-text-muted',
                          )}
                        >
                          {r.tag}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {results.length === 0 && (
            <div className="px-5 py-12 text-center font-mono text-sm text-text-muted">
              no results for "{q}"
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          <span>
            <span className="text-text-secondary">↑/↓</span> to navigate ·{' '}
            <span className="text-text-secondary">enter</span> to open
          </span>
          <span>concessio · v0.1.0</span>
        </div>
      </div>
    </section>
  );
}

function ResultIcon({ type, active }: { type: ResultType; active: boolean }) {
  const cls = cn('h-4 w-4', active ? 'text-pulse' : 'text-text-muted');
  if (type === 'deal') return <Briefcase className={cls} strokeWidth={1.8} />;
  if (type === 'entity') return type === 'entity' ? <Building2 className={cls} /> : <User className={cls} />;
  if (type === 'location') return <MapPin className={cls} strokeWidth={1.8} />;
  return <FileText className={cls} strokeWidth={1.8} />;
}
