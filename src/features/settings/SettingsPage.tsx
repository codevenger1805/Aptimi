import { useState } from "react";
import { useAppStore } from "../../store/appStore";
import { EDUCATION_OPTIONS, ROLE_PRESET_OPTIONS, skillsForPreset } from "../../domain/skillCatalog";
import { calculateReadiness } from "../../domain/readiness";
import { generateRoadmap, mergeRegeneratedRoadmap } from "../../domain/roadmapGenerator";
import { SKILL_ANCHORS, type EducationLevel, type RolePresetId, type Skill } from "../../domain/types";
import { exportAll, previewImport, replaceWithImport } from "../../data/exportImport";
import { buildSamplePayload } from "./sampleProfile";
import { ConfirmDialog } from "../../ui/components/ConfirmDialog";
import { ErrorBanner } from "../../ui/components/ErrorBanner";
import { applyTheme } from "../../store/theme";
import { setSessionAiKey, getSessionAiKey } from "../ai/AiPanel";
import { newId, nowIso, repos } from "../../data/repositories";
import { lifetimePoints, levelFromPoints } from "../../domain/rewards";

export function SettingsPage() {
  const store = useAppStore();
  const p = store.profile;
  const s = store.settings;
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<string>();
  const [importError, setImportError] = useState<string>();
  const [pendingImport, setPendingImport] = useState<ReturnType<typeof previewImport>["payload"]>();
  const [confirmSample, setConfirmSample] = useState(false);
  const [confirmReplan, setConfirmReplan] = useState(false);
  const [goalDraft, setGoalDraft] = useState({
    targetRole: p?.targetRole ?? "",
    rolePresetId: p?.rolePresetId ?? "product_manager",
    educationLevel: p?.educationLevel ?? "skipped",
    targetDate: p?.targetDate ?? "",
    weeklyAvailableHours: p?.weeklyAvailableHours?.toString() ?? "",
  });
  const [notifyExplain, setNotifyExplain] = useState(false);
  const [aiKey, setAiKey] = useState(getSessionAiKey());
  const [persistKey, setPersistKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "career" | "skills" | "data">("general");

  if (!p || !s) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Loading settings…</div>;

  const readiness = calculateReadiness(store.skills);
  const pts = lifetimePoints(store.rewards);
  const level = levelFromPoints(pts);

  async function exportFile() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aptimi-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stack" style={{ gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div>
        <div className="section-eyebrow">PREFERENCES & ACCOUNT</div>
        <h1 className="editorial-h1">Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
          Manage your career goal, data backups, and application preferences.
        </p>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: "1.5rem" }}>
        {[
          { id: "general", label: "General" },
          { id: "career", label: "Career Goal" },
          { id: "skills", label: "Assessment" },
          { id: "data", label: "Data & AI" }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className="btn-subtle"
            style={{
              borderBottom: activeTab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
              borderRadius: 0,
              padding: "0.5rem 0.25rem",
              fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? "var(--text-primary)" : "var(--text-secondary)",
            }}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {activeTab === "general" && (
          <>
            <section className="card stack">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Appearance</h2>
              <div className="grid-2">
                <label>
                  Theme
                  <select
                    value={s.theme}
                    onChange={(e) => {
                      const theme = e.target.value as typeof s.theme;
                      applyTheme(theme);
                      void store.saveSettings({ ...s, theme });
                    }}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                <label>
                  Timezone
                  <input
                    value={p.timezone}
                    onChange={(e) => void store.saveProfile({ ...p, timezone: e.target.value })}
                  />
                </label>
              </div>
            </section>

            <section className="card stack">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Notifications</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Browser notifications are optional. Delivery is not guaranteed when this tab or device is closed.
                APTIMI does not use a push server.
              </p>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <button type="button" className="btn-secondary" onClick={() => setNotifyExplain(true)}>
                  Enable browser notifications
                </button>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Current preference: {s.notificationPreference}</span>
              </div>
            </section>
            
            <section className="card stack">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Points ledger</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Level {level.level} · {pts} points · next threshold {level.nextThreshold}.
              </p>
              <div style={{ background: "var(--bg-surface-subtle)", borderRadius: "8px", padding: "1rem", maxHeight: "300px", overflowY: "auto" }}>
                {store.rewards.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>No ledger entries yet.</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {store.rewards
                      .slice()
                      .reverse()
                      .slice(0, 20)
                      .map((r) => (
                        <li key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-light)" }}>
                          <span>{r.reason ?? r.sourceType}</span>
                          <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)" }}>
                            <span>+{r.points} pts</span>
                            <span>{new Date(r.awardedAt).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "career" && (
          <section className="card stack">
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Career Goal</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Update your target role or timeline. Regenerating the roadmap will keep your completed history intact.
            </p>
            <div className="grid-2">
              <label>
                Target role
                <input
                  value={goalDraft.targetRole}
                  onChange={(e) => setGoalDraft({ ...goalDraft, targetRole: e.target.value })}
                />
              </label>
              <label>
                Skill set preset
                <select
                  value={goalDraft.rolePresetId}
                  onChange={(e) => setGoalDraft({ ...goalDraft, rolePresetId: e.target.value as RolePresetId })}
                >
                  {ROLE_PRESET_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Education
                <select
                  value={goalDraft.educationLevel}
                  onChange={(e) => setGoalDraft({ ...goalDraft, educationLevel: e.target.value as EducationLevel })}
                >
                  {EDUCATION_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Target date
                <input
                  type="date"
                  value={goalDraft.targetDate}
                  onChange={(e) => setGoalDraft({ ...goalDraft, targetDate: e.target.value })}
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button type="button" className="btn-primary" onClick={() => setConfirmReplan(true)}>
                Save goal & regenerate
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={async () => {
                  await store.saveProfile({
                    ...p,
                    targetRole: goalDraft.targetRole,
                    rolePresetId: goalDraft.rolePresetId,
                    educationLevel: goalDraft.educationLevel,
                    targetDate: goalDraft.targetDate || p.targetDate,
                    weeklyAvailableHours: goalDraft.weeklyAvailableHours ? Number(goalDraft.weeklyAvailableHours) : undefined,
                  });
                }}
              >
                Save only
              </button>
            </div>
          </section>
        )}

        {activeTab === "skills" && (
          <section className="card stack" style={{ gap: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Skill Assessment</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                {readiness.explanation}
              </p>
            </div>
            <div style={{ display: "grid", gap: "1rem" }}>
              {store.skills.map((skill) => (
                <div key={skill.id} style={{ background: "var(--bg-surface-subtle)", padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{skill.name}</h3>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        Target: {skill.targetLevel} · Gap: {skill.currentLevel == null ? "Unknown" : Math.max(skill.targetLevel - skill.currentLevel, 0)}
                      </div>
                    </div>
                    {skill.currentLevel != null && (
                      <span className="status-pill pill-accent">Level {skill.currentLevel}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 500, fontSize: "0.85rem", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name={skill.id}
                          checked={skill.currentLevel === n}
                          style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                          onChange={async () => {
                            await repos.skills.put({ ...skill, currentLevel: n, assessedAt: nowIso() });
                            await store.refresh();
                          }}
                        />
                        {n} {n === 1 ? <span style={{ color: "var(--text-muted)" }}>({SKILL_ANCHORS[n]})</span> : ""}
                      </label>
                    ))}
                    <button
                      type="button"
                      className="btn-subtle"
                      style={{ fontSize: "0.8rem", marginLeft: "auto" }}
                      onClick={async () => {
                        await repos.skills.put({ ...skill, currentLevel: null, assessedAt: undefined });
                        await store.refresh();
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "data" && (
          <>
            <section className="card stack">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Backup & Restore</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Data is stored locally in this browser. Export regularly to avoid data loss.
              </p>
              <div>
                <button type="button" className="btn-secondary" onClick={() => void exportFile()}>
                  Export Data to JSON
                </button>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <label>
                  Import JSON
                  <textarea 
                    value={importText} 
                    onChange={(e) => setImportText(e.target.value)} 
                    style={{ minHeight: "100px", fontFamily: "monospace", fontSize: "0.85rem" }}
                  />
                </label>
                {importError ? <ErrorBanner>{importError}</ErrorBanner> : null}
                {importPreview ? <p style={{ fontSize: "0.9rem", color: "var(--success)", padding: "0.5rem", background: "rgba(129, 178, 154, 0.1)", borderRadius: "6px" }}>{importPreview}</p> : null}
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: "0.75rem" }}
                  onClick={() => {
                    try {
                      const raw = JSON.parse(importText);
                      const preview = previewImport(raw);
                      if (!preview.ok) {
                        setImportError(preview.error);
                        setPendingImport(undefined);
                        return;
                      }
                      setImportError(undefined);
                      setImportPreview(preview.summary);
                      setPendingImport(preview.payload);
                    } catch {
                      setImportError("Invalid JSON. Existing data was not changed.");
                    }
                  }}
                >
                  Preview import
                </button>
              </div>
            </section>

            <section className="card stack">
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>AI Career Assistant</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Connect an OpenAI-compatible Chat Completions API. The key is kept in memory unless saved locally.
              </p>
              <div className="grid-2">
                <label>
                  Provider endpoint
                  <input
                    value={s.aiEndpoint ?? "https://api.groq.com/openai/v1/chat/completions"}
                    onChange={(e) => void store.saveSettings({ ...s, aiEndpoint: e.target.value })}
                  />
                </label>
                <label>
                  Model
                  <input
                    value={s.aiModel ?? "llama-3.1-8b-instant"}
                    onChange={(e) => void store.saveSettings({ ...s, aiModel: e.target.value })}
                  />
                </label>
                <label style={{ gridColumn: "1 / -1" }}>
                  API key (session)
                  <input
                    type="password"
                    autoComplete="off"
                    value={aiKey}
                    onChange={(e) => {
                      setAiKey(e.target.value);
                      setSessionAiKey(e.target.value);
                    }}
                  />
                </label>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 400, fontSize: "0.9rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={persistKey}
                  style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                  onChange={(e) => setPersistKey(e.target.checked)}
                />
                Save this key locally in this browser
              </label>
              <div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    void store.saveSettings({
                      ...s,
                      aiKeyPersistOptIn: persistKey,
                      persistedAiKey: persistKey ? aiKey : undefined,
                      aiProvider: "openai-compatible",
                    })
                  }
                >
                  Save AI settings
                </button>
              </div>
            </section>

            <section className="card stack" style={{ border: "1px solid rgba(224, 122, 95, 0.3)", background: "var(--accent-tint)" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--accent)" }}>Sample Profile</h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Load realistic demo data for testing. This will replace your current data.
              </p>
              <div>
                <button type="button" className="btn-primary" style={{ background: "var(--accent)" }} onClick={() => setConfirmSample(true)}>
                  Load sample profile
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {pendingImport ? (
        <ConfirmDialog
          title="Replace all local data?"
          danger
          confirmLabel="Replace"
          onCancel={() => setPendingImport(undefined)}
          onConfirm={async () => {
            await replaceWithImport(pendingImport);
            await store.refresh();
            setPendingImport(undefined);
            setImportText("");
          }}
        >
          {importPreview} This overwrites the current profile.
        </ConfirmDialog>
      ) : null}

      {confirmSample ? (
        <ConfirmDialog
          title="Load labeled sample profile?"
          confirmLabel="Load sample"
          onCancel={() => setConfirmSample(false)}
          onConfirm={async () => {
            await replaceWithImport(buildSamplePayload());
            await store.refresh();
            setConfirmSample(false);
          }}
        >
          Sample data will replace your current local data and remain labeled as sample.
        </ConfirmDialog>
      ) : null}

      {confirmReplan ? (
        <ConfirmDialog
          title="Regenerate uncompleted roadmap?"
          confirmLabel="Save and regenerate"
          onCancel={() => setConfirmReplan(false)}
          onConfirm={async () => {
            const nextProfile = {
              ...p,
              targetRole: goalDraft.targetRole,
              rolePresetId: goalDraft.rolePresetId,
              educationLevel: goalDraft.educationLevel,
              targetDate: goalDraft.targetDate || p.targetDate,
            };
            await store.saveProfile(nextProfile);
            if (goalDraft.rolePresetId !== p.rolePresetId) {
              await repos.skills.clearProfile(p.id);
              const created: Skill[] = skillsForPreset(goalDraft.rolePresetId).map((sk) => ({
                id: newId(),
                profileId: p.id,
                name: sk.name,
                currentLevel: null,
                targetLevel: sk.targetLevel,
                weight: sk.weight,
              }));
              await repos.skills.bulkPut(created);
            }
            const fresh = generateRoadmap({
              profile: nextProfile,
              skills: useAppStore.getState().skills,
            });
            const merged = mergeRegeneratedRoadmap(
              {
                phases: store.phases,
                milestones: store.milestones,
                tasks: store.tasks,
              },
              fresh,
            );
            await repos.phases.clearProfile(p.id);
            await repos.milestones.clearProfile(p.id);
            await repos.tasks.clearProfile(p.id);
            await repos.phases.bulkPut(merged.phases);
            await repos.milestones.bulkPut(merged.milestones);
            await repos.tasks.bulkPut(merged.tasks);
            await store.refresh();
            setConfirmReplan(false);
          }}
        >
          Completed milestones and custom items stay. Generated items that are not completed may
          be replaced to match the new Career Goal.
        </ConfirmDialog>
      ) : null}

      {notifyExplain ? (
        <ConfirmDialog
          title="Enable browser notifications?"
          confirmLabel="Request permission"
          onCancel={() => setNotifyExplain(false)}
          onConfirm={async () => {
            if (!("Notification" in window)) {
              await store.saveSettings({ ...s, notificationPreference: "in_app_only" });
              setNotifyExplain(false);
              return;
            }
            const result = await Notification.requestPermission();
            await store.saveSettings({
              ...s,
              notificationPreference:
                result === "granted" ? "browser_and_in_app" : "in_app_only",
            });
            setNotifyExplain(false);
          }}
        >
          APTIMI will remind you about personal to-dos you scheduled. Permission is only requested
          because you chose this. If you deny it, in-app reminders still work while the app is open.
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
