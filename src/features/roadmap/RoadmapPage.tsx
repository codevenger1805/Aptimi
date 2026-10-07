import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { generateRoadmap, insertMilestoneBetween, mergeRegeneratedRoadmap } from "../../domain/roadmapGenerator";
import { EmptyState } from "../../ui/components/EmptyState";
import { ConfirmDialog } from "../../ui/components/ConfirmDialog";
import { newId, nowIso, repos } from "../../data/repositories";
import { completeMilestone, reopenMilestone } from "../../data/completeActions";
import { useToast } from "../../store/toast";
import type { Milestone } from "../../domain/types";

export function RoadmapPage() {
  const store = useAppStore();
  const navigate = useNavigate();
  const toast = useToast((s) => s.show);

  const [activeTab, setActiveTab] = useState<"journey" | "plan" | "skills" | "evidence">("journey");
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null);
  const [insertAfter, setInsertAfter] = useState<{ phaseId: string; order: number } | null>(null);
  const [draft, setDraft] = useState({ title: "", description: "", date: "" });

  const profile = store.profile;
  const targetRole = profile?.targetRole || "Product Management";
  const phases = [...store.phases].sort((a, b) => a.order - b.order);
  const milestones = store.milestones;
  const completedMilestones = milestones.filter((m) => m.status === "completed");

  const progressPercent = milestones.length
    ? Math.round((completedMilestones.length / milestones.length) * 100)
    : 56;

  const currentMilestone = milestones.find((m) => m.status === "in_progress")
    ?? milestones.find((m) => m.status !== "completed")
    ?? milestones[0];

  const currentPhase = phases.find((p) => p.id === currentMilestone?.phaseId) ?? phases[2] ?? phases[0];
  const currentChapterIndex = phases.findIndex((p) => p.id === currentPhase?.id);
  const chapterNumberStr = String(currentChapterIndex >= 0 ? currentChapterIndex + 1 : 3).padStart(2, "0");

  async function regenerate() {
    if (!store.profile) return;
    const next = generateRoadmap({ profile: store.profile, skills: store.skills });
    const merged = mergeRegeneratedRoadmap(
      { phases: store.phases, milestones: store.milestones, tasks: store.tasks },
      next,
    );
    await repos.phases.clearProfile(store.profile.id);
    await repos.milestones.clearProfile(store.profile.id);
    await repos.tasks.clearProfile(store.profile.id);
    await repos.phases.bulkPut(merged.phases);
    await repos.milestones.bulkPut(merged.milestones);
    await repos.tasks.bulkPut(merged.tasks);
    await store.refresh();
    setConfirmRegen(false);
    toast("Roadmap regenerated. Completed work, custom items and evidence were preserved.");
  }

  async function saveInsert() {
    if (!store.profile || !insertAfter || !draft.title.trim()) return;
    const t = nowIso();
    const phaseMilestones = store.milestones.filter((m) => m.phaseId === insertAfter.phaseId);
    const created: Milestone = {
      id: newId(),
      profileId: store.profile.id,
      phaseId: insertAfter.phaseId,
      title: draft.title.trim(),
      description: draft.description,
      relatedSkillIds: [],
      order: insertAfter.order + 1,
      targetDate: draft.date || undefined,
      status: "not_started",
      isCustom: true,
      createdAt: t,
      updatedAt: t,
    };
    const next = insertMilestoneBetween(phaseMilestones, created, insertAfter.order);
    await Promise.all(next.map((m) => repos.milestones.put(m)));
    await store.refresh();
    setInsertAfter(null);
    setDraft({ title: "", description: "", date: "" });
    toast("Custom milestone added to roadmap");
  }

  async function removeMilestone(m: Milestone) {
    await repos.milestones.delete(m.id);
    const childTasks = store.tasks.filter((t) => t.milestoneId === m.id);
    await Promise.all(childTasks.map((t) => repos.tasks.delete(t.id)));
    await store.refresh();
    setDeleteTarget(null);
    toast("Milestone removed");
  }

  // Visual themes for the 5 chapters matching Design Reference 17
  const chapterThemes = [
    {
      bg: "#E8F3EE",
      border: "rgba(129, 178, 154, 0.3)",
      color: "var(--text-primary)",
      badgeBg: "var(--success-tint)",
      badgeColor: "var(--success)",
      tag: "01 FOUNDATION BUILT",
      status: "CHAPTER COMPLETE",
      pills: ["Product lifecycle", "Problem framing", "Product thinking"],
    },
    {
      bg: "#235BE8",
      border: "#1D4ED8",
      color: "#FFFFFF",
      badgeBg: "rgba(255, 255, 255, 0.2)",
      badgeColor: "#FFFFFF",
      tag: "02 DISCOVERY COMPLETE",
      status: "CHAPTER COMPLETE",
      pills: ["User research", "User interviews", "Problem discovery"],
    },
    {
      bg: "#FDECE7",
      border: "rgba(224, 122, 95, 0.3)",
      color: "var(--text-primary)",
      badgeBg: "var(--accent)",
      badgeColor: "#FFFFFF",
      tag: "03 CONTINUE HERE",
      status: "YOU ARE HERE",
      pills: ["Product metrics", "SQL fundamentals", "Data interpretation"],
      hasCta: true,
    },
    {
      bg: "#F5D38A",
      border: "rgba(180, 83, 9, 0.2)",
      color: "var(--text-primary)",
      badgeBg: "rgba(180, 83, 9, 0.15)",
      badgeColor: "var(--warning)",
      tag: "04 UP NEXT",
      status: "NEXT CHAPTER",
      pills: ["Product teardown", "Case study", "Portfolio project"],
    },
    {
      bg: "#3D405B",
      border: "#2D2F44",
      color: "#FFFFFF",
      badgeBg: "rgba(255, 255, 255, 0.15)",
      badgeColor: "#FFFFFF",
      tag: "05 OPPORTUNITY AHEAD",
      status: "FINAL CHAPTER",
      pills: ["Resume & portfolio", "Interview preparation", "Applications"],
    },
  ];

  return (
    <div className="stack" style={{ gap: "2.5rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="section-eyebrow">YOUR CAREER JOURNEY</div>
          <h1 className="editorial-h1">Roadmap to {targetRole}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
            A structured route from product foundations to internship readiness, shaped around your current pace.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button type="button" className="btn-secondary" onClick={() => setConfirmRegen(true)}>
            Edit roadmap
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (currentMilestone) navigate(`/roadmap/milestones/${currentMilestone.id}`);
            }}
          >
            Continue roadmap →
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "1rem 1.75rem",
          display: "grid",
          gridTemplateColumns: "1.2fr 1.2fr 1.6fr 1fr",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            TARGET
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
            {targetRole}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            TIMELINE
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
            6 months
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            YOUR POSITION
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ color: "var(--accent)", fontSize: "0.6rem" }}>●</span>
            Chapter {chapterNumberStr} · {currentPhase?.title ?? "Product Analytics"}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            JOURNEY ({progressPercent}%)
          </div>
          <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.15rem" }}>
            {Math.max(1, currentChapterIndex + 1)} of {phases.length || 5} chapters
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: "1.5rem" }}>
        <button
          type="button"
          className="btn-subtle"
          style={{
            borderBottom: activeTab === "journey" ? "2px solid var(--primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.5rem 0.25rem",
            fontWeight: activeTab === "journey" ? 600 : 400,
            color: activeTab === "journey" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onClick={() => setActiveTab("journey")}
        >
          Journey Overview
        </button>
        <button
          type="button"
          className="btn-subtle"
          style={{
            borderBottom: activeTab === "plan" ? "2px solid var(--primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.5rem 0.25rem",
            fontWeight: activeTab === "plan" ? 600 : 400,
            color: activeTab === "plan" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onClick={() => setActiveTab("plan")}
        >
          Detailed Plan
        </button>
        <button
          type="button"
          className="btn-subtle"
          style={{
            borderBottom: activeTab === "skills" ? "2px solid var(--primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.5rem 0.25rem",
            fontWeight: activeTab === "skills" ? 600 : 400,
            color: activeTab === "skills" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onClick={() => setActiveTab("skills")}
        >
          Skills &amp; Capabilities
        </button>
        <button
          type="button"
          className="btn-subtle"
          style={{
            borderBottom: activeTab === "evidence" ? "2px solid var(--primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.5rem 0.25rem",
            fontWeight: activeTab === "evidence" ? 600 : 400,
            color: activeTab === "evidence" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onClick={() => setActiveTab("evidence")}
        >
          Evidence &amp; Artifacts
        </button>
      </div>

      {/* TAB 1: EDITORIAL CHAPTER JOURNEY (Design Reference 17) */}
      {activeTab === "journey" && (
        <div className="stack" style={{ gap: "2.5rem" }}>
          <div style={{ position: "relative" }}>
            {/* Center connector line */}
            <div
              style={{
                position: "absolute",
                top: "40px",
                bottom: "40px",
                left: "50%",
                width: "2px",
                background: "var(--border-dark)",
                transform: "translateX(-50%)",
                zIndex: 0,
              }}
            ></div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative", zIndex: 1 }}>
              {phases.map((phase, idx) => {
                const theme = chapterThemes[idx % chapterThemes.length];
                const phaseMs = milestones.filter((m) => m.phaseId === phase.id);
                const isLeft = idx % 2 === 0;
                const chapterNum = String(idx + 1).padStart(2, "0");

                return (
                  <div
                    key={phase.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isLeft ? "1fr 120px 1fr" : "1fr 120px 1fr",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {/* Left Column */}
                    {isLeft ? (
                      <div
                        style={{
                          background: theme.bg,
                          color: theme.color,
                          border: `1px solid ${theme.border}`,
                          borderRadius: "20px 100px 100px 20px",
                          padding: "2rem 2.5rem",
                          boxShadow: "var(--shadow-sm)",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (phaseMs[0]) navigate(`/roadmap/milestones/${phaseMs[0].id}`);
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            padding: "0.2rem 0.65rem",
                            borderRadius: "9999px",
                            background: theme.badgeBg,
                            color: theme.badgeColor,
                            marginBottom: "0.6rem",
                          }}
                        >
                          {theme.status}
                        </span>

                        <h2 className="editorial-h2" style={{ color: theme.color, margin: "0.25rem 0 0.4rem" }}>
                          {phase.title.replace(/^0\d\s*—\s*/, "")}
                        </h2>
                        <p style={{ fontSize: "0.88rem", opacity: 0.85, margin: "0 0 1rem", maxWidth: "420px" }}>
                          {phase.description}
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {phaseMs.slice(0, 3).map((m) => (
                            <span
                              key={m.id}
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                padding: "0.2rem 0.55rem",
                                borderRadius: "4px",
                                background: "rgba(0,0,0,0.08)",
                                color: theme.color,
                              }}
                            >
                              {m.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "right", paddingRight: "1.5rem" }}>
                        <div className="editorial-number" style={{ fontSize: "4.5rem", fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>
                          {chapterNum}
                        </div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                          {theme.tag.split(" ").slice(1).join(" ")}
                        </div>
                      </div>
                    )}

                    {/* Center Node on Timeline */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#FFFFFF",
                          border: `4px solid ${idx < 2 ? "var(--success)" : idx === 2 ? "var(--accent)" : "var(--border-dark)"}`,
                          zIndex: 2,
                        }}
                      ></div>
                    </div>

                    {/* Right Column */}
                    {!isLeft ? (
                      <div
                        style={{
                          background: theme.bg,
                          color: theme.color,
                          border: `1px solid ${theme.border}`,
                          borderRadius: "100px 20px 20px 100px",
                          padding: "2rem 2.5rem",
                          boxShadow: "var(--shadow-sm)",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (phaseMs[0]) navigate(`/roadmap/milestones/${phaseMs[0].id}`);
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            padding: "0.2rem 0.65rem",
                            borderRadius: "9999px",
                            background: theme.badgeBg,
                            color: theme.badgeColor,
                            marginBottom: "0.6rem",
                          }}
                        >
                          {theme.status}
                        </span>

                        <h2 className="editorial-h2" style={{ color: theme.color, margin: "0.25rem 0 0.4rem" }}>
                          {phase.title.replace(/^0\d\s*—\s*/, "")}
                        </h2>
                        <p style={{ fontSize: "0.88rem", opacity: 0.85, margin: "0 0 1rem", maxWidth: "420px" }}>
                          {phase.description}
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {phaseMs.slice(0, 3).map((m) => (
                            <span
                              key={m.id}
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                padding: "0.2rem 0.55rem",
                                borderRadius: "4px",
                                background: "rgba(255,255,255,0.15)",
                                color: theme.color,
                              }}
                            >
                              {m.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "left", paddingLeft: "1.5rem" }}>
                        <div className="editorial-number" style={{ fontSize: "4.5rem", fontWeight: 700, color: idx === 0 ? "var(--success)" : "var(--accent)", lineHeight: 1 }}>
                          {chapterNum}
                        </div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                          {theme.tag.split(" ").slice(1).join(" ")}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Destination Banner */}
          <div
            style={{
              background: "var(--primary)",
              color: "#FFFFFF",
              borderRadius: "12px",
              padding: "1.25rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                💼
              </div>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.75, letterSpacing: "0.08em" }}>
                  YOUR DESTINATION
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Ready for Product Management opportunities</div>
              </div>
            </div>

            <button
              type="button"
              className="btn"
              style={{ background: "#fff", color: "var(--primary)", fontWeight: 600 }}
              onClick={() => navigate("/internships")}
            >
              Explore your next step →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED PLAN (Design Reference 02 Breakdown) */}
      {activeTab === "plan" && (
        <div className="stack" style={{ gap: "2rem" }}>
          {phases.map((phase) => {
            const phaseMilestones = milestones
              .filter((m) => m.phaseId === phase.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={phase.id} className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{phase.title}</h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {phase.startDate} → {phase.endDate}
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
                  {phase.description}
                </p>

                <div className="stack" style={{ gap: "0.75rem" }}>
                  {phaseMilestones.map((m) => {
                    const isDone = m.status === "completed";
                    return (
                      <div
                        key={m.id}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          padding: "1rem 1.25rem",
                          background: isDone ? "var(--bg-surface-subtle)" : "var(--bg-surface)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{m.title}</span>
                            {m.isCustom && <span className="status-pill pill-neutral">Custom</span>}
                            <span className={`status-pill ${isDone ? "pill-success" : "pill-accent"}`}>
                              {isDone ? "Completed" : "In progress"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                            Target: {m.targetDate ?? "Unscheduled"} · {m.objective ?? m.description}
                          </div>
                        </div>

                        <div className="row" style={{ gap: "0.5rem" }}>
                          <Link to={`/roadmap/milestones/${m.id}`} className="btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.82rem" }}>
                            Open details →
                          </Link>
                          {isDone ? (
                            <button
                              type="button"
                              className="btn-subtle"
                              onClick={async () => {
                                await reopenMilestone(m);
                                await store.refresh();
                              }}
                            >
                              Reopen
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={async () => {
                                await completeMilestone(m);
                                await store.refresh();
                                toast("Milestone completed");
                              }}
                            >
                              Complete
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-subtle"
                            style={{ color: "var(--danger)" }}
                            onClick={() => setDeleteTarget(m)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="btn-subtle"
                    onClick={() => setInsertAfter({ phaseId: phase.id, order: phaseMilestones.length })}
                  >
                    + Add milestone to this phase
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: SKILLS & CAPABILITIES */}
      {activeTab === "skills" && (
        <div className="stack" style={{ gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Capability Requirements for {targetRole}</h2>
            <button type="button" className="btn-primary" onClick={() => navigate("/assessment")}>
              Retake skill assessment →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {store.skills.map((s) => (
              <div key={s.id} className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "1rem" }}>{s.name}</span>
                  <span className="status-pill pill-primary">Level {s.currentLevel ?? 1} / {s.targetLevel}</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden", margin: "0.5rem 0" }}>
                  <div style={{ width: `${((s.currentLevel ?? 1) / s.targetLevel) * 100}%`, height: "100%", background: "var(--primary)" }}></div>
                </div>
                {s.evidenceNote && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.5rem 0 0" }}>
                    <strong>Evidence:</strong> {s.evidenceNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EVIDENCE & ARTIFACTS */}
      {activeTab === "evidence" && (
        <div className="stack" style={{ gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Verified Portfolio Evidence</h2>
            <Link to="/notes" className="btn-secondary">
              Open all notes &amp; evidence →
            </Link>
          </div>

          {store.notes.filter((n) => n.kind === "evidence" || n.kind === "reflection").length === 0 ? (
            <EmptyState title="No evidence attached yet">
              Complete milestones and save work submissions to build portfolio proof.
            </EmptyState>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
              {store.notes.filter((n) => n.kind === "evidence" || n.kind === "reflection").map((note) => (
                <div key={note.id} className="card" style={{ padding: "1.25rem" }}>
                  <span className="status-pill pill-accent" style={{ marginBottom: "0.5rem" }}>{note.kind}</span>
                  <h3 style={{ fontSize: "1rem", margin: "0.25rem 0 0.5rem" }}>{note.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                    {note.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insert Custom Milestone Modal */}
      {insertAfter && (
        <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setInsertAfter(null); }}>
          <div className="dialog-panel">
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Add Custom Milestone</h2>
            <div className="stack">
              <label>
                Title
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Build product funnel dashboard" />
              </label>
              <label>
                Objective / Description
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What will you produce and why does it matter?" />
              </label>
              <label>
                Target date
                <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </label>
              <div className="row">
                <button type="button" className="btn-primary" onClick={() => void saveInsert()}>Save Milestone</button>
                <button type="button" className="btn-secondary" onClick={() => setInsertAfter(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Regenerate Dialog */}
      {confirmRegen && (
        <ConfirmDialog
          title="Regenerate Career Roadmap?"
          confirmLabel="Regenerate"
          onCancel={() => setConfirmRegen(false)}
          onConfirm={() => void regenerate()}
        >
          A new roadmap will be constructed from your current Career Goal, timeline, and skill ratings.
          Completed milestones, reflections, evidence, and custom items are always preserved.
        </ConfirmDialog>
      )}

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Remove milestone?"
          confirmLabel="Remove"
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void removeMilestone(deleteTarget)}
        >
          Are you sure you want to remove this milestone? Any attached roadmap tasks will also be removed.
        </ConfirmDialog>
      )}
    </div>
  );
}
