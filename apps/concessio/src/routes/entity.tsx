import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, User, Landmark } from 'lucide-react';
import { Citation, cn } from '@paladian/ui';
import { findEntity, entities } from '@/mock/entities';
import { deals } from '@/mock/deals';
import { news } from '@/mock/news';
import { kupariEdges } from '@/mock/kupariDeal';

export function EntityRoute() {
  const { slug } = useParams();
  const entity = findEntity(slug ?? '');

  if (!entity) {
    return (
      <section className="flex min-h-full items-center justify-center px-10 py-16">
        <div className="text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            entity not found
          </div>
          <Link
            to="/"
            className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-pulse"
          >
            return home
          </Link>
        </div>
      </section>
    );
  }

  const relatedEdges = kupariEdges.filter((e) => e.from === slug || e.to === slug);
  const Icon =
    entity.type === 'person' ? User : entity.type === 'government' ? Landmark : Building2;

  return (
    <section className="relative min-h-[calc(100vh-2.75rem)] px-10 py-10">
      <article className="mx-auto flex max-w-[960px] flex-col gap-10 pb-20">
        {/* HERO */}
        <div className="border-b border-border pb-8">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
            <Icon className="h-3.5 w-3.5 text-pulse" strokeWidth={1.8} />
            entity profile · {entity.type}
          </div>
          <h1 className="font-editorial text-[3.5rem] leading-none text-text-primary">
            {entity.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
            <span>{entity.country}</span>
            {entity.born && <span>born {entity.born}</span>}
            {entity.status && <span className="text-text-muted">· {entity.status}</span>}
          </div>
          {entity.notes && (
            <p className="mt-4 max-w-2xl font-editorial text-xl italic text-text-secondary">
              {entity.notes}
            </p>
          )}
        </div>

        {/* ROLES — only for people */}
        {entity.roles && entity.roles.length > 0 && (
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              positions held · chronological
            </div>
            <ol className="flex flex-col gap-3">
              {entity.roles.map((r, i) => (
                <motion.li
                  key={r.role}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
                  className="flex items-baseline justify-between border-b border-border/60 pb-3"
                >
                  <span className="font-editorial text-lg text-text-primary">{r.role}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
                    {r.years}
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>
        )}

        {/* CONNECTIONS */}
        {relatedEdges.length > 0 && (
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              connections · {relatedEdges.length}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {relatedEdges.map((e, i) => {
                const otherSlug = e.from === slug ? e.to : e.from;
                const other = findEntity(otherSlug);
                if (!other) return null;
                return (
                  <Link
                    key={i}
                    to={`/entity/${other.slug}`}
                    className="group flex items-start gap-3 rounded-md border border-border bg-surface/50 p-4 transition-colors hover:border-pulse"
                  >
                    <span
                      className={cn(
                        'mt-1 inline-block h-2 w-2 rounded-full',
                        e.kind === 'own' && 'bg-pulse',
                        e.kind === 'contract' && 'bg-signal',
                        e.kind === 'director' && 'bg-sun',
                        e.kind === 'grantor' && 'bg-agri',
                        e.kind === 'origin-ru' && 'bg-spark',
                        e.kind === 'related' && 'bg-text-muted',
                      )}
                    />
                    <div>
                      <div className="font-editorial text-base text-text-primary group-hover:text-pulse">
                        {other.name}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                        {e.label}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* DEALS */}
        {(slug === 'ivan-paladina' || slug === 'kupari-luxury-hotels') && (
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              deals involved in
            </div>
            <div className="flex flex-col gap-2">
              <DealRow
                to="/deal/kupari"
                name="Kupari Four Seasons"
                sub="Župa Dubrovačka · 99-year concession"
                stake={slug === 'ivan-paladina' ? '10% (contested)' : '100%'}
              />
              {slug === 'ivan-paladina' && (
                <>
                  <DealRow
                    to="/deal/kupari"
                    name="Beravci Agrivoltaic Zone"
                    sub="Velika Kopanica · 80.3 ha"
                    stake="100% (Paladina Investments)"
                  />
                  <DealRow
                    to="/entity/institut-igh"
                    name="Institut IGH"
                    sub="Zagreb · presidency 2015–2017"
                    stake="role"
                  />
                  <DealRow
                    to="/deal/kupari"
                    name="Delta Savjetovanje"
                    sub="Zagreb · consultancy holding"
                    stake="director · 100% owner"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* PUBLIC RECORD */}
        {slug === 'ivan-paladina' && (
          <div>
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              public record · selected references
            </div>
            <ol className="flex flex-col gap-2">
              {news
                .filter((n) => n.asset === 'kupari' || n.asset === 'beravci')
                .slice(0, 5)
                .map((n, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-md border border-border/60 bg-surface/30 p-3 font-mono text-[11px]"
                  >
                    <Citation index={i + 1} />
                    <span className="text-text-muted">{n.source}</span>
                    <span className="text-text-secondary">&ldquo;{n.headline}&rdquo;</span>
                    <span className="ml-auto text-text-muted tabular-nums">{n.date}</span>
                  </li>
                ))}
            </ol>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Link
            to="/deal/kupari"
            className="group inline-flex items-center gap-3 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
              open kupari dossier
            </span>
            <ArrowRight
              className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </article>
    </section>
  );
}

function DealRow({ to, name, sub, stake }: { to: string; name: string; sub: string; stake: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-md border border-border bg-surface/50 px-5 py-3 transition-colors hover:border-pulse"
    >
      <div>
        <div className="font-editorial text-base text-text-primary group-hover:text-pulse">
          {name}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
          {sub}
        </div>
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
        {stake}
      </span>
    </Link>
  );
}
