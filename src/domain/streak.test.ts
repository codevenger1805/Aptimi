import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";
import type { FocusSession } from "./types";

function session(day: string, status: FocusSession["status"] = "completed"): FocusSession {
  return {
    id: day + status + Math.random(),
    profileId: "p",
    startedAt: `${day}T10:00:00.000Z`,
    completedAt: `${day}T10:25:00.000Z`,
    durationSeconds: 1500,
    plannedSeconds: 1500,
    status,
  };
}

describe("computeStreak", () => {
  it("counts one streak day for multiple sessions", () => {
    const result = computeStreak(
      [session("2026-04-10"), session("2026-04-10")],
      "UTC",
      "2026-04-10T18:00:00.000Z",
    );
    expect(result.current).toBe(1);
    expect(result.todayHasSession).toBe(true);
  });

  it("does not count abandoned sessions", () => {
    const result = computeStreak(
      [session("2026-04-10", "abandoned")],
      "UTC",
      "2026-04-10T18:00:00.000Z",
    );
    expect(result.current).toBe(0);
  });

  it("breaks after a missed local day", () => {
    const result = computeStreak(
      [session("2026-04-07"), session("2026-04-08")],
      "UTC",
      "2026-04-10T18:00:00.000Z",
    );
    expect(result.current).toBe(0);
    expect(result.longest).toBe(2);
  });

  it("keeps current streak if last session was yesterday", () => {
    const result = computeStreak(
      [session("2026-04-09")],
      "UTC",
      "2026-04-10T09:00:00.000Z",
    );
    expect(result.current).toBe(1);
  });
});
