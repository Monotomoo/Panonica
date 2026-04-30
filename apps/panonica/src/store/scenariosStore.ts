/**
 * Scenarios Lab — A/B/C snapshots.
 *
 * Persists to sessionStorage so Tomo can close the laptop lid and reopen
 * without losing his stacked scenarios during the demo.
 */

import { create } from 'zustand';
import type { ConfigState } from './configStore';

export type ScenarioSlot = 'A' | 'B' | 'C';

export interface ScenarioEntry {
  slot: ScenarioSlot;
  name: string;
  createdAt: string;
  config: ConfigState;
}

interface ScenariosStore {
  scenarios: Record<ScenarioSlot, ScenarioEntry | null>;
  save: (slot: ScenarioSlot, name: string, config: ConfigState) => void;
  remove: (slot: ScenarioSlot) => void;
  rename: (slot: ScenarioSlot, name: string) => void;
  clearAll: () => void;
  load: () => void;
  exportJSON: () => string;
  importJSON: (raw: string) => { ok: boolean; error?: string; count?: number };
}

const STORAGE_KEY = 'panonica.scenarios.v1';

function readStorage(): Record<ScenarioSlot, ScenarioEntry | null> {
  if (typeof window === 'undefined') return { A: null, B: null, C: null };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { A: null, B: null, C: null };
    const parsed = JSON.parse(raw);
    return { A: parsed.A ?? null, B: parsed.B ?? null, C: parsed.C ?? null };
  } catch {
    return { A: null, B: null, C: null };
  }
}

function writeStorage(scenarios: Record<ScenarioSlot, ScenarioEntry | null>) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    /* sessionStorage full or disabled — demo is fine, just in-memory */
  }
}

export const useScenariosStore = create<ScenariosStore>((set, get) => ({
  scenarios: readStorage(),

  save: (slot, name, config) => {
    const next = {
      ...get().scenarios,
      [slot]: { slot, name, createdAt: new Date().toISOString(), config },
    };
    writeStorage(next);
    set({ scenarios: next });
  },

  remove: (slot) => {
    const next = { ...get().scenarios, [slot]: null };
    writeStorage(next);
    set({ scenarios: next });
  },

  rename: (slot, name) => {
    const current = get().scenarios[slot];
    if (!current) return;
    const next = { ...get().scenarios, [slot]: { ...current, name } };
    writeStorage(next);
    set({ scenarios: next });
  },

  clearAll: () => {
    writeStorage({ A: null, B: null, C: null });
    set({ scenarios: { A: null, B: null, C: null } });
  },

  load: () => set({ scenarios: readStorage() }),

  exportJSON: () => {
    const s = get().scenarios;
    const payload = {
      v: 1,
      createdAt: new Date().toISOString(),
      app: 'panonica',
      scenarios: s,
    };
    return JSON.stringify(payload, null, 2);
  },

  importJSON: (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'Invalid JSON — not an object' };
      if (parsed.v !== 1) return { ok: false, error: 'Unsupported schema version' };
      if (!parsed.scenarios || typeof parsed.scenarios !== 'object') return { ok: false, error: 'Missing scenarios field' };
      const next: Record<ScenarioSlot, ScenarioEntry | null> = {
        A: parsed.scenarios.A ?? null,
        B: parsed.scenarios.B ?? null,
        C: parsed.scenarios.C ?? null,
      };
      const count = (Object.values(next).filter(Boolean) as ScenarioEntry[]).length;
      writeStorage(next);
      set({ scenarios: next });
      return { ok: true, count };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
}));

/** Encode scenarios JSON for URL hash · base64url, URL-safe */
export function encodeForUrl(json: string): string {
  try {
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeFromUrl(encoded: string): string | null {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return null;
  }
}
