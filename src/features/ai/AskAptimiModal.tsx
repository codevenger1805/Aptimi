import { useState } from "react";
import { useAppStore } from "../../store/appStore";
import { localAssistantAnswer } from "../../domain/localAssistant";
import { getSessionAiKey, completeAi } from "./AiPanel";
import { newId, repos } from "../../data/repositories";
import { AI_DAILY_REQUEST_LIMIT } from "../../domain/types";
import type { AiStructured } from "../../domain/aiSchemas";

export function AskAptimiModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const store = useAppStore();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiStructured | null>(null);
  const [source, setSource] = useState<"local" | "ai">("local");

  if (!open) return null;

  const quickPrompts = [
    "What should I work on today?",
    "Why is my current milestone important?",
    "I only have 30 minutes. What should I do?",
    "Am I ready to apply for internships?",
    "What is holding back my career readiness?",
    "How can I prepare for an upcoming interview?",
  ];

  async function handleAsk(promptText: string) {
    const q = promptText.trim();
    if (!q) return;
    setQuestion(q);
    setLoading(true);
    setResponse(null);

    const key = getSessionAiKey() || store.settings?.persistedAiKey || "";
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: store.profile?.timezone ?? "UTC",
    }).format(new Date());
    const used = store.aiUsage.find((u) => u.localDate === today)?.requestCount ?? 0;

    // If external key exists and within limits, attempt external AI; otherwise use fast local assistant!
    if (key && used < AI_DAILY_REQUEST_LIMIT) {
      try {
        const endpoint = store.settings?.aiEndpoint || "https://api.groq.com/openai/v1/chat/completions";
        const model = store.settings?.aiModel || "llama-3.1-8b-instant";
        const userContent = JSON.stringify({
          instruction: q,
          targetRole: store.profile?.targetRole,
          skills: store.skills.map((s) => ({ name: s.name, level: s.currentLevel })),
          milestones: store.milestones.slice(0, 8).map((m) => m.title),
        });
        const res = await completeAi({ endpoint, apiKey: key, model, userContent });
        setResponse(res);
        setSource("ai");
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
        setLoading(false);
        return;
      } catch (e) {
        // Fallback gracefully to local assistant
      }
    }

    // Local deterministic intelligence
    const localRes = localAssistantAnswer(q, {
      profile: store.profile,
      skills: store.skills,
      phases: store.phases,
      milestones: store.milestones,
      tasks: store.tasks,
      reminders: store.reminders,
      todos: store.todos,
      notes: store.notes,
      opportunities: store.opportunities,
      focusSessions: store.focusSessions,
      nowIso: new Date().toISOString(),
    });
    setResponse(localRes);
    setSource("local");
    setLoading(false);
  }

  return (
    <div
      className="dialog-backdrop"
      style={{ zIndex: 1100 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dialog-panel"
        style={{
          maxWidth: "640px",
          padding: 0,
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "var(--primary)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem" }}>✨</span>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>Ask APTIMI Assistant</h2>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
                Contextual career guidance tailored to your roadmap, goals and readiness
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-subtle"
            onClick={onClose}
            style={{ color: "#fff", padding: "0.3rem" }}
            aria-label="Close Assistant"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "1.5rem", maxHeight: "65vh", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              SUGGESTED QUESTIONS
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="btn-secondary"
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.35rem 0.7rem",
                    borderRadius: "9999px",
                    background: "var(--bg-canvas)",
                    textAlign: "left",
                  }}
                  onClick={() => void handleAsk(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleAsk(question);
            }}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}
          >
            <input
              placeholder="Ask anything about your career preparation, milestones, skills..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" disabled={loading || !question.trim()}>
              {loading ? "Thinking..." : "Ask"}
            </button>
          </form>

          {response && (
            <div
              style={{
                background: "var(--bg-canvas)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <span className={`status-pill ${source === "ai" ? "pill-primary" : "pill-accent"}`}>
                  {source === "ai" ? "AI Generated" : "Local Assistant"}
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {source === "local" ? "Calculated from local workspace" : "Provider completion"}
                </span>
              </div>

              <div style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "var(--text-primary)" }}>
                {response.message}
              </div>

              {response.items && response.items.length > 0 && (
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {response.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
