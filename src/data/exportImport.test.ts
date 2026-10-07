import { describe, expect, it } from "vitest";
import { previewImport } from "../data/exportImport";
import { buildSamplePayload } from "../features/settings/sampleProfile";
import { SCHEMA_VERSION } from "../domain/types";
import { aiStructuredSchema } from "../domain/aiSchemas";
import { AI_DAILY_REQUEST_LIMIT } from "../domain/types";

describe("import validation", () => {
  it("accepts a valid sample payload", () => {
    const result = previewImport(buildSamplePayload());
    expect(result.ok).toBe(true);
    expect(result.payload?.profile.isSampleProfile).toBe(true);
  });

  it("rejects invalid imports without a payload", () => {
    const result = previewImport({ schemaVersion: SCHEMA_VERSION, nope: true });
    expect(result.ok).toBe(false);
    expect(result.payload).toBeUndefined();
  });
});

describe("AI schema", () => {
  it("rejects unstructured output", () => {
    const parsed = aiStructuredSchema.safeParse({ message: "hi" });
    expect(parsed.success).toBe(false);
  });

  it("bounds item lists", () => {
    const parsed = aiStructuredSchema.safeParse({
      kind: "roadmap_items",
      message: "Try these",
      items: Array.from({ length: 6 }, (_, i) => ({ title: `Item ${i}` })),
    });
    expect(parsed.success).toBe(false);
  });

  it("documents daily limit", () => {
    expect(AI_DAILY_REQUEST_LIMIT).toBe(20);
  });
});
