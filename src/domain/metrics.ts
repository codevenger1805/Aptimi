import type {
  Milestone,
  Opportunity,
  OpportunityStatusEvent,
  RoadmapPhase,
  RoadmapTask,
} from "./types";

export interface DateRange {
  start: string;
  end: string;
}

export function localWeekRange(nowIso: string, timeZone: string): DateRange {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(nowIso));
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = date.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() + mondayOffset);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function localMonthRange(nowIso: string, timeZone: string): DateRange {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(nowIso));
  const year = parts.find((p) => p.type === "year")?.value ?? "2026";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const start = `${year}-${month}-01`;
  const last = new Date(Date.UTC(Number(year), Number(month), 0));
  return { start, end: last.toISOString().slice(0, 10) };
}

function inRange(date: string | undefined, range: DateRange | "all"): boolean {
  if (!date) return false;
  if (range === "all") return true;
  const day = date.slice(0, 10);
  return day >= range.start && day <= range.end;
}

function rangesOverlap(
  aStart?: string,
  aEnd?: string,
  range?: DateRange | "all",
): boolean {
  if (!range || range === "all") return true;
  if (!aStart && !aEnd) return false;
  const s = (aStart ?? aEnd)!.slice(0, 10);
  const e = (aEnd ?? aStart)!.slice(0, 10);
  return s <= range.end && e >= range.start;
}

export function milestoneCompletionRate(
  milestones: Milestone[],
  phases: RoadmapPhase[],
  period: DateRange | "all",
): { numerator: number; denominator: number; label: string } {
  const planned = milestones.filter((m) => {
    if (m.targetDate) return inRange(m.targetDate, period);
    const phase = phases.find((p) => p.id === m.phaseId);
    return rangesOverlap(phase?.startDate, phase?.endDate, period);
  });
  const denominator = planned.length;
  const numerator = planned.filter((m) => m.status === "completed").length;
  if (denominator === 0) {
    return {
      numerator: 0,
      denominator: 0,
      label: "No milestones planned in this period",
    };
  }
  return {
    numerator,
    denominator,
    label: `${numerator} / ${denominator} milestones completed in this period`,
  };
}

export function weeklyTaskCompletionRate(
  tasks: RoadmapTask[],
  week: DateRange,
): { numerator: number; denominator: number; label: string } {
  const due = tasks.filter((t) => inRange(t.dueAt, week));
  const denominator = due.length;
  const numerator = due.filter((t) => t.status === "completed").length;
  if (denominator === 0) {
    return {
      numerator: 0,
      denominator: 0,
      label: "No roadmap tasks due this week",
    };
  }
  return {
    numerator,
    denominator,
    label: `${numerator} / ${denominator} weekly roadmap tasks completed`,
  };
}

const SUBMITTED = new Set([
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
]);

export function applicationsSubmitted(opps: Opportunity[]): number {
  return opps.filter((o) => {
    if (o.status === "Saved") return false;
    if (o.status === "Withdrawn") return Boolean(o.appliedAt);
    return SUBMITTED.has(o.status);
  }).length;
}

export function interviewRate(
  opps: Opportunity[],
  events: OpportunityStatusEvent[],
): { numerator: number; denominator: number; label: string } {
  const submitted = applicationsSubmitted(opps);
  if (submitted === 0) {
    return {
      numerator: 0,
      denominator: 0,
      label: "No applications submitted yet",
    };
  }
  const interviewedIds = new Set(
    events
      .filter((e) => e.toStatus === "Interview" || e.toStatus === "Offer")
      .map((e) => e.opportunityId),
  );
  opps.forEach((o) => {
    if (o.status === "Interview" || o.status === "Offer") interviewedIds.add(o.id);
  });
  const numerator = [...interviewedIds].filter((id) =>
    opps.some((o) => o.id === id && o.status !== "Saved"),
  ).length;
  return {
    numerator,
    denominator: submitted,
    label: `${numerator} / ${submitted} submitted applications reached interview or offer`,
  };
}

export function isOverdue(
  dueAt: string | undefined,
  status: string,
  nowIso: string,
): boolean {
  if (!dueAt || status === "completed") return false;
  return dueAt < nowIso;
}
