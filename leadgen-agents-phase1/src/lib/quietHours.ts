import { config } from "./config.js";

/** Minutes since midnight for "HH:MM". */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Pure: is `minutesOfDay` (0..1439, local time) within the quiet window?
 * Handles windows that wrap past midnight (e.g. 20:00 -> 08:00).
 */
export function inQuietWindow(minutesOfDay: number, start: string, end: string): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === e) return false;
  return s < e ? minutesOfDay >= s && minutesOfDay < e : minutesOfDay >= s || minutesOfDay < e;
}

/** Convenience wrapper using configured timezone + window. */
export function isQuietHoursNow(now = new Date()): boolean {
  const local = new Date(now.toLocaleString("en-US", { timeZone: config.DEFAULT_TIMEZONE }));
  const minutes = local.getHours() * 60 + local.getMinutes();
  return inQuietWindow(minutes, config.QUIET_HOURS_START, config.QUIET_HOURS_END);
}
