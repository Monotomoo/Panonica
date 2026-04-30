import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Building2,
  Cable,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Cpu,
  Database,
  DollarSign,
  Download,
  Factory,
  Fence,
  FileCheck2,
  FileText,
  Gauge,
  HardHat,
  Leaf,
  MapPin,
  Package,
  Plug,
  Radio,
  RefreshCcw,
  Save,
  ShieldAlert,
  Sparkles,
  SunMedium,
  TreePine,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@paladian/ui';
import {
  SECTION_ORDER,
  SECTION_LABELS,
  useProjectStore,
  type SectionKey,
} from '@/store/projectStore';
import { validateProject } from '@/lib/validationEngine';
import { deriveBuilderBom, deriveBuilderFinance } from '@/lib/builderDerive';
import { DnaGlyph } from '@/components/DnaGlyph';
import { useConfigStore } from '@/store/configStore';

import { SiteSection } from '@/components/builder/sections/Site';
import { ClimateSection } from '@/components/builder/sections/Climate';
import { LandUseSection } from '@/components/builder/sections/LandUse';
import { GenerationSection } from '@/components/builder/sections/Generation';
import { PowerElectronicsSection } from '@/components/builder/sections/PowerElectronics';
import { GridConnectionSection } from '@/components/builder/sections/GridConnection';
import { StorageSection } from '@/components/builder/sections/Storage';
import { AgricultureSection } from '@/components/builder/sections/Agriculture';
import { CivilBosSection } from '@/components/builder/sections/CivilBos';
import { ScadaSection } from '@/components/builder/sections/Scada';
import { FinanceSection } from '@/components/builder/sections/Finance';
import { PermittingSection } from '@/components/builder/sections/Permitting';
import { ConstructionSection } from '@/components/builder/sections/Construction';
import { OperationsSection } from '@/components/builder/sections/Operations';
import { RiskInsuranceSection } from '@/components/builder/sections/RiskInsurance';
import { EsgExitSection } from '@/components/builder/sections/EsgExit';
import { BuilderLivePanel } from '@/components/builder/BuilderLivePanel';
import { BuilderTopBar } from '@/components/builder/BuilderTopBar';

const SECTION_ICONS: Record<SectionKey, LucideIcon> = {
  site: MapPin,
  climate: CloudRain,
  landUse: Fence,
  generation: SunMedium,
  powerElectronics: Cpu,
  gridConnection: Plug,
  storage: Zap,
  agriculture: TreePine,
  civilBos: HardHat,
  scada: Radio,
  finance: DollarSign,
  permitting: FileCheck2,
  construction: Wrench,
  operations: Activity,
  riskInsurance: ShieldAlert,
  esgExit: Leaf,
};

const SECTION_RENDERERS: Record<SectionKey, React.ComponentType> = {
  site: SiteSection,
  climate: ClimateSection,
  landUse: LandUseSection,
  generation: GenerationSection,
  powerElectronics: PowerElectronicsSection,
  gridConnection: GridConnectionSection,
  storage: StorageSection,
  agriculture: AgricultureSection,
  civilBos: CivilBosSection,
  scada: ScadaSection,
  finance: FinanceSection,
  permitting: PermittingSection,
  construction: ConstructionSection,
  operations: OperationsSection,
  riskInsurance: RiskInsuranceSection,
  esgExit: EsgExitSection,
};

export function BuildRoute() {
  const project = useProjectStore();
  const [activeSection, setActiveSection] = useState<SectionKey>('site');
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [livePanelCollapsed, setLivePanelCollapsed] = useState(false);

  const validation = useMemo(() => validateProject(project), [project]);
  const bom = useMemo(() => deriveBuilderBom(project), [project]);
  const finance = useMemo(() => deriveBuilderFinance(project, bom), [project, bom]);

  // Hook builder ↔ configurator cross-reads
  const hydrateConfig = useConfigStore((s) => s.hydrate);

  // Quick-jump via Cmd+/ (search within builder)
  // (Deferred — hooked via command palette route entry)

  // Keyboard nav between sections
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      }
      if (e.altKey && (e.key === 'ArrowDown' || e.key === 'j')) {
        e.preventDefault();
        const idx = SECTION_ORDER.indexOf(activeSection);
        setActiveSection(SECTION_ORDER[Math.min(SECTION_ORDER.length - 1, idx + 1)]);
      } else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'k')) {
        e.preventDefault();
        const idx = SECTION_ORDER.indexOf(activeSection);
        setActiveSection(SECTION_ORDER[Math.max(0, idx - 1)]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeSection]);

  // Sync to Configurator store (best-effort · lets Builder push state into the simpler configStore)
  const pushToConfigurator = () => {
    hydrateConfig({
      capacityMW: project.generation.capacityDcKw / 1000,
      panelHeight: project.generation.panelHeightMaxM,
      rowSpacing: project.generation.rowPitchM,
      tracking: project.generation.tilt === '1-axis' || project.generation.tilt === '2-axis'
        ? project.generation.tilt
        : 'fixed',
      battery: project.storage.enabled ? project.storage.energyMwh : 0,
      underPanel: project.agriculture.system === 'sheep' ? 'sheep'
        : project.agriculture.system === 'soy' ? 'soy'
        : project.agriculture.system === 'herbs' ? 'herbs'
        : 'none',
      batteryChem: project.storage.chemistry === 'nmc' ? 'nmc'
        : project.storage.chemistry === 'flow' ? 'flow'
        : 'lfp',
      mvKv: project.gridConnection.pccVoltageKv,
      gcr: project.generation.groundCoverageRatio,
      fenceHeightM: project.civilBos.fenceHeightM,
      cctvCount: project.civilBos.cctvCount,
      dcAcRatio: project.powerElectronics.dcAcRatio,
    });
  };

  const ActiveSection = SECTION_RENDERERS[activeSection];

  return (
    <section className="flex h-[calc(100vh-2.75rem)] flex-col">
      <BuilderTopBar validation={validation} finance={finance} onPushToConfigurator={pushToConfigurator} />

      <div className="grid flex-1 grid-cols-[auto_1fr_auto] gap-0 overflow-hidden">
        {/* LEFT — section nav */}
        <aside
          className={cn(
            'flex flex-col border-r border-border bg-surface/30 transition-all duration-200',
            navCollapsed ? 'w-[52px]' : 'w-[230px]',
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            {!navCollapsed && (
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                sections · {SECTION_ORDER.length}
              </span>
            )}
            <button
              onClick={() => setNavCollapsed((c) => !c)}
              className="rounded-sm border border-border-bright bg-surface p-1 text-text-muted transition-colors hover:border-pulse hover:text-pulse"
              title={navCollapsed ? 'Expand' : 'Collapse'}
            >
              {navCollapsed ? <ChevronRight className="h-3 w-3" strokeWidth={1.8} /> : <ChevronLeft className="h-3 w-3" strokeWidth={1.8} />}
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {SECTION_ORDER.map((key) => {
              const meta = SECTION_LABELS[key];
              const Icon = SECTION_ICONS[key];
              const active = key === activeSection;
              const issueCount = validation.violations.filter((v) => v.section === key).length;
              const hasError = validation.violations.some((v) => v.section === key && v.severity === 'error');
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors',
                    active ? 'bg-pulse/15 text-pulse ring-1 ring-pulse/30' : 'text-text-secondary hover:bg-surface/60 hover:text-text-primary',
                  )}
                  title={`${meta.num} · ${meta.title}`}
                >
                  <span className="font-mono text-[9px] tabular-nums text-text-muted">{meta.num}</span>
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-pulse' : 'text-text-muted group-hover:text-text-secondary')} strokeWidth={1.8} />
                  {!navCollapsed && (
                    <span className="flex-1 font-mono text-[11px] uppercase tracking-[0.16em]">
                      {meta.title}
                    </span>
                  )}
                  {!navCollapsed && issueCount > 0 && (
                    <span
                      className={cn(
                        'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[9px] tabular-nums',
                        hasError ? 'bg-spark/20 text-spark' : 'bg-sun/20 text-sun',
                      )}
                    >
                      {issueCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {!navCollapsed && (
            <div className="border-t border-border p-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              <kbd className="mx-1 rounded border border-border-bright bg-surface px-1 py-0.5">alt</kbd>
              +
              <kbd className="mx-1 rounded border border-border-bright bg-surface px-1 py-0.5">↑↓</kbd>
              next · prev
            </div>
          )}
        </aside>

        {/* MIDDLE — active section */}
        <div className="flex min-w-0 flex-col overflow-hidden bg-canvas">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-full flex-col overflow-hidden"
          >
            <ActiveSection />
          </motion.div>
        </div>

        {/* RIGHT — live panel */}
        <aside
          className={cn(
            'flex flex-col border-l border-border bg-surface/30 transition-all duration-200',
            livePanelCollapsed ? 'w-[44px]' : 'w-[340px]',
          )}
        >
          <BuilderLivePanel
            validation={validation}
            bom={bom}
            finance={finance}
            collapsed={livePanelCollapsed}
            onToggleCollapse={() => setLivePanelCollapsed((c) => !c)}
          />
        </aside>
      </div>
    </section>
  );
}
