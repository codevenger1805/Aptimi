import { describe, expect, it } from "vitest";
import { analyzeJobDescription } from "./jdAnalysis";
import type { Skill } from "./types";

function skill(name: string, currentLevel: number | null): Skill {
  return {
    id: name,
    profileId: "p",
    name,
    currentLevel,
    targetLevel: 4,
    weight: 1,
  };
}

describe("analyzeJobDescription", () => {
  it("does not invent a score for an empty JD", () => {
    const result = analyzeJobDescription({ jd: "  ", skills: [], notes: [], tasks: [] });
    expect(result.matchPercent).toBeNull();
    expect(result.strongMatches).toEqual([]);
  });

  it("separates strong matches, development gaps, and evidence gaps", () => {
    const result = analyzeJobDescription({
      jd: "We need a product intern with SQL, analytics, product thinking, and stakeholder communication.",
      skills: [
        skill("SQL", 1),
        skill("Analytics", 4),
        skill("Product Thinking", 4),
        skill("Communication", 3),
      ],
      notes: [],
      tasks: [],
    });
    expect(result.requiredTerms).toEqual(
      expect.arrayContaining(["SQL", "Analytics", "Product Thinking", "Communication"]),
    );
    expect(result.strongMatches.map((m) => m.label)).toEqual(
      expect.arrayContaining(["Analytics", "Product Thinking", "Communication"]),
    );
    expect(result.developmentGaps.some((g) => g.label === "SQL")).toBe(true);
    expect(result.evidenceGaps.length).toBeGreaterThan(0);
    expect(result.matchPercent).not.toBeNull();
  });
});
