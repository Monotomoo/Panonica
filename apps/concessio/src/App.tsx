import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { Shell, StatusBar } from '@paladian/ui';

import { HomeRoute } from './routes/home';
import { SearchRoute } from './routes/search';
import { DealRoute } from './routes/deal';
import { EntityRoute } from './routes/entity';

export function App() {
  const location = useLocation();
  const breadcrumb =
    location.pathname === '/'
      ? 'CONCESSIO // CROATIA & SEE'
      : location.pathname.startsWith('/deal')
      ? 'DEAL DOSSIER'
      : location.pathname.startsWith('/entity')
      ? 'ENTITY PROFILE'
      : location.pathname.startsWith('/search')
      ? 'SEARCH RESULTS'
      : '';

  return (
    <Shell
      statusBar={
        <StatusBar
          wordmark="concessio"
          breadcrumb={breadcrumb}
          rightSlot={
            <div className="hidden items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted md:flex">
              <Link to="/" className="hover:text-text-primary">
                MAP
              </Link>
              <Link to="/" className="hover:text-text-primary">
                FUNDS
              </Link>
              <Link to="/" className="hover:text-text-primary">
                SPATIAL
              </Link>
              <span className="text-text-muted/60">API</span>
            </div>
          }
        />
      }
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
            <Route path="/" element={<HomeRoute />} />
            <Route path="/search" element={<SearchRoute />} />
            <Route path="/deal/:slug" element={<DealRoute />} />
            <Route path="/entity/:slug" element={<EntityRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
