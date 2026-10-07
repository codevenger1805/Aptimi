import { describe, expect, it } from "vitest";
import { awardIfNew, lifetimePoints, levelFromPoints, voidAward } from "./rewards";
import { POINTS } from "./types";

describe("rewards", () => {
  it("does not double-award the same completion", () => {
    const first = awardIfNew({
      ledger: [],
      profileId: "p",
      sourceType: "roadmapTask",
      sourceId: "t1",
      points: POINTS.roadmapTask,
      nowIso: "2026-01-01T00:00:00.000Z",
      id: "1",
    });
    const second = awardIfNew({
      ledger: first.ledger,
      profileId: "p",
      sourceType: "roadmapTask",
      sourceId: "t1",
      points: POINTS.roadmapTask,
      nowIso: "2026-01-01T00:01:00.000Z",
      id: "2",
    });
    expect(second.awarded).toBeNull();
    expect(lifetimePoints(second.ledger)).toBe(10);
  });

  it("records a visible void instead of deleting points", () => {
    const first = awardIfNew({
      ledger: [],
      profileId: "p",
      sourceType: "roadmapTask",
      sourceId: "t1",
      points: 10,
      nowIso: "2026-01-01T00:00:00.000Z",
      id: "1",
    });
    const voided = voidAward({
      ledger: first.ledger,
      profileId: "p",
      sourceType: "roadmapTask",
      sourceId: "t1",
      points: 10,
      nowIso: "2026-01-01T00:02:00.000Z",
      id: "3",
    });
    expect(voided.entry?.points).toBe(-10);
    expect(lifetimePoints(voided.ledger)).toBe(0);
    expect(levelFromPoints(0).level).toBe(1);
    expect(levelFromPoints(100).level).toBe(2);
  });
});
