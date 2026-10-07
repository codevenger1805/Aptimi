import type { FocusSession, Milestone, Note, Opportunity, RoadmapTask, Skill } from "./types";

export function calculateReadiness(skills: Skill[]): {
  score: number | null;
  assessedCount: number;
  explanation: string;
} {
  const assessed = skills.filter(
    (s) => s.currentLevel != null && s.targetLevel > 0 && s.weight > 0,
  );
  if (assessed.length === 0) {
    return {
      score: null,
      assessedCount: 0,
      explanation:
        "Rate skills to estimate Career Readiness. This is a planning aid, not a hiring prediction.",
    };
  }
  const weightSum = assessed.reduce((sum, s) => sum + s.weight, 0);
  const weighted = assessed.reduce((sum, s) => {
    const ratio = Math.min((s.currentLevel as number) / s.targetLevel, 1);
    return sum + s.weight * ratio;
  }, 0);
  const score = Math.round((100 * weighted) / weightSum);
  return {
    score,
    assessedCount: assessed.length,
    explanation: `Career Readiness is ${score} from ${assessed.length} rated skill${assessed.length === 1 ? "" : "s"} using weighted current ÷ target (capped at 100%). Planning aid only — not a hiring prediction.`,
  };
}

export function skillGap(skill: Skill): number | null {
  if (skill.currentLevel == null) return null;
  return Math.max(skill.targetLevel - skill.currentLevel, 0);
}

export type ReadinessDimensionId =
  | "skillCapability"
  | "practicalEvidence"
  | "executionConsistency"
  | "communication"
  | "analyticalAbility"
  | "interviewReadiness"
  | "careerMaterials"
  | "targetRoleAlignment";

export interface ReadinessDimension {
  id: ReadinessDimensionId;
  label: string;
  score: number | null;
  state: string;
  explanation: string;
  recommendation: string;
}

function namedLevel(skills: Skill[], ...names: string[]): number | null {
  const matches = skills.filter((s) =>
    names.some((n) => s.name.toLowerCase().includes(n.toLowerCase())),
  );
  const rated = matches.filter((s) => s.currentLevel != null);
  if (!rated.length) return null;
  const avg =
    rated.reduce((sum, s) => sum + ((s.currentLevel as number) / s.targetLevel) * 100, 0) /
    rated.length;
  return Math.round(avg);
}

function stateFrom(score: number | null): string {
  if (score == null) return "Not enough information yet";
  if (score >= 80) return "Strong";
  if (score >= 55) return "Developing";
  return "Early";
}

export function calculateReadinessProfile(input: {
  skills: Skill[];
  milestones: Milestone[];
  tasks: RoadmapTask[];
  notes: Note[];
  opportunities: Opportunity[];
  focusSessions: FocusSession[];
}): { overall: ReturnType<typeof calculateReadiness>; dimensions: ReadinessDimension[] } {
  const overall = calculateReadiness(input.skills);
  const completedMs = input.milestones.filter((m) => m.status === "completed");
  const evidence = input.notes.filter((n) => n.kind === "evidence");
  const practical =
    completedMs.length + evidence.length === 0
      ? null
      : Math.min(100, completedMs.length * 12 + evidence.length * 10);
  const completedFocus = input.focusSessions.filter((s) => s.status === "completed");
  const completedTasks = input.tasks.filter((t) => t.status === "completed");
  const execution =
    completedFocus.length + completedTasks.length === 0
      ? null
      : Math.min(100, completedTasks.length * 8 + completedFocus.length * 6);
  const interviewOps = input.opportunities.filter((o) =>
    ["Assessment", "Interview", "Offer"].includes(o.status),
  );
  const interviewMs = completedMs.filter((m) => /interview|application/i.test(m.title));
  const interview =
    interviewOps.length + interviewMs.length === 0
      ? null
      : Math.min(100, interviewOps.length * 25 + interviewMs.length * 20);
  const materialsMs = completedMs.filter((m) => /resume|portfolio|case study|profile/i.test(m.title));
  const materials = materialsMs.length === 0 ? null : Math.min(100, materialsMs.length * 34);
  const communication = namedLevel(input.skills, "Communication");
  const analytical = namedLevel(input.skills, "Analytics", "SQL", "Statistics");
  const alignment = overall.score;

  const dimensions: ReadinessDimension[] = [
    {
      id: "skillCapability",
      label: "Skill Capability",
      score: overall.score,
      state: stateFrom(overall.score),
      explanation: overall.explanation,
      recommendation: "Rate remaining unknown skills. Unknown is not treated as zero.",
    },
    {
      id: "practicalEvidence",
      label: "Practical Readiness",
      score: practical,
      state: stateFrom(practical),
      explanation:
        practical == null
          ? "No completed milestones or evidence yet."
          : `${completedMs.length} completed milestone(s) and ${evidence.length} evidence note(s).`,
      recommendation: "Complete a milestone and save what you produced.",
    },
    {
      id: "executionConsistency",
      label: "Execution Consistency",
      score: execution,
      state: stateFrom(execution),
      explanation:
        execution == null
          ? "No completed roadmap tasks or focus sessions yet."
          : `${completedTasks.length} roadmap tasks and ${completedFocus.length} focus sessions completed.`,
      recommendation: "Use Focus Mode on the next roadmap task.",
    },
    {
      id: "communication",
      label: "Communication",
      score: communication,
      state: stateFrom(communication),
      explanation:
        communication == null
          ? "Communication has not been assessed."
          : "Based on your Communication skill rating.",
      recommendation: "Write a problem statement or case narrative and save it as evidence.",
    },
    {
      id: "analyticalAbility",
      label: "Analytical Ability",
      score: analytical,
      state: stateFrom(analytical),
      explanation:
        analytical == null
          ? "Analytics or SQL have not been assessed."
          : "Based on Analytics, SQL, and related ratings.",
      recommendation: "Answer one product question with a small dataset.",
    },
    {
      id: "interviewReadiness",
      label: "Interview Readiness",
      score: interview,
      state: stateFrom(interview),
      explanation:
        interview == null
          ? "No interview-stage applications or interview milestones yet."
          : `${interviewOps.length} active interview-process role(s); ${interviewMs.length} interview milestone(s) completed.`,
      recommendation: "Practice one product-sense question after you have a real application in motion.",
    },
    {
      id: "careerMaterials",
      label: "Career Materials",
      score: materials,
      state: stateFrom(materials),
      explanation:
        materials == null
          ? "Resume, portfolio, or case-study milestones are not completed yet."
          : `${materialsMs.length} materials milestone(s) completed.`,
      recommendation: "Turn one completed exercise into a portfolio case study.",
    },
    {
      id: "targetRoleAlignment",
      label: "Target Role Alignment",
      score: alignment,
      state: stateFrom(alignment),
      explanation:
        alignment == null
          ? "Set a Career Goal and rate role skills to estimate alignment."
          : "Alignment currently follows weighted skill coverage of your selected role catalog.",
      recommendation: "Paste a target JD to see evidence gaps against a real posting.",
    },
  ];

  return { overall, dimensions };
}
