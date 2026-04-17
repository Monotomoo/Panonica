import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { NumberTicker, DataPanel, cn } from '@paladian/ui';
import { ParcelMap } from '@/components/ParcelMap';
import { beravciParcel } from '@/mock/parcel';

export function LandRoute() {
  return (
    <section className="grid h-full grid-cols-[1.4fr_1fr] gap-0">
      {/* LEFT — map */}
      <div className="relative min-h-[calc(100vh-2.75rem)]">
        <ParcelMap
          backgroundUrl="/imagery/beravci-close.png"
          imageOpacity={0.92}
          drawOnMount
          drawDelay={0.3}
          tone="pulse"
          showSunArc
          showCentroidPulse
          showScaleBar
          showCadastralHint
        />
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            satellite view · mapbox
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            45.2074°N 18.4393°E · zoom 14.5
          </span>
        </div>
      </div>

      {/* RIGHT — data panel */}
      <div className="flex min-h-full flex-col justify-between border-l border-border bg-surface/40 px-8 py-10">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <MapPin className="h-3 w-3" strokeWidth={1.8} /> parcel overview
          </div>
          <h1 className="font-display text-4xl uppercase tracking-tech-tight text-text-primary">
            Beravci
          </h1>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary">
            Općina Velika Kopanica · Brodsko-posavska županija
          </div>

          <div className="mt-6 flex items-baseline gap-4">
            <div className="font-display text-5xl tracking-tech-tight text-pulse">
              <NumberTicker value={80.3} decimals={1} duration={1.3} />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
              hectares
            </span>
          </div>

          <div className="mt-8">
            <DataPanel
              title="PARCEL METADATA"
              rows={[
                {
                  label: 'estimated value',
                  value: (
                    <span>
                      €1,050,000{' '}
                      <span className="text-text-muted">(HRK 7,568,152)</span>
                    </span>
                  ),
                  tone: 'pulse',
                },
                { label: 'land use (current)', value: 'Agricultural / gospodarska zona' },
                { label: 'zoning (pending)', value: 'UPU amendment · Velika Kopanica' },
                { label: 'nearest settlement', value: 'Beravci (0.3 km)' },
                { label: 'nearest city', value: 'Slavonski Brod (18 km)' },
                { label: 'road access', value: 'D7 state road (2 km)' },
                { label: 'elevation range', value: '89 m – 97 m a.s.l.' },
                { label: 'orientation', value: 'S-facing · mean aspect 182°' },
                { label: 'soil class', value: 'IV–V (adequate for agri-PV)' },
                { label: 'water table', value: '-2.8 m avg', tone: 'signal' },
                {
                  label: 'acquisition',
                  value: 'IGH bond recovery · 2019',
                  tone: 'muted',
                },
              ]}
            />
          </div>

          <div className="mt-8">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              parcel breakdown · {beravciParcel.parcels.building + beravciParcel.parcels.arable}{' '}
              registered parcels
            </div>
            <div className="flex flex-wrap gap-[3px]">
              {beravciParcel.cadastralNumbers.map((id, i) => {
                const isArable = i >= beravciParcel.parcels.building;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.4 + i * 0.012,
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    title={`${id} · ${isArable ? 'oranica' : 'građevinsko'}`}
                    className={cn(
                      'h-4 w-5 rounded-[2px] transition-colors',
                      isArable
                        ? 'bg-agri/15 hover:bg-agri/40'
                        : 'bg-pulse/15 hover:bg-pulse/40',
                    )}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm bg-pulse/60" /> građevinsko ×
                45
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm bg-agri/60" /> oranica × 6
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/solar"
          className="group mt-10 inline-flex items-center justify-between gap-4 rounded-md border border-border-bright bg-surface px-5 py-3 transition-all hover:border-pulse hover:shadow-glow-pulse"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary group-hover:text-pulse">
            analyze solar potential
          </span>
          <ArrowRight
            className="h-4 w-4 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-pulse"
            strokeWidth={1.8}
          />
        </Link>
      </div>
    </section>
  );
}
