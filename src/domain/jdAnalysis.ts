import type { Note, RoadmapTask, Skill } from "./types";

export interface JdFinding {
  label: string;
  reason: string;
}

export interface JdAnalysisResult {
  matchPercent: number | null;
  requiredTerms: string[];
  strongMatches: JdFinding[];
  developmentGaps: JdFinding[];
  evidenceGaps: JdFinding[];
  recommendedActions: string[];
  resumeGuidance: string[];
}

const CATALOG: { skill: string; terms: string[] }[] = [
  { skill: "Product Thinking", terms: ["product thinking", "product sense", "prd", "roadmap", "prioritization", "product manager", "product intern"] },
  { skill: "User Research", terms: ["user research", "interview", "discovery", "user interview", "qualitative", "persona"] },
  { skill: "Communication", terms: ["communication", "stakeholder", "cross-functional", "presentation", "writing"] },
  { skill: "Analytics", terms: ["analytics", "metrics", "kpi", "funnel", "retention", "a/b", "experiment", "dashboards"] },
  { skill: "SQL", terms: ["sql", "query", "warehouse", "looker", "tableau", "data analysis"] },
  { skill: "Leadership", terms: ["leadership", "lead", "ownership", "influence"] },
  { skill: "Problem Solving", terms: ["problem solving", "problem-solving", "root cause", "tradeoff", "trade-off"] },
  { skill: "Prioritization", terms: ["prioritization", "rice", "ice", "backlog"] },
  { skill: "Programming", terms: ["programming", "software", "code", "python", "javascript", "java"] },
  { skill: "Testing", terms: ["testing", "qa", "unit test"] },
  { skill: "Wireframing", terms: ["wireframe", "figma", "prototype", "ux"] },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ");
}

export function extractRequiredTerms(jd: string): string[] {
  const text = normalize(jd);
  const found = CATALOG.filter((row) => row.terms.some((t) => text.includes(t))).map((r) => r.skill);
  return [...new Set(found)];
}

export function analyzeJobDescription(input: {
  jd: string;
  skills: Skill[];
  notes: Note[];
  tasks: RoadmapTask[];
}): JdAnalysisResult {
  const jd = input.jd.trim();
  if (!jd) {
    return {
      matchPercent: null,
      requiredTerms: [],
      strongMatches: [],
      developmentGaps: [],
      evidenceGaps: [],
      recommendedActions: ["Paste a job description to compare it with your current skills and evidence."],
      resumeGuidance: [],
    };
  }

  const required = extractRequiredTerms(jd);
  const evidenceNotes = input.notes.filter((n) => n.kind === "evidence" || /evidence|case study|portfolio/i.test(`${n.title} ${n.body}`));
  const completedWork = input.tasks.filter((t) => t.status === "completed");

  const strongMatches: JdFinding[] = [];
  const developmentGaps: JdFinding[] = [];
  const evidenceGaps: JdFinding[] = [];

  for (const name of required) {
    const skill = input.skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
    const hasEvidence = evidenceNotes.some((n) => n.body.toLowerCase().includes(name.toLowerCase()) || n.title.toLowerCase().includes(name.toLowerCase()))
      || completedWork.some((t) => t.title.toLowerCase().includes(name.toLowerCase()));
    if (!skill || skill.currentLevel == null) {
      developmentGaps.push({
        label: name,
        reason: "Mentioned in the JD, but this skill is not assessed yet. Unknown is not treated as zero.",
      });
      continue;
    }
    if (skill.currentLevel >= 3) {
      strongMatches.push({
        label: name,
        reason: `Self-assessed at level ${skill.currentLevel} of ${skill.targetLevel}.`,
      });
      if (!hasEvidence) {
        evidenceGaps.push({
          label: name,
          reason: "You rate this skill, but APTIMI has no linked evidence or completed related task.",
        });
      }
    } else {
      developmentGaps.push({
        label: name,
        reason: `Current level ${skill.currentLevel} is below independent internship application (target ${skill.targetLevel}).`,
      });
    }
  }

  const matchPercent =
    required.length === 0
      ? null
      : Math.round((100 * strongMatches.length) / required.length);

  const recommendedActions: string[] = [];
  for (const gap of developmentGaps.slice(0, 4)) {
    recommendedActions.push(`Practice ${gap.label} with a small artifact you can save as evidence.`);
  }
  for (const gap of evidenceGaps.slice(0, 3)) {
    recommendedActions.push(`Add evidence for ${gap.label} from a completed exercise or project.`);
  }
  if (recommendedActions.length === 0 && strongMatches.length) {
    recommendedActions.push("Your assessed skills overlap this JD. Prepare a resume bullet for each strong match using real work.");
  }

  const resumeGuidance = strongMatches.slice(0, 4).map((m) => {
    return `Lead with ${m.label}: one sentence of what you did, the method, and a concrete result.`;
  });

  return {
    matchPercent,
    requiredTerms: required,
    strongMatches,
    developmentGaps,
    evidenceGaps,
    recommendedActions,
    resumeGuidance,
  };
}
