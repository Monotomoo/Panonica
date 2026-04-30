/**
 * Global configurator state — single source of truth for every Panonica
 * screen that reads the current configuration (Configurator, Scenarios Lab,
 * AI Assist, Sensitivity Tornado, DNA glyph, Thesis, Finance).
 *
 * Architecture:
 *   - Local UI concerns stay in component state
 *   - "Live configuration" (the thing the user is tweaking right now) lives here
 *   - Scenarios Lab (A/B/C snapshots) lives in `scenariosStore.ts`
 */

import { create } from 'zustand';
import { configs, type ConfigKey } from '@/mock/configs';

export type Tracking = 'fixed' | '1-axis' | '2-axis';
export type UnderPanel = 'none' | 'sheep' | 'soy' | 'herbs';
export type BatteryChem = 'lfp' | 'nmc' | 'flow';

export interface ConfigState {
  activeScenario: ConfigKey;
  capacityMW: number;
  panelHeight: number;
  rowSpacing: number;
  tracking: Tracking;
  battery: number;
  underPanel: UnderPanel;
  panelId: string;
  inverterId: string;
  dcAcRatio: number;
  batteryChem: BatteryChem;
  mvKv: number;
  gcr: number;
  fenceHeightM: number;
  cctvCount: number;
}

export interface ConfigStore extends ConfigState {
  setScenario: (k: ConfigKey) => void;
  set: <K extends keyof ConfigState>(k: K, v: ConfigState[K]) => void;
  reset: () => void;
  snapshot: () => ConfigState;
  hydrate: (s: Partial<ConfigState>) => void;
}

export const defaultConfigState: ConfigState = {
  activeScenario: 'agri-sheep',
  capacityMW: configs['agri-sheep'].installedMW,
  panelHeight: configs['agri-sheep'].panelHeight,
  rowSpacing: configs['agri-sheep'].rowSpacing,
  tracking: configs['agri-sheep'].tracking,
  battery: configs['agri-sheep'].battery,
  underPanel: configs['agri-sheep'].underPanel,
  panelId: 'jinko-tn620',
  inverterId: 'sma-stp110',
  dcAcRatio: 1.25,
  batteryChem: 'lfp',
  mvKv: 35,
  gcr: 0.38,
  fenceHeightM: 2.4,
  cctvCount: 10,
};

export const useConfigStore = create<ConfigStore>((set, get) => ({
  ...defaultConfigState,

  setScenario: (k) => {
    const s = configs[k];
    set({
      activeScenario: k,
      capacityMW: s.installedMW,
      panelHeight: s.panelHeight,
      rowSpacing: s.rowSpacing,
      tracking: s.tracking,
      battery: s.battery,
      underPanel: s.underPanel,
    });
  },

  set: (k, v) => set({ [k]: v } as Partial<ConfigState>),

  reset: () => set(defaultConfigState),

  snapshot: () => {
    const s = get();
    return {
      activeScenario: s.activeScenario,
      capacityMW: s.capacityMW,
      panelHeight: s.panelHeight,
      rowSpacing: s.rowSpacing,
      tracking: s.tracking,
      battery: s.battery,
      underPanel: s.underPanel,
      panelId: s.panelId,
      inverterId: s.inverterId,
      dcAcRatio: s.dcAcRatio,
      batteryChem: s.batteryChem,
      mvKv: s.mvKv,
      gcr: s.gcr,
      fenceHeightM: s.fenceHeightM,
      cctvCount: s.cctvCount,
    };
  },

  hydrate: (partial) => set(partial as Partial<ConfigState>),
}));

/**
 * Deterministic hash of the full configuration, used by the DNA glyph so
 * "same config = same glyph" across re-renders and sessions.
 */
export function configHash(s: ConfigState): string {
  const parts = [
    s.activeScenario,
    s.capacityMW.toFixed(1),
    s.panelHeight.toFixed(1),
    s.rowSpacing.toFixed(1),
    s.tracking,
    s.battery,
    s.underPanel,
    s.panelId,
    s.inverterId,
    s.dcAcRatio.toFixed(2),
    s.batteryChem,
    s.mvKv,
    s.gcr.toFixed(2),
    s.fenceHeightM.toFixed(1),
    s.cctvCount,
  ];
  const str = parts.join('|');
  // FNV-1a 32-bit hash, rendered as hex
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
