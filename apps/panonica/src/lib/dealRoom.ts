/**
 * Deal Room state encoding / decoding.
 *
 * Encodes project + config + scenarios into a compact base64url hash
 * for URL-shareable state. Decodes on Deal Room page load and hydrates
 * all three stores. Works offline · no backend.
 *
 * Pipeline: JSON → pako gzip → base64url → URL hash
 * This cuts the ~11 KB raw JSON to ~2.5 KB · fits in a QR code.
 */

import { deflate, inflate } from 'pako';
import type { ProjectState } from '@/store/projectStore';
import type { ConfigState } from '@/store/configStore';
import type { ScenarioEntry, ScenarioSlot } from '@/store/scenariosStore';

export interface DealRoomPayload {
  v: 1;
  createdAt: string;
  tenant: string;
  project: ProjectState;
  config: ConfigState;
  scenarios: Record<ScenarioSlot, ScenarioEntry | null>;
  // Optional personalization
  to?: string;          // "Ivan Paladina"
  from?: string;        // "Panonica · Tomo"
  message?: string;     // free-text 1-liner
}

/** base64url · URL-safe · no padding */
export function base64UrlEncode(input: string): string {
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(encoded: string): string | null {
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return null;
  }
}

/** Encode: JSON → gzip → base64url. Prefixes 'v1.' for format detection. */
export function encodePayload(payload: DealRoomPayload): string {
  const json = JSON.stringify(payload);
  const compressed = deflate(json, { level: 9 });
  // Convert Uint8Array → binary string → base64
  let binary = '';
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return 'v1.' + b64;
}

export function decodePayload(hash: string): DealRoomPayload | null {
  try {
    let data = hash;
    let isCompressed = false;
    if (data.startsWith('v1.')) {
      data = data.slice(3);
      isCompressed = true;
    }
    if (isCompressed) {
      let b64 = data.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4 !== 0) b64 += '=';
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const json = inflate(bytes, { to: 'string' });
      const parsed = JSON.parse(json);
      if (parsed.v !== 1) return null;
      return parsed as DealRoomPayload;
    }
    // Legacy uncompressed path
    const json = base64UrlDecode(data);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed.v !== 1) return null;
    return parsed as DealRoomPayload;
  } catch {
    return null;
  }
}

/** Build a shareable URL given encoded payload */
export function buildDealRoomUrl(encoded: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/deal-room/${encoded}`;
}
