import { describe, expect, it } from "vitest";
import { insertAt, moveItem, reindexOrders } from "./ordering";
import { generateRoadmap, insertMilestoneBetween } from "./roadmapGenerator";
import type { Profile } from "./types";

const profile: Profile = {
  id: "p",
  createdAt: "t",
  updatedAt: "t",
  timezone: "UTC",
  targetRole: "Product Manager",
  rolePresetId: "product_manager",
  educationLevel: "undergrad_y3",
  targetDate: "2026-10-01",
};

describe("ordering and roadmap", () => {
  it("inserts and reindexes without gaps", () => {
    const items = insertAt(
      [
        { id: "a", order: 0 },
        { id: "c", order: 1 },
      ],
      { id: "b", order: 99 },
      1,
    );
    expect(items.map((i) => i.id)).toEqual(["a", "b", "c"]);
    expect(items.map((i) => i.order)).toEqual([0, 1, 2]);
  });

  it("moves items and keeps contiguous order", () => {
    const moved = moveItem(reindexOrders([{ id: "a", order: 0 }, { id: "b", order: 1 }]), "b", -1);
    expect(moved[0].id).toBe("b");
  });

  it("scales roadmap dates to the user timeline", () => {
    let n = 0;
    const roadmap = generateRoadmap({
      profile,
      skills: [],
      now: new Date("2026-04-01T00:00:00Z"),
      idFactory: () => `id-${n++}`,
    });
    expect(roadmap.phases.length).toBe(5);
    expect(roadmap.phases[0].startDate).toBe("2026-04-01");
    expect(roadmap.phases.at(-1)?.endDate).toBeDefined();
    const lastEnd = roadmap.phases.at(-1)!.endDate!;
    expect(lastEnd >= "2026-09-01").toBe(true);
  });

  it("inserts a custom milestone between items", () => {
    const generated = generateRoadmap({
      profile,
      skills: [],
      now: new Date("2026-04-01T00:00:00Z"),
      idFactory: () => crypto.randomUUID(),
    });
    const phaseId = generated.phases[0].id;
    const list = generated.milestones.filter((m) => m.phaseId === phaseId);
    const custom = {
      ...list[0],
      id: "custom",
      title: "Custom",
      isCustom: true,
      order: 0,
    };
    const next = insertMilestoneBetween(list, custom, 0);
    expect(next[1].title).toBe("Custom");
    expect(next.map((m) => m.order)).toEqual(next.map((_, i) => i));
  });
});
