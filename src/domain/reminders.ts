import type { Reminder, ReminderState } from "./types";

export function reminderAfterClock(
  reminder: Reminder,
  nowIso: string,
): Reminder {
  if (reminder.state === "canceled" || reminder.state === "dismissed") {
    return reminder;
  }
  if (reminder.state === "scheduled" && reminder.remindAt <= nowIso) {
    return { ...reminder, state: "due" };
  }
  return reminder;
}

export function markShown(reminder: Reminder, nowIso: string): Reminder {
  return {
    ...reminder,
    state: "shown",
    deliveredAt: nowIso,
  };
}

export function dismissReminder(reminder: Reminder, nowIso: string): Reminder {
  return { ...reminder, state: "dismissed", dismissedAt: nowIso };
}

export function cancelReminder(reminder: Reminder): Reminder {
  return { ...reminder, state: "canceled" };
}

export function rescheduleReminder(
  reminder: Reminder,
  remindAt: string,
): Reminder {
  return {
    ...reminder,
    remindAt,
    state: "scheduled",
    deliveredAt: undefined,
    dismissedAt: undefined,
  };
}

export function expireIfMissed(
  reminder: Reminder,
  nowIso: string,
  missAfterMs: number,
): Reminder {
  if (reminder.state !== "due" && reminder.state !== "scheduled") return reminder;
  const due = Date.parse(reminder.remindAt);
  if (Date.parse(nowIso) - due > missAfterMs) {
    return { ...reminder, state: "missed" };
  }
  return reminder;
}

export const TERMINAL_REMINDER_STATES: ReminderState[] = [
  "dismissed",
  "canceled",
  "missed",
];
