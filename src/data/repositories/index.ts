import { db } from "../db";
import type { Table } from "dexie";

import type {
  AppSettings,
  FocusSession,
  InAppNotification,
  Milestone,
  Note,
  Opportunity,
  OpportunityStatusEvent,
  PersonalTodo,
  Profile,
  Reminder,
  RewardLedgerEntry,
  RoadmapPhase,
  RoadmapTask,
  Skill,
  Whiteboard,
  AiUsage,
} from "../../domain/types";

import { SCHEMA_VERSION } from "../../domain/types";

export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}

export async function getProfile(): Promise<Profile | undefined> {
  return db.profiles.toCollection().first();
}

export async function putProfile(profile: Profile) {
  await db.profiles.put(profile);
}

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get("app");
  if (existing) return existing;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const created: AppSettings = {
    id: "app",
    schemaVersion: SCHEMA_VERSION,
    theme: "system",
    notificationPreference: "off",
    timezone: tz,
    aiKeyPersistOptIn: false,
  };
  await db.settings.put(created);
  return created;
}

export async function putSettings(settings: AppSettings) {
  await db.settings.put(settings);
}

export async function bootstrapProfile(): Promise<Profile> {
  const existing = await getProfile();
  if (existing) return existing;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const t = nowIso();
  const profile: Profile = {
    id: newId(),
    createdAt: t,
    updatedAt: t,
    timezone: tz,
    targetRole: "",
    rolePresetId: "product_manager",
    educationLevel: "skipped",
    targetDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
  };
  await putProfile(profile);
  await getSettings();
  return profile;
}

async function byProfile<T>(
  table: Table<T, any>,
  profileId: string,
): Promise<T[]> {
  return table.where("profileId").equals(profileId).toArray();
}

export const repos = {
  skills: {
    list: (pid: string) => byProfile(db.skills, pid),
    put: (row: Skill) => db.skills.put(row),
    bulkPut: (rows: Skill[]) => db.skills.bulkPut(rows),
    delete: (id: string) => db.skills.delete(id),
    clearProfile: (pid: string) => db.skills.where("profileId").equals(pid).delete(),
  },
  phases: {
    list: (pid: string) => byProfile(db.phases, pid),
    put: (row: RoadmapPhase) => db.phases.put(row),
    bulkPut: (rows: RoadmapPhase[]) => db.phases.bulkPut(rows),
    delete: (id: string) => db.phases.delete(id),
    clearProfile: (pid: string) => db.phases.where("profileId").equals(pid).delete(),
  },
  milestones: {
    list: (pid: string) => byProfile(db.milestones, pid),
    put: (row: Milestone) => db.milestones.put(row),
    bulkPut: (rows: Milestone[]) => db.milestones.bulkPut(rows),
    delete: (id: string) => db.milestones.delete(id),
    get: (id: string) => db.milestones.get(id),
    clearProfile: (pid: string) => db.milestones.where("profileId").equals(pid).delete(),
  },
  tasks: {
    list: (pid: string) => byProfile(db.roadmapTasks, pid),
    put: (row: RoadmapTask) => db.roadmapTasks.put(row),
    bulkPut: (rows: RoadmapTask[]) => db.roadmapTasks.bulkPut(rows),
    delete: (id: string) => db.roadmapTasks.delete(id),
    get: (id: string) => db.roadmapTasks.get(id),
    clearProfile: (pid: string) => db.roadmapTasks.where("profileId").equals(pid).delete(),
  },
  focus: {
    list: (pid: string) => byProfile(db.focusSessions, pid),
    put: (row: FocusSession) => db.focusSessions.put(row),
  },
  opportunities: {
    list: (pid: string) => byProfile(db.opportunities, pid),
    put: (row: Opportunity) => db.opportunities.put(row),
    delete: (id: string) => db.opportunities.delete(id),
    get: (id: string) => db.opportunities.get(id),
  },
  opportunityEvents: {
    listAll: () => db.opportunityStatusEvents.toArray(),
    put: (row: OpportunityStatusEvent) => db.opportunityStatusEvents.put(row),
  },
  notes: {
    list: (pid: string) => byProfile(db.notes, pid),
    put: (row: Note) => db.notes.put(row),
    delete: (id: string) => db.notes.delete(id),
    get: (id: string) => db.notes.get(id),
  },
  whiteboards: {
    list: (pid: string) => byProfile(db.whiteboards, pid),
    put: (row: Whiteboard) => db.whiteboards.put(row),
    get: (id: string) => db.whiteboards.get(id),
  },
  todos: {
    list: (pid: string) => byProfile(db.personalTodos, pid),
    put: (row: PersonalTodo) => db.personalTodos.put(row),
    delete: (id: string) => db.personalTodos.delete(id),
    get: (id: string) => db.personalTodos.get(id),
  },
  reminders: {
    list: (pid: string) => byProfile(db.reminders, pid),
    put: (row: Reminder) => db.reminders.put(row),
    get: (id: string) => db.reminders.get(id),
  },
  notifications: {
    list: (pid: string) => byProfile(db.inAppNotifications, pid),
    put: (row: InAppNotification) => db.inAppNotifications.put(row),
  },
  rewards: {
    list: (pid: string) => byProfile(db.rewardLedger, pid),
    put: (row: RewardLedgerEntry) => db.rewardLedger.put(row),
    findKey: (key: string) => db.rewardLedger.where("idempotencyKey").equals(key).first(),
  },
  aiUsage: {
    list: (pid: string) => byProfile(db.aiUsage, pid),
    put: (row: AiUsage) => db.aiUsage.put(row),
  },
};
