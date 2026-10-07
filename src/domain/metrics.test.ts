import { describe, expect, it } from "vitest";
import {
  applicationsSubmitted,
  interviewRate,
  milestoneCompletionRate,
  weeklyTaskCompletionRate,
} from "./metrics";
import type { Milestone, Opportunity, OpportunityStatusEvent, RoadmapPhase, RoadmapTask } from "./types";

describe("metrics", () => {
  it("does not treat Saved as submitted", () => {
    const opps: Opportunity[] = [
      {
        id: "1",
        profileId: "p",
        company: "A",
        role: "Intern",
        status: "Saved",
        savedAt: "t",
        createdAt: "t",
        updatedAt: "t",
      },
      {
        id: "2",
        profileId: "p",
        company: "B",
        role: "Intern",
        status: "Applied",
        savedAt: "t",
        appliedAt: "t",
        createdAt: "t",
        updatedAt: "t",
      },
    ];
    expect(applicationsSubmitted(opps)).toBe(1);
  });

  it("handles zero interview denominator", () => {
    const result = interviewRate([], []);
    expect(result.denominator).toBe(0);
    expect(result.label).toMatch(/No applications submitted/);
  });

  it("counts interview after later rejection via events", () => {
    const opps: Opportunity[] = [
      {
        id: "1",
        profileId: "p",
        company: "A",
        role: "Intern",
        status: "Rejected",
        savedAt: "t",
        appliedAt: "t",
        createdAt: "t",
        updatedAt: "t",
      },
    ];
    const events: OpportunityStatusEvent[] = [
      { id: "e", opportunityId: "1", toStatus: "Interview", changedAt: "t" },
      { id: "e2", opportunityId: "1", fromStatus: "Interview", toStatus: "Rejected", changedAt: "t2" },
    ];
    const result = interviewRate(opps, events);
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(1);
  });

  it("milestone rate uses empty copy when none planned", () => {
    const result = milestoneCompletionRate([], [], { start: "2026-04-01", end: "2026-04-07" });
    expect(result.label).toMatch(/No milestones planned/);
  });

  it("weekly tasks ignore personal todos by only receiving roadmap tasks", () => {
    const tasks: RoadmapTask[] = [
      {
        id: "1",
        profileId: "p",
        title: "A",
        order: 0,
        priority: "Medium",
        dueAt: "2026-04-06T10:00:00.000Z",
        status: "completed",
        createdAt: "t",
        updatedAt: "t",
      },
    ];
    const result = weeklyTaskCompletionRate(tasks, { start: "2026-04-06", end: "2026-04-12" });
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(1);
  });

  it("includes milestones without dates when phase overlaps", () => {
    const phases: RoadmapPhase[] = [
      {
        id: "ph",
        profileId: "p",
        title: "P",
        order: 0,
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
    ];
    const milestones: Milestone[] = [
      {
        id: "m",
        profileId: "p",
        phaseId: "ph",
        title: "M",
        relatedSkillIds: [],
        order: 0,
        status: "completed",
        isCustom: false,
        createdAt: "t",
        updatedAt: "t",
      },
    ];
    const result = milestoneCompletionRate(milestones, phases, {
      start: "2026-04-01",
      end: "2026-04-07",
    });
    expect(result.denominator).toBe(1);
    expect(result.numerator).toBe(1);
  });
});
