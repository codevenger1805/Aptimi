import type {
  Milestone,
  PersonalTodo,
  Profile,
  Reminder,
  RoadmapTask,
} from "./types";
import { isOverdue } from "./metrics";

export function nextAction(input: {
  profile: Profile | undefined;
  tasks: RoadmapTask[];
  reminders: Reminder[];
  todos: PersonalTodo[];
  milestones: Milestone[];
  nowIso: string;
}): { title: string; href: string; detail: string } {
  if (!input.profile?.onboardingCompletedAt) {
    return {
      title: "Finish Career Goal setup",
      href: "/onboarding",
      detail: "Set a target role, rate skills, and review your Career Roadmap.",
    };
  }
  const overdueTask = input.tasks.find((t) =>
    isOverdue(t.dueAt, t.status, input.nowIso),
  );
  if (overdueTask) {
    return {
      title: "Complete an overdue roadmap task",
      href: "/planner",
      detail: overdueTask.title,
    };
  }
  const dueReminder = input.reminders.find(
    (r) => r.state === "due" || r.state === "shown",
  );
  if (dueReminder) {
    const todo = input.todos.find((t) => t.id === dueReminder.personalTodoId);
    return {
      title: "Review a due reminder",
      href: "/todos",
      detail: todo?.title ?? "Open To-Do",
    };
  }
  const nextTask = input.tasks
    .filter((t) => t.status !== "completed" && t.dueAt)
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""))[0];
  if (nextTask) {
    return {
      title: "Work the next roadmap task",
      href: "/planner",
      detail: nextTask.title,
    };
  }
  const openMilestone = input.milestones.find((m) => m.status !== "completed");
  if (openMilestone) {
    return {
      title: "Continue a Career Roadmap milestone",
      href: "/roadmap",
      detail: openMilestone.title,
    };
  }
  return {
    title: "Start a Focus Mode session",
    href: "/focus",
    detail: "A completed session updates Focus Hours and your Focus Streak.",
  };
}
