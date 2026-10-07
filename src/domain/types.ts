export type RolePresetId =
  | "product_manager"
  | "software_engineer"
  | "data_analyst"
  | "ux_designer"
  | "custom";

export type EducationLevel =
  | "undergrad_y1"
  | "undergrad_y2"
  | "undergrad_y3"
  | "undergrad_y4"
  | "graduate"
  | "recent_graduate"
  | "career_switcher"
  | "skipped";

export type MilestoneStatus = "not_started" | "in_progress" | "completed";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type Priority = "Low" | "Medium" | "High";
export type FocusSessionStatus = "completed" | "abandoned";
export type OpportunityStatus =
  | "Saved"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type ReminderState =
  | "scheduled"
  | "due"
  | "shown"
  | "dismissed"
  | "missed"
  | "canceled";

export type NotificationState = "unread" | "read" | "dismissed";

export type LinkedEntityType =
  | "milestone"
  | "roadmapTask"
  | "personalTodo"
  | "opportunity"
  | "phase"
  | "assessment"
  | "jobDescription";

export type NoteKind = "note" | "sticky" | "evidence" | "reflection" | "scratch";

export type WhiteboardObjectType = "text" | "rect" | "circle";

export type ThemePreference = "system" | "light" | "dark";

export type NotificationPreference = "off" | "in_app_only" | "browser_and_in_app";

export interface Profile {
  id: string;
  createdAt: string;
  updatedAt: string;
  timezone: string;
  targetRole: string;
  rolePresetId: RolePresetId;
  educationLevel: EducationLevel;
  currentYear?: string;
  targetDate: string;
  weeklyAvailableHours?: number;
  onboardingCompletedAt?: string;
  isSampleProfile?: boolean;
  degreeField?: string;
  experienceSummary?: string;
  learningPreference?: string;
  workStyle?: string;
  motivation?: string;
  careerPreference?: string;
  pastedJobDescription?: string;
}

export interface Skill {
  id: string;
  profileId: string;
  name: string;
  category?: string;
  currentLevel: number | null;
  targetLevel: number;
  weight: number;
  assessedAt?: string;
  confidence?: number | null;
  evidenceNote?: string;
}

export interface RoadmapPhase {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  order: number;
  startDate?: string;
  endDate?: string;
}

export interface Milestone {
  id: string;
  profileId: string;
  phaseId?: string;
  title: string;
  description?: string;
  relatedSkillIds: string[];
  order: number;
  targetDate?: string;
  status: MilestoneStatus;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  difficulty?: "Foundation" | "Practice" | "Evidence" | "Interview";
  objective?: string;
  prerequisiteTitles?: string[];
}

export interface RoadmapTask {
  id: string;
  profileId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  relatedSkillId?: string;
  order: number;
  priority: Priority;
  estimatedMinutes?: number;
  dueAt?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  profileId: string;
  roadmapTaskId?: string;
  personalTodoId?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  plannedSeconds: number;
  status: FocusSessionStatus;
  completedAt?: string;
}

export interface Opportunity {
  id: string;
  profileId: string;
  company: string;
  role: string;
  url?: string;
  location?: string;
  status: OpportunityStatus;
  savedAt: string;
  appliedAt?: string;
  followUpAt?: string;
  compensation?: string;
  jobDescription?: string;
  notes?: string;
  nextAction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityStatusEvent {
  id: string;
  opportunityId: string;
  fromStatus?: OpportunityStatus;
  toStatus: OpportunityStatus;
  changedAt: string;
}

export interface Note {
  id: string;
  profileId: string;
  title: string;
  body: string;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  color?: string;
  kind?: NoteKind;
}

export interface WhiteboardObject {
  id: string;
  type: WhiteboardObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  text?: string;
  style?: { color?: string; fill?: string };
  zIndex: number;
}

export interface Whiteboard {
  id: string;
  profileId: string;
  title: string;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;
  objects: WhiteboardObject[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalTodo {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  dueAt?: string;
  priority: Priority;
  status: TaskStatus;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Reminder {
  id: string;
  profileId: string;
  personalTodoId: string;
  remindAt: string;
  state: ReminderState;
  deliveredAt?: string;
  dismissedAt?: string;
}

export interface InAppNotification {
  id: string;
  profileId: string;
  type: string;
  title: string;
  body: string;
  relatedEntityId?: string;
  scheduledAt?: string;
  createdAt: string;
  readAt?: string;
  state: NotificationState;
}

export interface RewardLedgerEntry {
  id: string;
  profileId: string;
  sourceType: string;
  sourceId: string;
  points: number;
  awardedAt: string;
  idempotencyKey: string;
  reason?: string;
}

export interface AppSettings {
  id: string;
  schemaVersion: number;
  theme: ThemePreference;
  notificationPreference: NotificationPreference;
  timezone: string;
  aiProvider?: string;
  aiEndpoint?: string;
  aiModel?: string;
  aiKeyPersistOptIn: boolean;
  persistedAiKey?: string;
}

export interface AiUsage {
  id: string;
  profileId: string;
  localDate: string;
  requestCount: number;
}

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  profile: Profile;
  skills: Skill[];
  phases: RoadmapPhase[];
  milestones: Milestone[];
  roadmapTasks: RoadmapTask[];
  focusSessions: FocusSession[];
  opportunities: Opportunity[];
  opportunityStatusEvents: OpportunityStatusEvent[];
  notes: Note[];
  whiteboards: Whiteboard[];
  personalTodos: PersonalTodo[];
  reminders: Reminder[];
  inAppNotifications: InAppNotification[];
  rewardLedger: RewardLedgerEntry[];
  settings: AppSettings;
  aiUsage: AiUsage[];
}

export const SKILL_ANCHORS: Record<number, string> = {
  1: "Cannot apply yet",
  2: "Limited / needs heavy guidance",
  3: "Can apply with support",
  4: "Independent in typical internship settings",
  5: "Can teach or lead at this level",
};

export const DEFAULT_TARGET_LEVEL = 4;
export const DEFAULT_SKILL_WEIGHT = 1;
export const SCHEMA_VERSION = 1;
export const POINTS = {
  roadmapTask: 10,
  milestone: 25,
  focusSession: 5,
  personalTodo: 2,
} as const;
export const POINTS_PER_LEVEL = 100;
export const AI_DAILY_REQUEST_LIMIT = 20;
