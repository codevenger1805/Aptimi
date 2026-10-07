import { nextAction } from "./nextAction";
import { calculateReadiness } from "./readiness";
import type { AiStructured } from "./aiSchemas";
import type {
  FocusSession,
  Milestone,
  Note,
  Opportunity,
  PersonalTodo,
  Profile,
  Reminder,
  RoadmapPhase,
  RoadmapTask,
  Skill,
} from "./types";

export interface AssistantContext {
  profile?: Profile;
  skills: Skill[];
  phases: RoadmapPhase[];
  milestones: Milestone[];
  tasks: RoadmapTask[];
  reminders: Reminder[];
  todos: PersonalTodo[];
  notes: Note[];
  opportunities: Opportunity[];
  focusSessions: FocusSession[];
  nowIso: string;
}

export function localAssistantAnswer(question: string, ctx: AssistantContext): AiStructured {
  const q = question.toLowerCase();
  const action = nextAction({
    profile: ctx.profile,
    tasks: ctx.tasks,
    reminders: ctx.reminders,
    todos: ctx.todos,
    milestones: ctx.milestones,
    nowIso: ctx.nowIso,
  });
  const readiness = calculateReadiness(ctx.skills);
  const current = ctx.milestones.find((m) => m.status === "in_progress")
    ?? ctx.milestones.find((m) => m.status !== "completed");
  const openTasks = ctx.tasks.filter((t) => t.status !== "completed");
  const hours = ctx.profile?.weeklyAvailableHours;
  const role = ctx.profile?.targetRole || "your target role";

  if (/ready to apply|am i ready/.test(q)) {
    return {
      kind: "explanation",
      message:
        readiness.score == null
          ? `There is not enough assessed skill data to estimate readiness for ${role}. Complete the skill assessment first. This is a planning aid, not a hiring prediction.`
          : `Career Readiness is ${readiness.score} from ${readiness.assessedCount} rated skills. Treat that as a planning signal only. Next useful action: ${action.title} — ${action.detail}`,
    };
  }

  if (/30 minutes|30 min|short session|today/.test(q)) {
    const minutes = /30/.test(q) ? 30 : 60;
    const task = openTasks[0];
    return {
      kind: "breakdown",
      message: `You asked for a ${minutes}-minute block. Local assistant used your current milestone and open tasks — not an external model.`,
      items: [
        { title: "Clarify the objective (5 min)", description: current ? `Re-read: ${current.title}` : "Open Career Goal setup." },
        {
          title: task ? `Work: ${task.title}` : "Start a Focus Mode session",
          description: task ? `Use the remaining ${minutes - 15} minutes on this roadmap task.` : "A completed timer updates streak and hours.",
        },
        { title: "Capture evidence (10 min)", description: "Write what you produced. Unknown work does not count as evidence." },
      ],
    };
  }

  if (/why is this milestone|why.*important/.test(q)) {
    return {
      kind: "explanation",
      message: current
        ? `${current.title} matters because it sits on your ${role} roadmap${current.objective ? `: ${current.objective}` : "."} Completing it without evidence will not raise practical readiness.`
        : "No current milestone is in progress. Generate or continue a Career Roadmap first.",
    };
  }

  if (/readiness.*weak|why.*weak/.test(q)) {
    const gaps = ctx.skills
      .filter((s) => s.currentLevel != null && s.currentLevel < s.targetLevel)
      .sort((a, b) => (a.currentLevel ?? 0) - (b.currentLevel ?? 0));
    return {
      kind: "explanation",
      message:
        gaps.length === 0
          ? readiness.explanation
          : `${readiness.explanation} Largest rated gaps: ${gaps
              .slice(0, 3)
              .map((s) => `${s.name} (${s.currentLevel}/${s.targetLevel})`)
              .join(", ")}.`,
    };
  }

  if (/portfolio|evidence/.test(q)) {
    return {
      kind: "next_step",
      message: `Add one artifact tied to ${current?.title ?? "your current milestone"}. Evidence must describe what you actually produced.`,
    };
  }

  if (/interview/.test(q)) {
    const nextInterview = ctx.opportunities.find((o) => o.status === "Interview" || o.status === "Assessment");
    return {
      kind: "next_step",
      message: nextInterview
        ? `Prepare for ${nextInterview.company} (${nextInterview.role}). Practice one product-sense question and one story from a completed milestone.`
        : "No interview-stage opportunity is tracked yet. Add one in Internship Tracker when you have a real process.",
    };
  }

  return {
    kind: "next_step",
    message: `${action.title}. ${action.detail}${hours ? ` Weekly availability on file: ${hours} hours.` : ""} Local assistant only used data already in APTIMI.`,
  };
}
