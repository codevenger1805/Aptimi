import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { completeMilestone, reopenMilestone, completeRoadmapTask, reopenRoadmapTask } from "../../data/completeActions";
import { nowIso, repos, newId } from "../../data/repositories";
import { useToast } from "../../store/toast";
import type { Note } from "../../domain/types";

export function MilestoneDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useAppStore();
  const toast = useToast((s) => s.show);

  const milestone = store.milestones.find((m) => m.id === id) || store.milestones[0];
  const phase = store.phases.find((p) => p.id === milestone?.phaseId) || store.phases[0];
  const tasks = store.tasks.filter((t) => t.milestoneId === milestone?.id);

  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [learnReflection, setLearnReflection] = useState("");
  const [differentlyReflection, setDifferentlyReflection] = useState("");

  if (!milestone) {
    return (
      <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Milestone not found</h2>
        <button type="button" className="btn-primary" onClick={() => navigate("/roadmap")}>
          Back to Roadmap
        </button>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const isCompleted = milestone.status === "completed";

  async function handleToggleTask(task: typeof tasks[0]) {
    if (task.status === "completed") {
      await reopenRoadmapTask(task, milestone);
    } else {
      await completeRoadmapTask(task, store.tasks, milestone);
    }
    await store.refresh();
  }

  async function handleSaveWork() {
    if (!store.profile || (!evidenceText.trim() && !evidenceLink.trim())) return;
    const t = nowIso();
    const note: Note = {
      id: newId(),
      profileId: store.profile.id,
      title: `Evidence: ${milestone.title}`,
      body: `${evidenceText.trim()}${evidenceLink ? `\n\nLink: ${evidenceLink}` : ""}`,
      kind: "evidence",
      linkedEntityType: "milestone",
      linkedEntityId: milestone.id,
      createdAt: t,
      updatedAt: t,
    };
    await repos.notes.put(note);
    if (learnReflection.trim() || differentlyReflection.trim()) {
      const refNote: Note = {
        id: newId(),
        profileId: store.profile.id,
        title: `Reflection: ${milestone.title}`,
        body: `Learned: ${learnReflection}\nDifferently: ${differentlyReflection}`,
        kind: "reflection",
        linkedEntityType: "milestone",
        linkedEntityId: milestone.id,
        createdAt: t,
        updatedAt: t,
      };
      await repos.notes.put(refNote);
    }
    await store.refresh();

    setEvidenceText("");
    setEvidenceLink("");
    toast("Work and reflection saved as evidence");
  }

  async function handleToggleMilestoneComplete() {
    if (isCompleted) {
      await reopenMilestone(milestone);
      toast("Milestone reopened");
    } else {
      await completeMilestone(milestone);
      toast("Milestone completed! +25 points awarded");
    }
    await store.refresh();
  }

  return (
    <div className="stack" style={{ gap: "2rem" }}>
      {/* Breadcrumb Bar */}
      <nav className="breadcrumb-nav" aria-label="Milestone Breadcrumb">
        <Link to="/roadmap" style={{ color: "var(--text-secondary)" }}>Career Roadmap</Link>
        <span style={{ color: "var(--border-dark)" }}>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{phase?.title ?? "Product Analytics"}</span>
        <span style={{ color: "var(--border-dark)" }}>/</span>
        <span className="breadcrumb-active">{milestone.title}</span>
      </nav>

      {/* Top Milestone Hero Header */}
      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "2rem",
          padding: "2rem",
          borderRadius: "16px",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
            MILESTONE · {phase?.title ?? "PRODUCT ANALYTICS"}
          </div>
          <h1 className="editorial-h1" style={{ margin: "0.4rem 0 0.5rem", fontSize: "2rem" }}>
            {milestone.title}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 1.25rem" }}>
            {milestone.objective ?? "Learn how product teams use metrics to understand user behavior and make better decisions."}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>PHASE</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{phase?.title ?? "Product Analytics"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>DIFFICULTY</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{milestone.difficulty ?? "Beginner"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>ESTIMATED TIME</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>2.5 hours</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>DUE</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{milestone.targetDate ?? "12 October"}</span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>PROGRESS</span>
              <span style={{ fontWeight: 600, color: isCompleted ? "var(--success)" : "var(--accent)" }}>
                {isCompleted ? "Completed" : "In progress"}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Graphics Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E2235 0%, #2A3048 100%)",
            borderRadius: "12px",
            padding: "1.5rem",
            color: "#FFFFFF",
            minHeight: "160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em" }}>
            <span style={{ color: "var(--accent)" }}>ACTIVATION</span>
            <span style={{ color: "var(--warning-light)" }}>RETENTION</span>
          </div>

          <div style={{ textAlign: "center", margin: "1rem 0" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.04em" }}>QUESTION → SIGNAL → DECISION</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "0.25rem" }}>Metrics make product behavior visible.</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            <span className="status-pill" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.7rem" }}>Funnels</span>
            <span className="status-pill" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.7rem" }}>Cohorts</span>
            <span className="status-pill" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.7rem" }}>North Star</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Execution Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Left Column: 5 Sequential Execution Sections */}
        <div className="stack" style={{ gap: "2rem" }}>
          {/* 01 OBJECTIVE */}
          <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
              <span className="editorial-number" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>01</span>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  OBJECTIVE
                </div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Know which numbers matter—and why.</h2>
              </div>
            </div>

            <div
              style={{
                background: "var(--bg-surface-subtle)",
                borderRadius: "10px",
                padding: "1.1rem 1.25rem",
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                gap: "1rem",
                alignItems: "center",
                fontSize: "0.82rem",
              }}
            >
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>By the end of this milestone, you should be able to:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>1</span>
                <span>Distinguish activation &amp; retention</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>2</span>
                <span>Choose metrics for a product goal</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>3</span>
                <span>Explain what metric changes mean</span>
              </div>
            </div>
          </div>

          {/* 02 WHAT TO LEARN */}
          <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <span className="editorial-number" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>02</span>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  WHAT TO LEARN
                </div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Two useful places to start</h2>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Curated for this milestone—no giant resource library.</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Resource 1 */}
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", background: "var(--bg-surface)" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--info)", letterSpacing: "0.06em" }}>
                  RECOMMENDED READING · 12 MIN
                </div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 600, margin: "0.35rem 0 0.4rem" }}>
                  Product metrics that tell a useful story
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Learn the difference between activation, retention and conversion—and when each matters.
                </p>
                <a
                  href="#reading"
                  onClick={(e) => { e.preventDefault(); toast("Opening curated reading summary"); }}
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)" }}
                >
                  Open reading →
                </a>
              </div>

              {/* Resource 2 */}
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", background: "var(--bg-surface)" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.06em" }}>
                  RECOMMENDED VIDEO · 18 MIN
                </div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 600, margin: "0.35rem 0 0.4rem" }}>
                  From product goal to metric tree
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  Watch a practical walkthrough of turning a broad objective into measurable product signals.
                </p>
                <a
                  href="#video"
                  onClick={(e) => { e.preventDefault(); toast("Opening curated video breakdown"); }}
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)" }}
                >
                  Watch video →
                </a>
              </div>
            </div>
          </div>

          {/* 03 ACTIONS */}
          <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span className="editorial-number" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>03</span>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  ACTIONS
                </div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Put the ideas into practice</h2>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {tasks.length === 0 ? (
                <div style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No subtasks generated yet. Use the action checklist below.
                </div>
              ) : (
                tasks.map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.85rem 1.1rem",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: isDone ? "var(--bg-surface-subtle)" : "var(--bg-surface)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }}
                          onChange={() => void handleToggleTask(task)}
                        />
                        <span
                          style={{
                            fontSize: "0.88rem",
                            fontWeight: 500,
                            color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: isDone ? "line-through" : "none",
                          }}
                        >
                          {task.title}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {task.estimatedMinutes ?? 30} min
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 04 YOUR WORK */}
          <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span className="editorial-number" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>04</span>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  YOUR WORK
                </div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Add your analysis</h2>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Keep your notes, link or finished submission connected to this milestone.</div>
              </div>
            </div>

            <div
              style={{
                border: "1px dashed var(--border-dark)",
                borderRadius: "10px",
                padding: "1.5rem",
                background: "var(--bg-surface-subtle)",
              }}
            >
              <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                What did the data tell you?
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Drop a file, paste a link or write your analysis directly into APTIMI.
              </p>

              <div className="stack" style={{ gap: "0.75rem" }}>
                <textarea
                  placeholder="Paste your findings, metric interpretation, or SQL query snippet here..."
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  style={{ minHeight: "80px" }}
                />
                <input
                  placeholder="Optional project link (e.g. Google Doc, GitHub, Figma, Notion)..."
                  value={evidenceLink}
                  onChange={(e) => setEvidenceLink(e.target.value)}
                />
                <div>
                  <button type="button" className="btn-secondary" onClick={handleSaveWork}>
                    + Add to workspace evidence
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 05 REFLECTION */}
          <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span className="editorial-number" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>05</span>
              <div>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  REFLECTION
                </div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Make the learning stick</h2>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <label>
                What did you learn?
                <textarea
                  placeholder="Capture the most useful idea in your own words..."
                  value={learnReflection}
                  onChange={(e) => setLearnReflection(e.target.value)}
                  style={{ minHeight: "90px" }}
                />
              </label>

              <label>
                What would you do differently?
                <textarea
                  placeholder="Think about how you would approach the analysis next time..."
                  value={differentlyReflection}
                  onChange={(e) => setDifferentlyReflection(e.target.value)}
                  style={{ minHeight: "90px" }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Current Milestone Status Sidebar */}
        <div style={{ position: "sticky", top: "80px" }}>
          <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
            <div style={{ borderTop: "3px solid var(--accent)", paddingTop: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                CURRENT MILESTONE
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", margin: "0.35rem 0" }}>
                <span style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>
                  {completedTasks.length} <span style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--text-muted)" }}>/ {tasks.length || 3}</span>
                </span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>ACTIONS COMPLETE</span>
              </div>
              <div style={{ width: "100%", height: "5px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ width: `${tasks.length ? (completedTasks.length / tasks.length) * 100 : 66}%`, height: "100%", background: "var(--accent)" }}></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid var(--border-light)" }}>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>DUE</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{milestone.targetDate ?? "12 Oct"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>DIFFICULTY</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{milestone.difficulty ?? "Beginner"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>TIME LEFT</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>25 min</div>
              </div>
            </div>

            <div style={{ padding: "1rem 0", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                PREREQUISITE
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 500 }}>
                <span style={{ color: "var(--success)" }}>✓</span>
                <span>PM Foundations (Completed)</span>
              </div>
            </div>

            <div style={{ padding: "1rem 0 1.5rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                NEXT IN YOUR ROADMAP
              </div>
              <div style={{ borderLeft: "3px solid var(--info)", paddingLeft: "0.65rem" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>SQL fundamentals</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Use queries to explore product behavior in real data.</div>
              </div>
            </div>

            <button
              type="button"
              className={isCompleted ? "btn-secondary" : "btn-primary"}
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
              onClick={handleToggleMilestoneComplete}
            >
              {isCompleted ? "✓ Reopen Milestone" : "✓ MARK AS COMPLETE"}
            </button>

            <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
              <Link to="/roadmap" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Save progress &amp; return to roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
