import { db } from "./db";

export async function ensureMigrated(): Promise<{ ok: boolean; message?: string }> {
  try {
    await db.open();
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "IndexedDB could not be opened. Export is unavailable until storage is recovered.";
    return { ok: false, message };
  }
}
