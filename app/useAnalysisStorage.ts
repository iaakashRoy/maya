"use client";
import { useSyncExternalStore } from "react";
export const analysisEvent = "tanjnx:analysis-change";
const subscribe = (notify: () => void) => { window.addEventListener("storage", notify); window.addEventListener(analysisEvent, notify); window.addEventListener("focus", notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener(analysisEvent, notify); window.removeEventListener("focus", notify); }; };
export function useAnalysisStorage(key: string) {
  return useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(key); } catch { return null; } }, () => null);
}
export function writeAnalysisStorage(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event(analysisEvent)); }
