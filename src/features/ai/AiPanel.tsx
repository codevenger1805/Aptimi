import { useMemo, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { AI_DAILY_REQUEST_LIMIT } from "../../domain/types";
import { aiStructuredSchema, AI_SYSTEM_PROMPT, type AiStructured } from "../../domain/aiSchemas";
import { ErrorBanner } from "../../ui/components/ErrorBanner";
import { insertMilestoneBetween } from "../../domain/roadmapGenerator";
import { newId, nowIso, repos } from "../../data/repositories";
import type { Milestone } from "../../domain/types";

const SESSION_KEY = "aptimi-ai-key";

export function getSessionAiKey(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setSessionAiKey(key: string) {
  try {
    if (key) sessionStorage.setItem(SESSION_KEY, key);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

const cache = new Map<string, AiStructured>();

export async function completeAi(input: {
  endpoint: string;
  apiKey: string;
  model: string;
  userContent: string;
}): Promise<AiStructured> {
  const cached = cache.get(input.userContent);
  if (cached) return cached;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(input.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: input.userContent },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Provider error ${res.status}: ${text.slice(0, 180)}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty provider response");
    const parsed = aiStructuredSchema.safeParse(JSON.parse(content));
    if (!parsed.success) throw new Error("Invalid AI JSON; nothing was applied.");
    cache.set(input.userContent, parsed.data);
    return parsed.data;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function AiPanel({ contextLabel }: { contextLabel: string }) {
  const store = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [includeNotes, setIncludeNotes] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AiStructured | null>(null);
  const [preview, setPreview] = useState<Milestone[] | null>(null);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: store.profile?.timezone ?? "UTC",
  }).format(new Date());
  const used =
    store.aiUsage.find((u) => u.localDate === today)?.requestCount ?? 0;

  const context = useMemo(() => {
    const p = store.profile;
    const selectedNotes = includeNotes
      ? store.notes.slice(0, 3).map((n) => `${n.title}: ${n.body.slice(0, 200)}`)
      : [];
    return {
      surface: contextLabel,
      targetRole: p?.targetRole,
      targetDate: p?.targetDate,
      skills: store.skills.map((s) => ({
        name: s.name,
        current: s.currentLevel,
        target: s.targetLevel,
      })),
      milestones: store.milestones.slice(0, 12).map((m) => m.title),
      notes: selectedNotes,
    };
  }, [store, contextLabel, includeNotes]);

  async function send() {
    setError(undefined);
    setResult(null);
    setPreview(null);
    const key = getSessionAiKey() || store.settings?.persistedAiKey || "";
    if (!key) {
      setError("Add an API key in Settings. Core APTIMI works without AI.");
      return;
    }
    if (used >= AI_DAILY_REQUEST_LIMIT) {
      setError(`Daily AI limit reached (${AI_DAILY_REQUEST_LIMIT} requests). Try again tomorrow.`);
      return;
    }
    const endpoint =
      store.settings?.aiEndpoint || "https://api.groq.com/openai/v1/chat/completions";
    const model = store.settings?.aiModel || "llama-3.1-8b-instant";
    const userContent = JSON.stringify({
      instruction: prompt,
      returnSchema:
        '{ "kind": "explanation"|"next_step"|"breakdown"|"roadmap_items", "message": string, "items?": [{ "title", "description?", "placeAfterTitle?" }] }',
      context,
    }).slice(0, 4000);
    setBusy(true);
    try {
      const data = await completeAi({ endpoint, apiKey: key, model, userContent });
      if (store.profile) {
        const row = store.aiUsage.find((u) => u.localDate === today);
        await repos.aiUsage.put({
          id: row?.id ?? newId(),
          profileId: store.profile.id,
          localDate: today,
          requestCount: (row?.requestCount ?? 0) + 1,
        });
        await store.refresh();
      }
      setResult(data);
      if (data.kind === "roadmap_items" && data.items?.length && store.profile) {
        const phase = store.phases[0];
        const created = data.items.map((item, i) => {
          const after = store.milestones.find((m) => m.title === item.placeAfterTitle);
          return {
            id: newId(),
            profileId: store.profile!.id,
            phaseId: after?.phaseId ?? phase?.id,
            title: item.title,
            description: item.description,
            relatedSkillIds: [],
            order: (after?.order ?? i) + 1,
            status: "not_started" as const,
            isCustom: true,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          } satisfies Milestone;
        });
        setPreview(created);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed. Your prompt was kept.");
    } finally {
      setBusy(false);
    }
  }

  async function acceptPreview() {
    if (!preview?.length) return;
    const phaseId = preview[0].phaseId;
    const existing = store.milestones.filter((m) => m.phaseId === phaseId);
    let list = existing;
    for (const item of preview) {
      list = insertMilestoneBetween(list, item, item.order - 1);
    }
    await Promise.all(list.map((m) => repos.milestones.put(m)));
    await store.refresh();
    setPreview(null);
    setResult(null);
  }

  return (
    <section className="card stack">
      <h2>AI Career Assistant (optional)</h2>
      <p className="muted">
        Suggestions are AI-generated. They are not hiring predictions and sources are not
        guaranteed. Nothing is sent until you submit. Usage {used}/{AI_DAILY_REQUEST_LIMIT} today.
      </p>
      <label>
        Ask a focused question
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </label>
      <label style={{ flexDirection: "row", fontWeight: 400 }}>
        <input
          type="checkbox"
          checked={includeNotes}
          onChange={(e) => setIncludeNotes(e.target.checked)}
        />
        Include up to three notes in the context
      </label>
      <details>
        <summary>Review context to send</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(context, null, 2)}</pre>
        <p className="muted">
          This JSON is sent to {store.settings?.aiEndpoint || "the configured OpenAI-compatible provider"}.
        </p>
      </details>
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      <button type="button" disabled={busy || !prompt.trim()} onClick={() => void send()}>
        {busy ? "Requesting…" : "Ask assistant"}
      </button>
      {result ? (
        <div className="card">
          <p>
            <span className="status-pill">AI-generated</span> {result.message}
          </p>
          {preview?.length ? (
            <>
              <p>Proposed custom milestones (not applied yet):</p>
              <ul>
                {preview.map((p) => (
                  <li key={p.id}>{p.title}</li>
                ))}
              </ul>
              <div className="row">
                <button type="button" onClick={() => void acceptPreview()}>
                  Accept and insert
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setPreview(null);
                    setResult(null);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
