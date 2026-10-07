import type { FocusSession } from "./types";

function localDateKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function addLocalDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function computeStreak(
  sessions: FocusSession[],
  timeZone: string,
  nowIso: string,
): {
  current: number;
  longest: number;
  todayHasSession: boolean;
  dates: string[];
} {
  const dates = [
    ...new Set(
      sessions
        .filter((s) => s.status === "completed")
        .map((s) => localDateKey(s.completedAt ?? s.startedAt, timeZone)),
    ),
  ].sort();
  const today = localDateKey(nowIso, timeZone);
  const yesterday = addLocalDays(today, -1);
  const todayHasSession = dates.includes(today);
  const set = new Set(dates);

  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of dates) {
    if (prev && addLocalDays(prev, 1) === day) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    prev = day;
  }

  let current = 0;
  if (todayHasSession || set.has(yesterday)) {
    let cursor = todayHasSession ? today : yesterday;
    while (set.has(cursor)) {
      current += 1;
      cursor = addLocalDays(cursor, -1);
    }
  }

  return { current, longest, todayHasSession, dates };
}

export function focusHours(sessions: FocusSession[]): number {
  const seconds = sessions
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  return Math.round((seconds / 3600) * 10) / 10;
}

export function sessionsCompleted(sessions: FocusSession[]): number {
  return sessions.filter((s) => s.status === "completed").length;
}
