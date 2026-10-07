import { useState } from "react";
import { useAppStore } from "../../store/appStore";
import { analyzeJobDescription } from "../../domain/jdAnalysis";
import { newId, nowIso, repos } from "../../data/repositories";
import { useToast } from "../../store/toast";
import type { Milestone } from "../../domain/types";

export function JDAnalysisModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const store = useAppStore();
  const toast = useToast((s) => s.show);
  const [jdText, setJdText] = useState(store.profile?.pastedJobDescription || "");

  const sampleJD = `Associate Product Manager Intern — Monzo
We are looking for an ambitious APM intern to join our Core Banking product team.
Responsibilities:
- Collaborate with engineers and product designers to ship user-facing banking features.
- Define success metrics, analyze product funnels, and write SQL queries for transaction metrics.
- Conduct user research interviews to identify customer friction points in savings pots.
- Write clear product requirements (PRDs) and communicate project trade-offs.

Requirements:
- Strong problem solving and product sense.
- Proficiency with SQL, analytical thinking, and metric interpretation.
- Evidence of structured communication and user research.`;

  const analysis = jdText.trim()
    ? analyzeJobDescription({
        jd: jdText,
        skills: store.skills,
        notes: store.notes,
        tasks: store.tasks,
      })
    : null;

  async function handleAddToRoadmap() {
    if (!store.profile || !analysis) return;
    const t = nowIso();
    const phase = store.phases[0] || { id: newId() };

    for (const rec of analysis.recommendedActions) {
      const ms: Milestone = {
        id: newId(),
        profileId: store.profile.id,
        phaseId: phase.id,
        title: rec,
        description: `Recommended from target Job Description analysis (${analysis.matchPercent ?? 0}% role alignment).`,
        relatedSkillIds: [],
        order: store.milestones.length,
        status: "not_started",
        isCustom: true,
        createdAt: t,
        updatedAt: t,
      };
      await repos.milestones.put(ms);
    }

    await store.refresh();
    toast("Recommended actions added to your Career Roadmap");
    onClose();
  }

  if (!open) return null;

  const matchScore = analysis?.matchPercent ?? 0;

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
          maxWidth: "880px",
          width: "90vw",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-surface)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
              CAREER INTELLIGENCE WORKSPACE
            </span>
            <h2 style={{ fontSize: "1.25rem", margin: "0.2rem 0 0" }}>Job Description Match &amp; Analysis</h2>
          </div>
          <button type="button" className="btn-subtle" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Split Layout: Left JD Input and Right Match Output */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "1.5rem",
            padding: "1.5rem 1.75rem",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* Left Column: JD Input */}
          <div className="stack" style={{ gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Paste Job Posting</label>
              <button
                type="button"
                className="btn-subtle"
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                onClick={() => setJdText(sampleJD)}
              >
                Insert sample APM posting
              </button>
            </div>

            <textarea
              placeholder="Paste the full job requirements, responsibilities, and qualifications..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              style={{ minHeight: "320px", fontSize: "0.85rem", lineHeight: 1.5 }}
            />
          </div>

          {/* Right Column: Instant Analysis Output */}
          <div>
            {!analysis ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "2rem",
                  border: "1px dashed var(--border)",
                  borderRadius: "12px",
                }}
              >
                <span style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📄</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Paste a JD to analyze match &amp; gaps
                </div>
                <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  Instant local extraction without needing external API keys.
                </div>
              </div>
            ) : (
              <div className="stack" style={{ gap: "1.25rem" }}>
                {/* Match Score Card */}
                <div
                  style={{
                    background: "var(--primary-tint)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                      ROLE MATCH SCORE
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {matchScore >= 70 ? "Strong Match" : "Developing Alignment"}
                    </div>
                  </div>
                  <div style={{ fontSize: "2.25rem", fontWeight: 700, color: "var(--primary)" }}>
                    {matchScore}%
                  </div>
                </div>

                {/* Strong Matches */}
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--success)", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                    ✓ STRONG MATCHES ({analysis.strongMatches.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {analysis.strongMatches.map((m) => (
                      <span key={m.label} className="status-pill pill-success" title={m.reason}>
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Development Gaps */}
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                    ⚠ DEVELOPMENT GAPS ({analysis.developmentGaps.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {analysis.developmentGaps.map((g) => (
                      <span key={g.label} className="status-pill pill-accent" title={g.reason}>
                        {g.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence Gaps */}
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--warning)", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                    📋 EVIDENCE GAPS ({analysis.evidenceGaps.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {analysis.evidenceGaps.map((e) => (
                      <span key={e.label} className="status-pill pill-warning" title={e.reason}>
                        {e.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.85rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                    RECOMMENDED ACTIONS
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    {analysis.recommendedActions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: "1rem 1.75rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-surface)",
          }}
        >
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>

          {analysis && (
            <button type="button" className="btn-primary" onClick={handleAddToRoadmap}>
              Add Recommended Actions to My Roadmap →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
