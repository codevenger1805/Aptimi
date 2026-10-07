import type { RewardLedgerEntry } from "./types";
import { POINTS, POINTS_PER_LEVEL } from "./types";

export function completeKey(sourceType: string, sourceId: string): string {
  return `${sourceType}:${sourceId}:complete`;
}

export function voidKey(sourceType: string, sourceId: string, at: string): string {
  return `${sourceType}:${sourceId}:void:${at}`;
}

export function awardIfNew(input: {
  ledger: RewardLedgerEntry[];
  profileId: string;
  sourceType: string;
  sourceId: string;
  points: number;
  nowIso: string;
  id: string;
  reason?: string;
}): { ledger: RewardLedgerEntry[]; awarded: RewardLedgerEntry | null } {
  const key = completeKey(input.sourceType, input.sourceId);
  if (input.ledger.some((e) => e.idempotencyKey === key)) {
    return { ledger: input.ledger, awarded: null };
  }
  const entry: RewardLedgerEntry = {
    id: input.id,
    profileId: input.profileId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    points: input.points,
    awardedAt: input.nowIso,
    idempotencyKey: key,
    reason: input.reason,
  };
  return { ledger: [...input.ledger, entry], awarded: entry };
}

export function voidAward(input: {
  ledger: RewardLedgerEntry[];
  profileId: string;
  sourceType: string;
  sourceId: string;
  points: number;
  nowIso: string;
  id: string;
}): { ledger: RewardLedgerEntry[]; entry: RewardLedgerEntry | null } {
  const complete = completeKey(input.sourceType, input.sourceId);
  const original = input.ledger.find((e) => e.idempotencyKey === complete);
  if (!original) return { ledger: input.ledger, entry: null };
  const key = voidKey(input.sourceType, input.sourceId, input.nowIso);
  if (input.ledger.some((e) => e.idempotencyKey === key)) {
    return { ledger: input.ledger, entry: null };
  }
  const alreadyVoided = input.ledger.some(
    (e) =>
      e.sourceType === input.sourceType &&
      e.sourceId === input.sourceId &&
      e.points < 0 &&
      e.idempotencyKey.startsWith(`${input.sourceType}:${input.sourceId}:void:`),
  );
  if (alreadyVoided) return { ledger: input.ledger, entry: null };
  const entry: RewardLedgerEntry = {
    id: input.id,
    profileId: input.profileId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    points: -input.points,
    awardedAt: input.nowIso,
    idempotencyKey: key,
    reason: "Completion reversed",
  };
  return { ledger: [...input.ledger, entry], entry };
}

export function lifetimePoints(ledger: RewardLedgerEntry[]): number {
  return ledger.reduce((sum, e) => sum + e.points, 0);
}

export function levelFromPoints(points: number): {
  level: number;
  nextThreshold: number;
  pointsIntoLevel: number;
} {
  const net = Math.max(0, points);
  const level = Math.floor(net / POINTS_PER_LEVEL) + 1;
  const nextThreshold = level * POINTS_PER_LEVEL;
  return { level, nextThreshold, pointsIntoLevel: net % POINTS_PER_LEVEL };
}

export { POINTS };
