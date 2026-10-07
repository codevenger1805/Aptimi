import Dexie, { type Table } from "dexie";
import type {
  AiUsage,
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
} from "../domain/types";
import { SCHEMA_VERSION } from "../domain/types";

export class AptimiDB extends Dexie {
  profiles!: Table<Profile, string>;
  skills!: Table<Skill, string>;
  phases!: Table<RoadmapPhase, string>;
  milestones!: Table<Milestone, string>;
  roadmapTasks!: Table<RoadmapTask, string>;
  focusSessions!: Table<FocusSession, string>;
  opportunities!: Table<Opportunity, string>;
  opportunityStatusEvents!: Table<OpportunityStatusEvent, string>;
  notes!: Table<Note, string>;
  whiteboards!: Table<Whiteboard, string>;
  personalTodos!: Table<PersonalTodo, string>;
  reminders!: Table<Reminder, string>;
  inAppNotifications!: Table<InAppNotification, string>;
  rewardLedger!: Table<RewardLedgerEntry, string>;
  settings!: Table<AppSettings, string>;
  aiUsage!: Table<AiUsage, string>;

  constructor() {
    super("aptimi");
    this.version(SCHEMA_VERSION).stores({
      profiles: "id",
      skills: "id, profileId, name",
      phases: "id, profileId, order",
      milestones: "id, profileId, phaseId, order, status",
      roadmapTasks: "id, profileId, milestoneId, dueAt, status",
      focusSessions: "id, profileId, status, startedAt",
      opportunities: "id, profileId, status, company",
      opportunityStatusEvents: "id, opportunityId, changedAt",
      notes: "id, profileId, updatedAt",
      whiteboards: "id, profileId",
      personalTodos: "id, profileId, dueAt, status",
      reminders: "id, profileId, personalTodoId, remindAt, state",
      inAppNotifications: "id, profileId, state, createdAt",
      rewardLedger: "id, profileId, idempotencyKey, awardedAt",
      settings: "id",
      aiUsage: "id, profileId, localDate",
    });
  }
}

export const db = new AptimiDB();
