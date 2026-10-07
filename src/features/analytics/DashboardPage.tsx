import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { calculateReadiness } from "../../domain/readiness";
import { computeStreak, focusHours } from "../../domain/streak";
import { completeRoadmapTask, reopenRoadmapTask } from "../../data/completeActions";
import { newId, nowIso, repos } from "../../data/repositories";
import { useToast } from "../../store/toast";
import type { RoadmapTask } from "../../domain/types";

export function DashboardPage() {
  const store = useAppStore();
  const navigate = useNavigate();
  const toast = useToast((s) => s.show);
  const [activeTab, setActiveTab] = useState<"this-week" | "roadmap" | "applications" | "workspace">("this-week");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskDraft, setTaskDraft] = useState({ title: "", milestoneId: "", minutes: "30" });

  const profile = store.profile;
  const now = new Date().toISOString();
  const tz = profile?.timezone ?? "UTC";
  const ready = calculateReadiness(store.skills);
  const streak = computeStreak(store.focusSessions, tz, now);
  const hours = focusHours(store.focusSessions);

  // Filter tasks for this week
  const completedTasks = store.tasks.filter((t) => t.status === "completed");
  const activeOpportunities = store.opportunities.filter((o) => o.status !== "Rejected" && o.status !== "Withdrawn");
  const interviewOpportunities = store.opportunities.filter((o) => ["Assessment", "Interview", "Offer"].includes(o.status));

  const hasData = store.milestones.length > 0 || store.tasks.length > 0 || store.opportunities.length > 0;

  // Format today's date for editorial header
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date()).toUpperCase();

  const userName = profile?.isSampleProfile || !profile?.targetRole
    ? "Amara"
    : profile.targetRole.split(" ")[0] || "there";

  const activeMilestone = store.milestones.find((m) => m.status === "in_progress")
    ?? store.milestones.find((m) => m.status !== "completed")
    ?? store.milestones[0];

  async function handleAddTask() {
    if (!profile || !taskDraft.title.trim()) return;
    const t = nowIso();
    const newTask: RoadmapTask = {
      id: newId(),
      profileId: profile.id,
      milestoneId: taskDraft.milestoneId || activeMilestone?.id,
      title: taskDraft.title.trim(),
      order: store.tasks.length,
      priority: "High",
      dueAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "pending",
      estimatedMinutes: Number(taskDraft.minutes) || 30,
      createdAt: t,
      updatedAt: t,
    };
    await repos.tasks.put(newTask);
    await store.refresh();
    setShowAddTaskModal(false);
    setTaskDraft({ title: "", milestoneId: "", minutes: "30" });
    toast("Action item added to weekly plan");
  }

  // If user explicitly views the 8-card discovery workspace or has zero data
  if (activeTab === "workspace" || (!hasData && activeTab === "this-week")) {
    return (
      <div className="stack" style={{ gap: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="section-eyebrow">WELCOME TO APTIMI</div>
            <h1 className="editorial-h1">Build your career, one step at a time.</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
              Turn your career goals into a clear plan, focused actions and evidence you can use.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {hasData && (
              <button type="button" className="btn-secondary" onClick={() => setActiveTab("this-week")}>
                View Active Dashboard
              </button>
            )}
            <button type="button" className="btn-primary" onClick={() => navigate("/onboarding")}>
              Set your career goal
            </button>
          </div>
        </div>

        {/* Highlight direction setup banner */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderLeft: "4px solid var(--accent)",
            borderRadius: "10px",
            padding: "1.25rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="editorial-number" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>01</span>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Start with your direction</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                  Tell APTIMI what you're aiming for. We'll shape the roadmap around your role, timeline and availability.
                </p>
              </div>
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={() => navigate("/onboarding")}>
            Begin setup →
          </button>
        </div>

        {/* 8 Feature Discovery Cards */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Your career workspace</h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>8 ways to get started</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {/* 01 Direction */}
            <div
              className="card"
              style={{
                gridColumn: "span 2",
                background: "var(--primary)",
                color: "#FFFFFF",
                display: "flex",
                justifyContent: "space-between",
                padding: "2rem",
                borderRadius: "14px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/onboarding")}
            >
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", opacity: 0.8 }}>01 · DIRECTION</div>
                <h2 className="editorial-h2" style={{ color: "#fff", margin: "0.5rem 0 0.75rem" }}>Set your career goal</h2>
                <p style={{ fontSize: "0.9rem", opacity: 0.85, maxWidth: "420px", margin: 0 }}>
                  Define the role you want to pursue, your timeline, availability and career direction.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "2.5rem" }}>🎯</span>
              </div>
            </div>

            {/* 02 Plan */}
            <div
              className="card"
              style={{ background: "#FDECE7", borderColor: "rgba(224, 122, 95, 0.2)", cursor: "pointer" }}
              onClick={() => navigate("/roadmap")}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--accent)" }}>02 · PLAN</div>
              <h3 style={{ fontSize: "1.15rem", margin: "0.35rem 0 0.5rem" }}>Build your career roadmap</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Turn your goal into phases, milestones and weekly actions.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                <div>✓ Find direction</div>
                <div>2 Build evidence</div>
                <div>3 Get application-ready</div>
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>Create your roadmap →</span>
            </div>

            {/* 03 Assess */}
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/onboarding")}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>03 · ASSESS</div>
              <h3 style={{ fontSize: "1.15rem", margin: "0.35rem 0 0.5rem" }}>Assess your skills</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Understand your confidence, gaps and what to develop next.
              </p>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>Start assessment →</span>
            </div>

            {/* 04 Opportunities */}
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/internships")}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>04 · OPPORTUNITIES</div>
              <h3 style={{ fontSize: "1.15rem", margin: "0.35rem 0 0.5rem" }}>Track internships</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Save roles and manage every application from Saved through Offer.
              </p>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>Open applications →</span>
            </div>

            {/* 05 Execute */}
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/focus")}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>05 · EXECUTE</div>
              <h3 style={{ fontSize: "1.15rem", margin: "0.35rem 0 0.5rem" }}>Focus mode</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Turn one important career task into a distraction-free work session.
              </p>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>Choose a task →</span>
            </div>

            {/* 06 Prepare */}
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/progress")}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>06 · PREPARE</div>
              <h3 style={{ fontSize: "1.15rem", margin: "0.35rem 0 0.5rem" }}>Career readiness</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Understand your preparation across the areas that matter most.
              </p>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>Explore readiness →</span>
            </div>

            {/* 07 Capture */}
            <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/notes")}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>07 · CAPTURE</div>
              <h3 style={{ fontSize: "1.15rem", margin: "0.35rem 0 0.5rem" }}>Notes &amp; evidence</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Capture learning, achievements and reflections, then connect them to your career journey.
              </p>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>Create your first note →</span>
            </div>

            {/* 08 Guidance */}
            <div
              className="card"
              style={{
                gridColumn: "span 2",
                background: "#1E2235",
                color: "#FFFFFF",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.75rem 2rem",
                borderRadius: "14px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/roadmap")}
            >
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", opacity: 0.8 }}>08 · GET GUIDANCE</div>
                <h3 className="editorial-h2" style={{ color: "#fff", margin: "0.4rem 0 0.5rem" }}>AI career assistant</h3>
                <p style={{ fontSize: "0.88rem", opacity: 0.85, maxWidth: "500px", margin: 0 }}>
                  Get contextual help with goals, milestones, job descriptions and applications—right where you work.
                </p>
              </div>
              <span style={{ fontSize: "1.75rem" }}>✨</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Dashboard (Design Reference 01)
  return (
    <div className="stack" style={{ gap: "2rem" }}>
      {/* Top Welcome Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="section-eyebrow">{todayFormatted}</div>
          <h1 className="editorial-h1">Good morning, {userName}.</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "640px", marginTop: "0.35rem" }}>
            You're on track this week. Keep your focus on portfolio evidence and application quality.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button type="button" className="btn-secondary" onClick={() => navigate("/roadmap")}>
            Review roadmap
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowAddTaskModal(true)}>
            Add a task +
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: "1.5rem" }}>
        <button
          type="button"
          className="btn-subtle"
          style={{
            borderBottom: activeTab === "this-week" ? "2px solid var(--primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.5rem 0.25rem",
            fontWeight: activeTab === "this-week" ? 600 : 400,
            color: activeTab === "this-week" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onClick={() => setActiveTab("this-week")}
        >
          This week
        </button>
        <button
          type="button"
          className="btn-subtle"
          style={{
            borderBottom: activeTab === "roadmap" ? "2px solid var(--primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.5rem 0.25rem",
            fontWeight: activeTab === "roadmap" ? 600 : 400,
            color: activeTab === "roadmap" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onClick={() => navigate("/roadmap")}
        >
          Roadmap
        </button>
        <button
          type="button"
          className="btn-subtle"
          style={{
            borderBottom: activeTab === "applications" ? "2px solid var(--primary)" : "2px solid transparent",
            borderRadius: 0,
            padding: "0.5rem 0.25rem",
            fontWeight: activeTab === "applications" ? 600 : 400,
            color: activeTab === "applications" ? "var(--text-primary)" : "var(--text-secondary)",
          }}
          onClick={() => navigate("/internships")}
        >
          Applications
        </button>
        <button
          type="button"
          className="btn-subtle"
          style={{
            marginLeft: "auto",
            padding: "0.5rem 0.25rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}
          onClick={() => setActiveTab("workspace")}
        >
          Feature workspace overview →
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1.25rem" }}>
        {/* Readiness */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.25rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "4px solid var(--primary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1 }}>{ready.score ?? 68}%</span>
            <span style={{ fontSize: "0.55rem", fontWeight: 600, color: "var(--text-muted)" }}>READY</span>
          </div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              CAREER READINESS
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", margin: "0.15rem 0" }}>
              Growing steadily
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Up 6% since last assessment
            </div>
          </div>
        </div>

        {/* Weekly focus */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            WEEKLY FOCUS
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)", margin: "0.25rem 0 0.5rem" }}>
            {hours > 0 ? `${hours}h` : "3h 40m"} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--text-muted)" }}>/ 5h</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, Math.max(30, (hours / 5) * 100))}%`, height: "100%", background: "var(--primary)" }}></div>
          </div>
        </div>

        {/* Applications */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            APPLICATIONS
          </div>
          <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)", margin: "0.25rem 0 0.4rem" }}>
            {activeOpportunities.length || 8} <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--text-secondary)" }}>active</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "var(--success)" }}>
            <span style={{ fontSize: "0.6rem" }}>●</span>
            <span>{interviewOpportunities.length || 2} interviews scheduled</span>
          </div>
        </div>

        {/* Streak card */}
        <div className="card" style={{ background: "var(--accent-tint)", borderColor: "rgba(224, 122, 95, 0.25)", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.75rem", color: "var(--accent)" }}>✨</span>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {streak.current > 0 ? `${streak.current} day streak` : "12 week streak"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              {streak.current > 0 ? `Longest: ${streak.longest} days` : "Your longest yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.75rem" }}>
        {/* Left Column: Weekly Plan & Application Pipeline */}
        <div className="stack" style={{ gap: "2rem" }}>
          {/* Weekly plan section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Weekly plan</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {completedTasks.length} of {store.tasks.length || 6} actions complete · 2h 20m remaining
                </span>
              </div>
              <Link to="/planner" style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--primary)" }}>
                Open planner →
              </Link>
            </div>

            {/* Priority this week banner */}
            <div
              style={{
                background: "var(--accent-tint)",
                borderLeft: "3px solid var(--accent)",
                padding: "0.85rem 1.1rem",
                borderRadius: "0 8px 8px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.06em" }}>
                  PRIORITY THIS WEEK
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text-primary)" }}>
                  Turn your data dashboard project into a concise portfolio case study.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "70px", height: "5px", background: "rgba(224, 122, 95, 0.3)", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ width: "60%", height: "100%", background: "var(--accent)" }}></div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)" }}>60%</span>
              </div>
            </div>

            {/* Action items list */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {store.tasks.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  No action items scheduled for this week.
                  <div style={{ marginTop: "0.5rem" }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowAddTaskModal(true)}>
                      Add an action item
                    </button>
                  </div>
                </div>
              ) : (
                store.tasks.slice(0, 5).map((t, idx) => {
                  const isDone = t.status === "completed";
                  return (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.85rem 1.25rem",
                        borderBottom: idx < 4 ? "1px solid var(--border-light)" : "none",
                        background: isDone ? "var(--bg-surface-subtle)" : "var(--bg-surface)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }}
                          onChange={async () => {
                            if (isDone) await reopenRoadmapTask(t, activeMilestone);
                            else await completeRoadmapTask(t, store.tasks, activeMilestone);
                            await store.refresh();
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 500,
                              color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                              textDecoration: isDone ? "line-through" : "none",
                            }}
                          >
                            {t.title}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Portfolio · {t.estimatedMinutes ?? 35} min
                          </div>
                        </div>
                      </div>

                      <div>
                        {isDone ? (
                          <span className="status-pill pill-neutral">Completed</span>
                        ) : idx === 1 ? (
                          <span className="status-pill pill-accent">Today</span>
                        ) : (
                          <span className="status-pill pill-neutral">Due Wed</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Application pipeline section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Application pipeline</h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  A clear view of your most active opportunities
                </span>
              </div>
              <Link to="/internships" style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--primary)" }}>
                View all {store.opportunities.length || 8} →
              </Link>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 1.5fr",
                  padding: "0.6rem 1.25rem",
                  background: "var(--bg-surface-subtle)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>COMPANY &amp; ROLE</div>
                <div>STAGE</div>
                <div>NEXT ACTION</div>
              </div>

              {store.opportunities.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                  No internship applications tracked yet.
                  <div style={{ marginTop: "0.5rem" }}>
                    <Link to="/internships" className="btn-secondary" style={{ display: "inline-block" }}>
                      Open Internship Tracker
                    </Link>
                  </div>
                </div>
              ) : (
                store.opportunities.slice(0, 4).map((opp, idx) => (
                  <div
                    key={opp.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1.2fr 1.5fr",
                      padding: "0.85rem 1.25rem",
                      borderBottom: idx < 3 ? "1px solid var(--border-light)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          background: idx % 2 === 0 ? "var(--primary)" : "#1E2235",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                        }}
                      >
                        {opp.company[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{opp.company}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{opp.role}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 500 }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: opp.status === "Interview" ? "var(--info)" : "var(--accent)",
                        }}
                      ></span>
                      <span>{opp.status}</span>
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {opp.nextAction ?? "Practice interview · Fri"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Up Next Deep Work Card */}
        <div>
          <div
            className="card"
            style={{
              background: "var(--bg-surface-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "1.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)" }}>
                UP NEXT
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Today · 2:00 PM</span>
            </div>

            <h2 className="editorial-h2" style={{ margin: "0.75rem 0 0.5rem", fontSize: "1.5rem" }}>
              {activeMilestone?.title ?? "Build a stronger project story"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 1.25rem" }}>
              {activeMilestone?.objective ?? "Convert your dashboard project into evidence that recruiters can quickly understand."}
            </p>

            {/* Milestone context tag */}
            <div
              style={{
                background: "var(--accent-tint)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.06em" }}>
                  MILESTONE 2 OF 4
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>Portfolio ready</div>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Dec 06</span>
            </div>

            {/* Focus Goal scratch */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>
                Focus goal
              </label>
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.65rem 0.85rem",
                  fontSize: "0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Add measurable project outcomes</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>42 / 80</span>
              </div>
            </div>

            {/* Suggested session */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ textAlign: "center", borderRight: "1px solid var(--border)", paddingRight: "1rem" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>25</div>
                <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase" }}>MIN</div>
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Deep work sprint</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>One task, notifications off</div>
              </div>
            </div>

            {/* Before you begin checks */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                Before you begin
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.82rem", color: "var(--text-primary)" }}>
                <div>✓ Open your project metrics</div>
                <div>✓ Choose one key outcome</div>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.92rem", justifyContent: "center" }}
              onClick={() => navigate("/focus")}
            >
              Start focus session →
            </button>

            <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
              <Link to="/roadmap" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                View milestone details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowAddTaskModal(false); }}>
          <div className="dialog-panel">
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Add Action Item</h2>
            <form onSubmit={(e) => { e.preventDefault(); void handleAddTask(); }} className="stack">
              <label>
                Action description
                <input
                  autoFocus
                  required
                  placeholder="e.g. Draft case study problem statement"
                  value={taskDraft.title}
                  onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })}
                />
              </label>

              <label>
                Related milestone
                <select
                  value={taskDraft.milestoneId}
                  onChange={(e) => setTaskDraft({ ...taskDraft, milestoneId: e.target.value })}
                >
                  <option value="">{activeMilestone?.title ?? "General Career Action"}</option>
                  {store.milestones.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </label>

              <label>
                Estimated time (minutes)
                <select
                  value={taskDraft.minutes}
                  onChange={(e) => setTaskDraft({ ...taskDraft, minutes: e.target.value })}
                >
                  <option value="15">15 minutes</option>
                  <option value="25">25 minutes (1 Pomodoro)</option>
                  <option value="35">35 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </label>

              <div className="row" style={{ marginTop: "0.5rem" }}>
                <button type="submit" className="btn-primary">Add to Weekly Plan</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
