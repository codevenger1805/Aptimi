import { describe, expect, it } from "vitest";
import { calculateReadiness } from "./readiness";
import type { Skill } from "../domain/types";

function skill(partial: Partial<Skill> & { name: string }): Skill {
  return {
    id: partial.id ?? partial.name,
    profileId: "p",
    currentLevel: null,
    targetLevel: 4,
    weight: 1,
    ...partial,
  };
}

describe("calculateReadiness", () => {
  it("returns null when no skills are rated", () => {
    const result = calculateReadiness([skill({ name: "SQL" })]);
    expect(result.score).toBeNull();
    expect(result.explanation).toMatch(/Rate skills/);
  });

  it("computes weighted current/target average", () => {
    const result = calculateReadiness([
      skill({ name: "A", currentLevel: 2, targetLevel: 4, weight: 1 }),
      skill({ name: "B", currentLevel: 4, targetLevel: 4, weight: 1 }),
    ]);
    expect(result.score).toBe(75);
  });

  it("excludes skipped skills and respects weights", () => {
    const result = calculateReadiness([
      skill({ name: "skip" }),
      skill({ name: "A", currentLevel: 4, targetLevel: 4, weight: 3 }),
    ]);
    expect(result.assessedCount).toBe(1);
    expect(result.score).toBe(100);
  });
});
