import { db } from "./db";
import { exportPayloadSchema } from "../domain/schemas";
import type { ExportPayload } from "../domain/types";
import { SCHEMA_VERSION } from "../domain/types";

const TABLES = [
  "profiles",
  "skills",
  "phases",
  "milestones",
  "roadmapTasks",
  "focusSessions",
  "opportunities",
  "opportunityStatusEvents",
  "notes",
  "whiteboards",
  "personalTodos",
  "reminders",
  "inAppNotifications",
  "rewardLedger",
  "settings",
  "aiUsage",
] as const;

export async function exportAll(): Promise<ExportPayload> {
  const profile = (await db.profiles.toCollection().first()) as ExportPayload["profile"];
  const settings =
    (await db.settings.get("app")) ??
    ({
      id: "app",
      schemaVersion: SCHEMA_VERSION,
      theme: "system",
      notificationPreference: "off",
      timezone: profile?.timezone ?? "UTC",
      aiKeyPersistOptIn: false,
    } satisfies ExportPayload["settings"]);
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    skills: await db.skills.toArray(),
    phases: await db.phases.toArray(),
    milestones: await db.milestones.toArray(),
    roadmapTasks: await db.roadmapTasks.toArray(),
    focusSessions: await db.focusSessions.toArray(),
    opportunities: await db.opportunities.toArray(),
    opportunityStatusEvents: await db.opportunityStatusEvents.toArray(),
    notes: await db.notes.toArray(),
    whiteboards: await db.whiteboards.toArray(),
    personalTodos: await db.personalTodos.toArray(),
    reminders: await db.reminders.toArray(),
    inAppNotifications: await db.inAppNotifications.toArray(),
    rewardLedger: await db.rewardLedger.toArray(),
    settings,
    aiUsage: await db.aiUsage.toArray(),
  };
}

export function previewImport(raw: unknown): {
  ok: boolean;
  payload?: ExportPayload;
  error?: string;
  summary?: string;
} {
  const parsed = exportPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const p = parsed.data;
  return {
    ok: true,
    payload: p as ExportPayload,
    summary: `Profile ${p.profile.targetRole || p.profile.id}: ${p.milestones.length} milestones, ${p.roadmapTasks.length} roadmap tasks, ${p.opportunities.length} opportunities, ${p.notes.length} notes.`,
  };
}

export async function replaceWithImport(payload: ExportPayload): Promise<void> {
  await db.transaction("rw", TABLES.map((t) => db.table(t)), async () => {
    for (const name of TABLES) {
      await db.table(name).clear();
    }
    await db.profiles.put(payload.profile);
    await db.skills.bulkPut(payload.skills);
    await db.phases.bulkPut(payload.phases);
    await db.milestones.bulkPut(payload.milestones);
    await db.roadmapTasks.bulkPut(payload.roadmapTasks);
    await db.focusSessions.bulkPut(payload.focusSessions);
    await db.opportunities.bulkPut(payload.opportunities);
    await db.opportunityStatusEvents.bulkPut(payload.opportunityStatusEvents);
    await db.notes.bulkPut(payload.notes);
    await db.whiteboards.bulkPut(payload.whiteboards);
    await db.personalTodos.bulkPut(payload.personalTodos);
    await db.reminders.bulkPut(payload.reminders);
    await db.inAppNotifications.bulkPut(payload.inAppNotifications);
    await db.rewardLedger.bulkPut(payload.rewardLedger);
    await db.settings.put(payload.settings);
    await db.aiUsage.bulkPut(payload.aiUsage);
  });
}
