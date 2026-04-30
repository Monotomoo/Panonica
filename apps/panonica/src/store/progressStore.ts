/**
 * Demo progress tracker. Records which routes have been visited in this
 * session and how long was spent on each. Shown as a compact dot row in
 * the StatusBar and as a detailed cue in Speaker Mode.
 *
 * Persisted to sessionStorage so page reloads don't wipe the trail.
 */

import { create } from 'zustand';

export const DEMO_ROUTES = [
  { path: '/', label: 'Hero' },
  { path: '/context', label: 'Context' },
  { path: '/corridor', label: 'Corridor' },
  { path: '/land', label: 'Land' },
  { path: '/solar', label: 'Solar' },
  { path: '/grid', label: 'Grid' },
  { path: '/agriculture', label: 'Agriculture' },
  { path: '/configurator', label: 'Configure' },
  { path: '/build', label: 'Builder' },
  { path: '/roi', label: 'Finance' },
  { path: '/scenarios', label: 'Scenarios' },
  { path: '/risk', label: 'Risk' },
  { path: '/timeline', label: 'Timeline' },
  { path: '/subsidies', label: 'Subsidies' },
  { path: '/intel', label: 'Intel' },
  { path: '/thesis', label: 'Thesis' },
] as const;

export interface RouteVisit {
  path: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalMs: number;
  visits: number;
}

interface ProgressStore {
  visits: Record<string, RouteVisit>;
  currentPath: string | null;
  currentEnteredAt: number | null;
  enter: (path: string) => void;
  leave: () => void;
  reset: () => void;
}

const STORAGE_KEY = 'panonica.progress.v1';

function readStorage(): Record<string, RouteVisit> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStorage(v: Record<string, RouteVisit>) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  visits: readStorage(),
  currentPath: null,
  currentEnteredAt: null,

  enter: (path: string) => {
    const { currentPath, currentEnteredAt, visits } = get();
    const now = Date.now();
    const nowIso = new Date().toISOString();

    // Close previous visit
    const next: Record<string, RouteVisit> = { ...visits };
    if (currentPath && currentEnteredAt && currentPath !== path) {
      const prev = next[currentPath];
      if (prev) {
        next[currentPath] = {
          ...prev,
          lastSeenAt: nowIso,
          totalMs: prev.totalMs + (now - currentEnteredAt),
        };
      }
    }

    // Open new
    const existing = next[path];
    next[path] = existing
      ? { ...existing, lastSeenAt: nowIso, visits: existing.visits + (currentPath !== path ? 1 : 0) }
      : { path, firstSeenAt: nowIso, lastSeenAt: nowIso, totalMs: 0, visits: 1 };

    writeStorage(next);
    set({ visits: next, currentPath: path, currentEnteredAt: now });
  },

  leave: () => {
    const { currentPath, currentEnteredAt, visits } = get();
    if (!currentPath || !currentEnteredAt) return;
    const now = Date.now();
    const next: Record<string, RouteVisit> = { ...visits };
    const prev = next[currentPath];
    if (prev) {
      next[currentPath] = { ...prev, totalMs: prev.totalMs + (now - currentEnteredAt), lastSeenAt: new Date().toISOString() };
      writeStorage(next);
      set({ visits: next, currentPath: null, currentEnteredAt: null });
    }
  },

  reset: () => {
    writeStorage({});
    set({ visits: {}, currentPath: null, currentEnteredAt: null });
  },
}));
