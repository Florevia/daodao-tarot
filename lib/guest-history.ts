import type { ReadingRecord } from "./reading-record";

export const GUEST_HISTORY_KEY = "daodao-tarot-readings-v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadGuestReadings(): ReadingRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(GUEST_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReadingRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string");
  } catch {
    return [];
  }
}

export function saveGuestReadings(readings: ReadingRecord[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(readings));
}

export function upsertGuestReading(reading: ReadingRecord): ReadingRecord[] {
  const current = loadGuestReadings().filter((item) => item.id !== reading.id);
  const next = [reading, ...current].slice(0, 100);
  saveGuestReadings(next);
  return next;
}

export function deleteGuestReading(id: string): ReadingRecord[] {
  const next = loadGuestReadings().filter((item) => item.id !== id);
  saveGuestReadings(next);
  return next;
}
