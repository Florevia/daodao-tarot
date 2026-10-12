const PACIFIC = "America/Los_Angeles";

/** Calendar day in Pacific time, `YYYY-MM-DD`. Gemini's free quota resets at this midnight. */
export function pacificDayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PACIFIC,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** The next Pacific midnight strictly after `now`. */
export function nextPacificMidnight(now = new Date()): Date {
  const key = pacificDayKey(now);
  let lo = now.getTime();
  let hi = lo + 26 * 60 * 60 * 1000;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (pacificDayKey(new Date(mid)) === key) lo = mid;
    else hi = mid;
  }
  return new Date(hi);
}
