import { repos, newId, nowIso } from "../data/repositories";
import { awardIfNew, voidAward } from "../domain/rewards";
import { POINTS } from "../domain/types";
import type { Milestone, RoadmapTask, PersonalTodo, RewardLedgerEntry } from "../domain/types";

export async function awardComplete(
  profileId: string,
  sourceType: string,
  sourceId: string,
  points: number,
  reason: string,
) {
  const ledger: RewardLedgerEntry[] = await repos.rewards.list(profileId);
  const { awarded } = awardIfNew({
    ledger,
    profileId,
    sourceType,
    sourceId,
    points,
    nowIso: nowIso(),
    id: newId(),
    reason,
  });
  if (awarded) await repos.rewards.put(awarded);
}

export async function voidComplete(
  profileId: string,
  sourceType: string,
  sourceId: string,
  points: number,
) {
  const ledger: RewardLedgerEntry[] = await repos.rewards.list(profileId);
  const { entry } = voidAward({
    ledger,
    profileId,
    sourceType,
    sourceId,
    points,
    nowIso: nowIso(),
    id: newId(),
  });
  if (entry) await repos.rewards.put(entry);
}

export async function completeRoadmapTask(task: RoadmapTask, allTasks: RoadmapTask[], milestone?: Milestone) {
  const t = nowIso();
  const next: RoadmapTask = {
    ...task,
    status: "completed",
    completedAt: t,
    updatedAt: t,
  };
  await repos.tasks.put(next);
  await awardComplete(task.profileId, "roadmapTask", task.id, POINTS.roadmapTask, "Completed roadmap task");
  if (milestone && milestone.status !== "completed") {
    const siblings = allTasks.filter((x) => x.milestoneId === milestone.id);
    const allDone = siblings.every((x) => (x.id === task.id ? true : x.status === "completed"));
    if (allDone && siblings.length > 0) {
      await repos.milestones.put({
        ...milestone,
        status: "completed",
        completedAt: t,
        updatedAt: t,
      });
      await awardComplete(task.profileId, "milestone", milestone.id, POINTS.milestone, "Completed milestone");
    } else if (milestone.status === "not_started") {
      await repos.milestones.put({ ...milestone, status: "in_progress", updatedAt: t });
    }
  }
}

export async function reopenRoadmapTask(task: RoadmapTask, milestone?: Milestone) {
  const t = nowIso();
  await repos.tasks.put({
    ...task,
    status: "pending",
    completedAt: undefined,
    updatedAt: t,
  });
  await voidComplete(task.profileId, "roadmapTask", task.id, POINTS.roadmapTask);
  if (milestone?.status === "completed") {
    await repos.milestones.put({
      ...milestone,
      status: "in_progress",
      completedAt: undefined,
      updatedAt: t,
    });
    await voidComplete(task.profileId, "milestone", milestone.id, POINTS.milestone);
  }
}

export async function completeMilestone(milestone: Milestone) {
  const t = nowIso();
  await repos.milestones.put({
    ...milestone,
    status: "completed",
    completedAt: t,
    updatedAt: t,
  });
  await awardComplete(milestone.profileId, "milestone", milestone.id, POINTS.milestone, "Completed milestone");
}

export async function reopenMilestone(milestone: Milestone) {
  const t = nowIso();
  await repos.milestones.put({
    ...milestone,
    status: "not_started",
    completedAt: undefined,
    updatedAt: t,
  });
  await voidComplete(milestone.profileId, "milestone", milestone.id, POINTS.milestone);
}

export async function completeTodo(todo: PersonalTodo) {
  const t = nowIso();
  await repos.todos.put({
    ...todo,
    status: "completed",
    completedAt: t,
    updatedAt: t,
  });
  await awardComplete(todo.profileId, "personalTodo", todo.id, POINTS.personalTodo, "Completed personal to-do");
}

export async function reopenTodo(todo: PersonalTodo) {
  const t = nowIso();
  await repos.todos.put({
    ...todo,
    status: "pending",
    completedAt: undefined,
    updatedAt: t,
  });
  await voidComplete(todo.profileId, "personalTodo", todo.id, POINTS.personalTodo);
}

export { type RewardLedgerEntry };
