import { describe, expect, it } from "vitest";
import {
  cancelReminder,
  reminderAfterClock,
  rescheduleReminder,
} from "./reminders";

describe("reminders", () => {
  const base = {
    id: "r",
    profileId: "p",
    personalTodoId: "t",
    remindAt: "2026-04-10T12:00:00.000Z",
    state: "scheduled" as const,
  };

  it("moves scheduled reminders to due", () => {
    const next = reminderAfterClock(base, "2026-04-10T12:00:01.000Z");
    expect(next.state).toBe("due");
  });

  it("does not revive canceled reminders", () => {
    const next = reminderAfterClock(cancelReminder(base), "2026-04-11T00:00:00.000Z");
    expect(next.state).toBe("canceled");
  });

  it("reschedule resets to scheduled", () => {
    const next = rescheduleReminder(
      { ...base, state: "shown", deliveredAt: "t" },
      "2026-04-12T12:00:00.000Z",
    );
    expect(next.state).toBe("scheduled");
    expect(next.deliveredAt).toBeUndefined();
  });
});
