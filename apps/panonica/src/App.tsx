import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import {
  Activity,
  Coins,
  FileBarChart2,
  LandPlot,
  Plug,
  Settings2,
  Sparkles,
  SunMedium,
  Zap,
} from 'lucide-react';
import { Shell, SideNav, StatusBar, type SideNavItem } from '@paladian/ui';

import { HeroRoute } from './routes/hero';
import { LandRoute } from './routes/land';
import { SolarRoute } from './routes/solar';
import { GridRoute } from './routes/grid';
import { ConfiguratorRoute } from './routes/configurator';
import { RoiRoute } from './routes/roi';
import { SubsidiesRoute } from './routes/subsidies';
import { ThesisRoute } from './routes/thesis';

const navItems: SideNavItem[] = [
  { to: '/land', label: 'Land', icon: LandPlot },
  { to: '/solar', label: 'Solar', icon: SunMedium },
  { to: '/grid', label: 'Grid', icon: Plug },
  { to: '/configurator', label: 'Configure', icon: Settings2 },
  { to: '/roi', label: 'ROI', icon: Activity },
  { to: '/subsidies', label: 'Subsidies', icon: Coins },
  { to: '/thesis', label: 'Thesis', icon: FileBarChart2 },
];

const routeBreadcrumbs: Record<string, string> = {
  '/': 'INTRO · HERO',
  '/land': 'BERAVCI · OPĆINA VELIKA KOPANICA · BRODSKO-POSAVSKA ŽUPANIJA',
  '/solar': 'SOLAR ATLAS · BERAVCI 45.2074°N 18.4393°E',
  '/grid': 'GRID CAPACITY · TS SLAVONSKI BROD 1',
  '/configurator': 'AGRIVOLTAIC CONFIGURATOR · 38 MWp',
  '/roi': '20-YEAR FINANCIAL MODEL',
  '/subsidies': 'FUNDING STACK · FZOEU · NPOO · EU MF',
  '/thesis': 'INVESTMENT THESIS · PRE-PRESS',
};

export function App() {
  const location = useLocation();
  const isHero = location.pathname === '/';

  const breadcrumb = routeBreadcrumbs[location.pathname] ?? '';

  return (
    <Shell
      statusBar={
        <StatusBar
          wordmark="panonica"
          breadcrumb={breadcrumb}
          coordinates="45.2074°N 18.4393°E"
          rightSlot={
            <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted md:flex">
              <Sparkles className="h-3 w-3 text-sun" strokeWidth={1.8} /> pannonian solar intel
            </span>
          }
        />
      }
      sideNav={isHero ? null : <SideNav items={navItems} footer={<PanonicaFooter />} />}
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
            <Route path="/" element={<HeroRoute />} />
            <Route path="/land" element={<LandRoute />} />
            <Route path="/solar" element={<SolarRoute />} />
            <Route path="/grid" element={<GridRoute />} />
            <Route path="/configurator" element={<ConfiguratorRoute />} />
            <Route path="/roi" element={<RoiRoute />} />
            <Route path="/subsidies" element={<SubsidiesRoute />} />
            <Route path="/thesis" element={<ThesisRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
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
