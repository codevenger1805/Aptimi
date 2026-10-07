import { z } from "zod";
import { SCHEMA_VERSION } from "./types";

export const skillSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  name: z.string(),
  category: z.string().optional(),
  currentLevel: z.number().int().min(1).max(5).nullable(),
  targetLevel: z.number().int().min(1).max(5),
  weight: z.number().positive(),
  assessedAt: z.string().optional(),
  confidence: z.number().int().min(1).max(5).nullable().optional(),
  evidenceNote: z.string().optional(),
});

export const profileSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  timezone: z.string(),
  targetRole: z.string(),
  rolePresetId: z.enum([
    "product_manager",
    "software_engineer",
    "data_analyst",
    "ux_designer",
    "custom",
  ]),
  educationLevel: z.enum([
    "undergrad_y1",
    "undergrad_y2",
    "undergrad_y3",
    "undergrad_y4",
    "graduate",
    "recent_graduate",
    "career_switcher",
    "skipped",
  ]),
  currentYear: z.string().optional(),
  targetDate: z.string(),
  weeklyAvailableHours: z.number().optional(),
  onboardingCompletedAt: z.string().optional(),
  isSampleProfile: z.boolean().optional(),
  degreeField: z.string().optional(),
  experienceSummary: z.string().optional(),
  learningPreference: z.string().optional(),
  workStyle: z.string().optional(),
  motivation: z.string().optional(),
  careerPreference: z.string().optional(),
  pastedJobDescription: z.string().optional(),
});

export const phaseSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const milestoneSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  phaseId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  relatedSkillIds: z.array(z.string()),
  order: z.number(),
  targetDate: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  isCustom: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
  difficulty: z.enum(["Foundation", "Practice", "Evidence", "Interview"]).optional(),
  objective: z.string().optional(),
  prerequisiteTitles: z.array(z.string()).optional(),
});

export const roadmapTaskSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  milestoneId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  relatedSkillId: z.string().optional(),
  order: z.number(),
  priority: z.enum(["Low", "Medium", "High"]),
  estimatedMinutes: z.number().optional(),
  dueAt: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

export const focusSessionSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  roadmapTaskId: z.string().optional(),
  personalTodoId: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  durationSeconds: z.number(),
  plannedSeconds: z.number(),
  status: z.enum(["completed", "abandoned"]),
  completedAt: z.string().optional(),
});

export const opportunitySchema = z.object({
  id: z.string(),
  profileId: z.string(),
  company: z.string(),
  role: z.string(),
  url: z.string().optional(),
  location: z.string().optional(),
  status: z.enum([
    "Saved",
    "Applied",
    "Assessment",
    "Interview",
    "Offer",
    "Rejected",
    "Withdrawn",
  ]),
  savedAt: z.string(),
  appliedAt: z.string().optional(),
  followUpAt: z.string().optional(),
  compensation: z.string().optional(),
  jobDescription: z.string().optional(),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const opportunityEventSchema = z.object({
  id: z.string(),
  opportunityId: z.string(),
  fromStatus: opportunitySchema.shape.status.optional(),
  toStatus: opportunitySchema.shape.status,
  changedAt: z.string(),
});

export const noteSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  title: z.string(),
  body: z.string(),
  linkedEntityType: z
    .enum([
      "milestone",
      "roadmapTask",
      "personalTodo",
      "opportunity",
      "phase",
      "assessment",
      "jobDescription",
    ])
    .optional(),
  linkedEntityId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().optional(),
  color: z.string().optional(),
  kind: z.enum(["note", "sticky", "evidence", "reflection", "scratch"]).optional(),
});

export const whiteboardObjectSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "rect", "circle"]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().optional(),
  text: z.string().optional(),
  style: z
    .object({ color: z.string().optional(), fill: z.string().optional() })
    .optional(),
  zIndex: z.number(),
});

export const whiteboardSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  title: z.string(),
  linkedEntityType: noteSchema.shape.linkedEntityType,
  linkedEntityId: z.string().optional(),
  objects: z.array(whiteboardObjectSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const personalTodoSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueAt: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["pending", "in_progress", "completed"]),
  linkedEntityType: noteSchema.shape.linkedEntityType,
  linkedEntityId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

export const reminderSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  personalTodoId: z.string(),
  remindAt: z.string(),
  state: z.enum(["scheduled", "due", "shown", "dismissed", "missed", "canceled"]),
  deliveredAt: z.string().optional(),
  dismissedAt: z.string().optional(),
});

export const inAppNotificationSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  relatedEntityId: z.string().optional(),
  scheduledAt: z.string().optional(),
  createdAt: z.string(),
  readAt: z.string().optional(),
  state: z.enum(["unread", "read", "dismissed"]),
});

export const rewardSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  points: z.number(),
  awardedAt: z.string(),
  idempotencyKey: z.string(),
  reason: z.string().optional(),
});

export const settingsSchema = z.object({
  id: z.string(),
  schemaVersion: z.number(),
  theme: z.enum(["system", "light", "dark"]),
  notificationPreference: z.enum(["off", "in_app_only", "browser_and_in_app"]),
  timezone: z.string(),
  aiProvider: z.string().optional(),
  aiEndpoint: z.string().optional(),
  aiModel: z.string().optional(),
  aiKeyPersistOptIn: z.boolean(),
  persistedAiKey: z.string().optional(),
});

export const aiUsageSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  localDate: z.string(),
  requestCount: z.number(),
});

export const exportPayloadSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  exportedAt: z.string(),
  profile: profileSchema,
  skills: z.array(skillSchema),
  phases: z.array(phaseSchema),
  milestones: z.array(milestoneSchema),
  roadmapTasks: z.array(roadmapTaskSchema),
  focusSessions: z.array(focusSessionSchema),
  opportunities: z.array(opportunitySchema),
  opportunityStatusEvents: z.array(opportunityEventSchema),
  notes: z.array(noteSchema),
  whiteboards: z.array(whiteboardSchema),
  personalTodos: z.array(personalTodoSchema),
  reminders: z.array(reminderSchema),
  inAppNotifications: z.array(inAppNotificationSchema),
  rewardLedger: z.array(rewardSchema),
  settings: settingsSchema,
  aiUsage: z.array(aiUsageSchema),
});
