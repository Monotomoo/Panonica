/**
 * Language Store — Wave 3 · Ivan-facing bilingual support
 *
 * Minimal zustand slice. Toggles between 'en' (default) and 'hr' (Croatian).
 * Only three screens respect it: Hero / Thesis / Deal Room — the surfaces
 * Ivan is most likely to linger on. Everywhere else stays English because
 * the technical audience is bilingual and English is the industry language.
 */

import { create } from 'zustand';

export type Lang = 'en' | 'hr';

interface LangStore {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'panonica.lang.v1';

function read(): Lang {
  if (typeof window === 'undefined') return 'en';
  const v = window.sessionStorage.getItem(STORAGE_KEY);
  return v === 'hr' ? 'hr' : 'en';
}
function write(l: Lang) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* quota · ignore */
  }
}

export const useLangStore = create<LangStore>((set, get) => ({
  lang: read(),
  setLang: (l) => {
    write(l);
    set({ lang: l });
  },
  toggle: () => {
    const next: Lang = get().lang === 'en' ? 'hr' : 'en';
    write(next);
    set({ lang: next });
  },
}));

/** Inline bilingual helper — `tr('Hello', 'Bok', lang)` → string */
export function tr(en: string, hr: string, lang: Lang): string {
  return lang === 'hr' ? hr : en;
}
