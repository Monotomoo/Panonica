import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { toneNow, type ToneState } from './lib/toneOfDay';
import {
  Activity,
  Clock,
  Coins,
  Command as CommandIcon,
  Compass,
  FileBarChart2,
  Globe,
  LandPlot,
  Layers,
  Plug,
  Radar,
  Settings2,
  ShieldAlert,
  Sparkles,
  Sprout,
  SunMedium,
  Wrench,
  Zap,
} from 'lucide-react';
import { Shell, SideNav, StatusBar, type SideNavItem } from '@paladian/ui';

import { ContextRoute } from './routes/context';
import { LandRoute } from './routes/land';
import { SolarRoute } from './routes/solar';
import { GridRoute } from './routes/grid';
import { AgricultureRoute } from './routes/agriculture';
import { ConfiguratorRoute } from './routes/configurator';
import { RoiRoute } from './routes/roi';
import { SubsidiesRoute } from './routes/subsidies';
import { IntelRoute } from './routes/intel';
import { ThesisRoute } from './routes/thesis';
import { ScenariosRoute } from './routes/scenarios';
import { RiskRoute } from './routes/risk';
import { MarketRadarRoute } from './routes/marketRadar';
import { OnePagerRoute } from './routes/onePager';
import { OfftakeRoute } from './routes/offtake';
import { CorridorRoute } from './routes/corridor';
import { BuildRoute } from './routes/build';
import { TimelineRoute } from './routes/timeline';
import { DealRoomRoute } from './routes/dealRoom';
import { DealRoomShareModal } from './components/DealRoomShareModal';
import { CommandPalette } from './components/CommandPalette';
import { AiAssist } from './components/AiAssist';
import { SpeakerMode } from './components/SpeakerMode';
import { DemoProgress } from './components/DemoProgress';
import { MissionControl } from './components/MissionControl';
import { GuidedTour } from './components/GuidedTour';
import { NegotiationMode } from './components/NegotiationMode';
import { LanguageToggle } from './components/LanguageToggle';
import { ErrorBoundary } from './components/ErrorBoundary';

const navItems: SideNavItem[] = [
  { to: '/context', label: 'Context', icon: Compass },
  { to: '/corridor', label: 'Corridor', icon: Globe },
  { to: '/land', label: 'Land', icon: LandPlot },
  { to: '/solar', label: 'Solar', icon: SunMedium },
  { to: '/grid', label: 'Grid', icon: Plug },
  { to: '/agriculture', label: 'Agriculture', icon: Sprout },
  { to: '/configurator', label: 'Configure', icon: Settings2 },
  { to: '/build', label: 'Builder', icon: Wrench },
  { to: '/roi', label: 'Finance', icon: Activity },
  { to: '/scenarios', label: 'Scenarios', icon: Layers },
  { to: '/risk', label: 'Risk', icon: ShieldAlert },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/subsidies', label: 'Subsidies', icon: Coins },
  { to: '/intel', label: 'Intel', icon: Radar },
  { to: '/market', label: 'Market', icon: Radar },
  { to: '/offtake', label: 'Offtake', icon: Radar },
  { to: '/thesis', label: 'Thesis', icon: FileBarChart2 },
];

const routeBreadcrumbs: Record<string, string> = {
  '/context': 'MACRO CONTEXT · WHY NOW · WHY KOPANICA-BERAVCI',
  '/corridor': 'CORRIDOR · TRANSPORT · BORDERS · BUSINESS ZONE · PALADINA 2023 DECK',
  '/land': 'KOPANICA-BERAVCI · OPĆINA VELIKA KOPANICA · BRODSKO-POSAVSKA ŽUPANIJA',
  '/solar': 'SOLAR ATLAS · KOPANICA-BERAVCI 45.1348°N 18.4130°E',
  '/grid': 'GRID CAPACITY · TS SLAVONSKI BROD 1',
  '/agriculture': 'AGRICULTURE · UNDER-PANEL · AGROS FLOCK MONITOR',
  '/configurator': 'AGRIVOLTAIC CONFIGURATOR · 30 MWp PHASE 1',
  '/build': 'PROJECT BUILDER · EPC-GRADE · 16 SECTIONS · FROM SCRATCH',
  '/roi': 'FINANCIAL WORKBOOK · MODEL · SENSITIVITY · MONTE CARLO · DEBT · COMPS · EXIT',
  '/scenarios': 'SCENARIOS LAB · A / B / C · SIDE-BY-SIDE',
  '/risk': 'RISK CENTER · CLIMATE · INSURANCE · POLITICAL · FORCE MAJEURE',
  '/timeline': 'TIME MACHINE · YEAR 0 → YEAR 25 · SCRUBBABLE DEAL LIFE',
  '/subsidies': 'FUNDING STACK · FZOEU · NPOO · EU MF',
  '/intel': 'DATA INTELLIGENCE · 12 SOURCES · LIVE',
  '/market': 'MARKET RADAR · 18 PANNONIAN PROJECTS · FZOEU POOL · COMPETITIVE POSITION',
  '/offtake': 'AI OFFTAKE CORRIDOR · PSOC · 6 BUYERS · PANTHEON × COMMODITY × POLICY',
  '/one-pager': 'ONE-PAGER · PRINT-READY LEAVE-BEHIND · A4 · PDF + PNG EXPORT',
  '/thesis': 'INVESTMENT THESIS · PRE-PRESS',
};

export function App() {
  const location = useLocation();
  const isDealRoom = location.pathname.startsWith('/deal-room');

  const breadcrumb = routeBreadcrumbs[location.pathname] ?? (isDealRoom ? 'DEAL ROOM · PERSONALIZED · READ-ONLY' : '');

  const [tone, setTone] = useState<ToneState>(() => toneNow());

  // Recompute every 3 minutes — smooth, zero perf cost
  useEffect(() => {
    const update = () => {
      const t = toneNow();
      setTone(t);
      const root = document.documentElement;
      root.style.setProperty('--tone-warmth', t.warmth.toFixed(3));
      root.style.setProperty('--tone-alpha', t.alpha.toFixed(4));
      root.style.setProperty('--tone-hue', t.hue.toFixed(1));
    };
    update();
    const id = setInterval(update, 3 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Shell
      statusBar={
        <StatusBar
          wordmark="panonica"
          breadcrumb={breadcrumb}
          coordinates="45.1348°N 18.4130°E"
          rightSlot={
            <div className="flex items-center gap-3">
              <DemoProgress />
              <LanguageToggle />
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border-bright bg-surface/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-pulse hover:text-pulse"
                title="Open command palette"
              >
                <CommandIcon className="h-2.5 w-2.5" strokeWidth={1.8} />
                <span>K</span>
              </button>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                <Sparkles className="h-3 w-3 text-sun" strokeWidth={1.8} /> pannonian solar intel
              </span>
            </div>
          }
        />
      }
      sideNav={isDealRoom ? null : <SideNav items={navItems} footer={<PanonicaFooter />} />}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-full"
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/context" replace />} />
            <Route path="/context" element={<ErrorBoundary label="Context"><ContextRoute /></ErrorBoundary>} />
            <Route path="/corridor" element={<ErrorBoundary label="Corridor"><CorridorRoute /></ErrorBoundary>} />
            <Route path="/land" element={<ErrorBoundary label="Land"><LandRoute /></ErrorBoundary>} />
            <Route path="/solar" element={<ErrorBoundary label="Solar"><SolarRoute /></ErrorBoundary>} />
            <Route path="/grid" element={<ErrorBoundary label="Grid"><GridRoute /></ErrorBoundary>} />
            <Route path="/agriculture" element={<ErrorBoundary label="Agriculture"><AgricultureRoute /></ErrorBoundary>} />
            <Route path="/configurator" element={<ErrorBoundary label="Configurator"><ConfiguratorRoute /></ErrorBoundary>} />
            <Route path="/build" element={<ErrorBoundary label="Project Builder"><BuildRoute /></ErrorBoundary>} />
            <Route path="/roi" element={<ErrorBoundary label="Finance"><RoiRoute /></ErrorBoundary>} />
            <Route path="/finance" element={<ErrorBoundary label="Finance"><RoiRoute /></ErrorBoundary>} />
            <Route path="/scenarios" element={<ErrorBoundary label="Scenarios Lab"><ScenariosRoute /></ErrorBoundary>} />
            <Route path="/risk" element={<ErrorBoundary label="Risk Center"><RiskRoute /></ErrorBoundary>} />
            <Route path="/timeline" element={<ErrorBoundary label="Time Machine"><TimelineRoute /></ErrorBoundary>} />
            <Route path="/deal-room/:encoded" element={<ErrorBoundary label="Deal Room"><DealRoomRoute /></ErrorBoundary>} />
            <Route path="/subsidies" element={<ErrorBoundary label="Subsidies"><SubsidiesRoute /></ErrorBoundary>} />
            <Route path="/intel" element={<ErrorBoundary label="Intel"><IntelRoute /></ErrorBoundary>} />
            <Route path="/market" element={<ErrorBoundary label="Market Radar"><MarketRadarRoute /></ErrorBoundary>} />
            <Route path="/offtake" element={<ErrorBoundary label="AI Offtake Corridor"><OfftakeRoute /></ErrorBoundary>} />
            <Route path="/one-pager" element={<ErrorBoundary label="One-Pager"><OnePagerRoute /></ErrorBoundary>} />
            <Route path="/thesis" element={<ErrorBoundary label="Thesis"><ThesisRoute /></ErrorBoundary>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Time-of-day atmospheric tone · subtle overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] mix-blend-soft-light transition-[background] duration-[3000ms]"
        style={{
          background: `radial-gradient(ellipse 120% 80% at 50% 20%, hsla(${tone.hue}, 70%, 55%, ${tone.alpha}), transparent 70%)`,
        }}
      />

      {/* Global overlays — mount once, triggered from anywhere */}
      <CommandPalette />
      <ErrorBoundary label="AI Assist" scope="overlay"><AiAssist /></ErrorBoundary>
      <ErrorBoundary label="Speaker Mode" scope="overlay"><SpeakerMode /></ErrorBoundary>
      <ErrorBoundary label="Mission Control" scope="overlay"><MissionControl /></ErrorBoundary>
      <ErrorBoundary label="Guided Tour" scope="overlay"><GuidedTour /></ErrorBoundary>
      <ErrorBoundary label="Negotiation" scope="overlay"><NegotiationMode /></ErrorBoundary>
      <ErrorBoundary label="Deal Room share" scope="overlay"><DealRoomShareModal /></ErrorBoundary>
    </Shell>
  );
}

function PanonicaFooter() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-agri shadow-glow-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Paladina Investments
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
        session · live · demo
      </span>
      <span className="mt-1 flex items-center gap-1 font-mono text-[9px] text-text-muted">
        <Zap className="h-2.5 w-2.5" strokeWidth={2} /> panonica v0.1.0
      </span>
    </div>
  );
}
