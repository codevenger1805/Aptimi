import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { nowIso, repos } from "../../data/repositories";
import type { Skill } from "../../domain/types";

interface SkillAssessmentMeta {
  name: string;
  subtitle: string;
  description: string;
  levelExplanations: Record<number, string>;
  examplePlaceholder: string;
}

const ASSESSMENT_SKILLS: SkillAssessmentMeta[] = [
  {
    name: "Product Thinking",
    subtitle: "Framing problems and priorities",
    description: "Turning customer and business problems into clear product opportunities, priorities and decisions.",
    levelExplanations: {
      1: "You are exploring basic product terms and concepts.",
      2: "You understand common frameworks like Jobs-to-be-Done and problem trees.",
      3: "You can frame a product problem and contribute to prioritisation when given context or guidance.",
      4: "You independently define product problems, user personas, and measurable success metrics.",
      5: "You formulate holistic product strategy and mentor others in structured discovery.",
    },
    examplePlaceholder: "In a university project, I helped define the user problem and prioritised features for our first prototype.",
  },
  {
    name: "User Research",
    subtitle: "Learning from users",
    description: "Synthesizing qualitative user signals into actionable requirements and insights.",
    levelExplanations: {
      1: "You have not conducted user interviews or usability tests yet.",
      2: "You understand when to use surveys versus exploratory interviews.",
      3: "You can write semi-structured interview scripts and extract recurring pain points with support.",
      4: "You independently recruit users, run usability checks, and synthesize actionable findings.",
      5: "You design research roadmaps and establish continuous user feedback loops.",
    },
    examplePlaceholder: "Conducted 5 user interviews with students to understand course registration friction.",
  },
  {
    name: "Communication",
    subtitle: "Clear, influential communication",
    description: "Conveying technical and strategic trade-offs across design, engineering, and stakeholders.",
    levelExplanations: {
      1: "You communicate basic project status.",
      2: "You write structured summaries and present ideas with slide decks.",
      3: "You can explain trade-offs clearly and adapt message depth to your audience.",
      4: "You facilitate alignment meetings and author concise PRDs and decision memos.",
      5: "You resolve executive-level disagreements with compelling written narratives.",
    },
    examplePlaceholder: "Presented prototype findings to faculty advisers and adjusted scope based on critique.",
  },
  {
    name: "Analytics",
    subtitle: "Using data to make decisions",
    description: "Interpreting funnels, retention curves, activation metrics, and cohort health.",
    levelExplanations: {
      1: "You know basic vanity metrics from actionable metrics.",
      2: "You understand DAU/MAU, conversion rates, and funnel drop-off points.",
      3: "You can define a North Star metric and break down a product funnel.",
      4: "You independently formulate metric hypotheses and design A/B experiment scorecards.",
      5: "You diagnose complex retention anomalies and build automated product dashboards.",
    },
    examplePlaceholder: "Analyzed funnel drop-off in our student club onboarding form to improve sign-ups by 20%.",
  },
  {
    name: "SQL",
    subtitle: "Working with product data",
    description: "Querying relational data, aggregations, joins, and event streams without engineering dependency.",
    levelExplanations: {
      1: "You are learning basic SELECT and WHERE statements.",
      2: "You can filter, sort, and execute simple single-table queries.",
      3: "You can write multi-table JOINs, GROUP BY aggregations, and date truncations.",
      4: "You write window functions, subqueries, and calculate cohort retention matrices.",
      5: "You optimize complex analytical queries and model event schemas.",
    },
    examplePlaceholder: "Wrote queries in PostgreSQL joining user signups to daily active sessions.",
  },
  {
    name: "Leadership",
    subtitle: "Creating clarity and momentum",
    description: "Driving cross-functional execution without direct authority.",
    levelExplanations: {
      1: "You participate as an individual contributor in group projects.",
      2: "You help keep teammates accountable to deadlines.",
      3: "You organize project backlogs and unblock peers when ambiguities arise.",
      4: "You rally cross-functional teams around a shared vision and ship on schedule.",
      5: "You build high-trust culture and navigate complex organisational politics.",
    },
    examplePlaceholder: "Led a team of 4 in a 48-hour hackathon to deliver a working demo.",
  },
  {
    name: "Problem Solving",
    subtitle: "Structuring ambiguous problems",
    description: "Deconstructing open-ended business dilemmas into testable hypotheses.",
    levelExplanations: {
      1: "You prefer well-defined problems with clear instructions.",
      2: "You can break a problem down using MECE issue trees.",
      3: "You formulate hypotheses and identify root causes with structured frameworks.",
      4: "You navigate high-ambiguity environments and evaluate strategic trade-offs under uncertainty.",
      5: "You pioneer novel business models and solve complex systemic bottlenecks.",
    },
    examplePlaceholder: "Structured an ambiguous campus food waste issue into 3 actionable test pilots.",
  },
];

export function AssessmentPage() {
  const store = useAppStore();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMeta = ASSESSMENT_SKILLS[currentIndex];
  const totalSkills = ASSESSMENT_SKILLS.length;

  const existingSkill = store.skills.find(
    (s) => s.name.toLowerCase() === currentMeta.name.toLowerCase()
  );

  const [level, setLevel] = useState<number>(existingSkill?.currentLevel ?? 3);
  const [confidence, setConfidence] = useState<number>(existingSkill?.confidence ?? 2);
  const [evidenceNote, setEvidenceNote] = useState<string>(existingSkill?.evidenceNote ?? "");
  const [targetLevel, setTargetLevel] = useState<number>(existingSkill?.targetLevel ?? 4);

  // Sync state when switching skills
  useEffect(() => {
    const s = store.skills.find((x) => x.name.toLowerCase() === currentMeta.name.toLowerCase());
    setLevel(s?.currentLevel ?? 3);
    setConfidence(s?.confidence ?? 2);
    setEvidenceNote(s?.evidenceNote ?? "");
    setTargetLevel(s?.targetLevel ?? 4);
  }, [currentIndex, store.skills]);

  async function saveCurrentSkill() {
    if (!store.profile) return;
    const t = nowIso();
    const existing = store.skills.find(
      (s) => s.name.toLowerCase() === currentMeta.name.toLowerCase()
    );

    const updated: Skill = {
      id: existing?.id ?? crypto.randomUUID(),
      profileId: store.profile.id,
      name: currentMeta.name,
      currentLevel: level,
      targetLevel,
      weight: existing?.weight ?? 1,
      confidence,
      evidenceNote,
      assessedAt: t,
    };

    await repos.skills.put(updated);
    await store.refresh();
  }

  async function handleNext() {
    await saveCurrentSkill();
    if (currentIndex < totalSkills - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/progress");
    }
  }

  async function handleSaveAndExit() {
    await saveCurrentSkill();
    navigate("/");
  }

  const progressPercent = Math.round(((currentIndex + 1) / totalSkills) * 100);

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
        <div>
          <div className="section-eyebrow">STEP 5 · CAREER ASSESSMENT</div>
          <h1 className="editorial-h1">Map your current capabilities</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
            Assess practical skills for a Product Management path. Honest starting points help APTIMI build a roadmap that focuses on the right gaps.
          </p>
        </div>

        <div style={{ textAlign: "right", minWidth: "160px" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
            Assessment progress <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>{currentIndex + 1} of {totalSkills} skills</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "var(--border)", borderRadius: "9999px", overflow: "hidden", margin: "0.4rem 0" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s ease" }}></div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Saved automatically · Resume anytime</div>
        </div>
      </div>

      {/* Main Grid: Left Skill List and Right Active Assessment Question Card */}
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2.5rem", alignItems: "start" }}>
        {/* Left Skill List */}
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "1rem" }}>
            PRODUCT MANAGEMENT · CORE CAPABILITIES
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ASSESSMENT_SKILLS.map((sk, idx) => {
              const isCurrent = currentIndex === idx;
              const hasRated = store.skills.some(
                (s) => s.name.toLowerCase() === sk.name.toLowerCase() && s.currentLevel != null
              );
              return (
                <div
                  key={sk.name}
                  onClick={async () => {
                    await saveCurrentSkill();
                    setCurrentIndex(idx);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.65rem 0.75rem",
                    borderRadius: "10px",
                    background: isCurrent ? "var(--bg-surface)" : "transparent",
                    border: isCurrent ? "1px solid var(--border)" : "1px solid transparent",
                    boxShadow: isCurrent ? "var(--shadow-xs)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: isCurrent ? "var(--primary)" : hasRated ? "var(--success)" : "var(--bg-surface-muted)",
                      color: isCurrent || hasRated ? "#fff" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {hasRated && !isCurrent ? "✓" : idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: isCurrent ? 600 : 500, color: "var(--text-primary)" }}>
                      {sk.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{sk.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "2.5rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "var(--success)", fontSize: "0.9rem" }}>✓</span>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              <strong>There are no wrong answers</strong><br />
              Choose the level you can demonstrate today—not the level you think you should have.
            </div>
          </div>
        </div>

        {/* Right Active Assessment Question Card */}
        <div className="card" style={{ padding: "2.5rem", borderRadius: "16px", minHeight: "560px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="stack" style={{ gap: "2rem" }}>
            {/* Skill Header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.25rem" }}>🎯</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  SKILL {currentIndex + 1} OF {totalSkills}
                </span>
              </div>
              <h2 className="editorial-h2" style={{ margin: "0.4rem 0 0.5rem" }}>{currentMeta.name}</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                {currentMeta.description}
              </p>
            </div>

            {/* Current Level Selector (1 to 5) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Where are you today?</label>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  CURRENT LEVEL
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "0.65rem" }}>
                {[
                  { num: 1, title: "Exploring", desc: "I'm new to this skill" },
                  { num: 2, title: "Learning", desc: "I understand the basics" },
                  { num: 3, title: "Practising", desc: "I can apply it with support" },
                  { num: 4, title: "Independent", desc: "I use it confidently" },
                  { num: 5, title: "Advanced", desc: "I can guide others" },
                ].map((lvl) => {
                  const isSelected = level === lvl.num;
                  return (
                    <div
                      key={lvl.num}
                      onClick={() => setLevel(lvl.num)}
                      style={{
                        padding: "1rem 0.75rem",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: isSelected ? "var(--primary-tint)" : "var(--bg-surface)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "4px",
                          background: isSelected ? "var(--primary)" : "var(--bg-surface-muted)",
                          color: isSelected ? "#fff" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          marginBottom: "0.35rem",
                        }}
                      >
                        {lvl.num}
                      </div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{lvl.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.3 }}>{lvl.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Level Description Banner */}
              <div
                style={{
                  marginTop: "0.85rem",
                  background: "var(--bg-surface-subtle)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--success)",
                  borderRadius: "0 8px 8px 0",
                  padding: "0.75rem 1rem",
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "var(--success)", fontWeight: 700 }}>✓</span>
                <span>
                  <strong>Level {level} · {level === 1 ? "Exploring" : level === 2 ? "Learning" : level === 3 ? "Practising" : level === 4 ? "Independent" : "Advanced"}:</strong>{" "}
                  {currentMeta.levelExplanations[level]}
                </span>
              </div>
            </div>

            {/* Confidence in Rating */}
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                How confident are you in this rating?
              </label>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0 0 0.65rem" }}>
                Confidence helps us decide whether to suggest practice, evidence or deeper learning.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
                {[
                  { val: 1, label: "Not yet confident" },
                  { val: 2, label: "Somewhat confident" },
                  { val: 3, label: "Confident" },
                ].map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    className={`btn-secondary ${confidence === c.val ? "btn-primary" : ""}`}
                    style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                    onClick={() => setConfidence(c.val)}
                  >
                    {c.label} {confidence === c.val ? "✓" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Textarea & Target Level */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem", alignItems: "start" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Evidence or example <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  placeholder={currentMeta.examplePlaceholder}
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  style={{ minHeight: "75px", marginTop: "0.4rem" }}
                />
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  A project, module, society role or work example is enough.
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Target level</label>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.25rem 0 0.5rem" }}>
                  Where do you want to reach?
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[
                    { num: 3, label: "Practising" },
                    { num: 4, label: "Independent" },
                    { num: 5, label: "Advanced" },
                  ].map((t) => (
                    <button
                      key={t.num}
                      type="button"
                      className={`btn-secondary ${targetLevel === t.num ? "btn-primary" : ""}`}
                      style={{ flex: 1, padding: "0.5rem 0.25rem", fontSize: "0.78rem", flexDirection: "column", gap: "0.1rem" }}
                      onClick={() => setTargetLevel(t.num)}
                    >
                      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.num}</span>
                      <span style={{ fontSize: "0.7rem" }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bottom Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "2.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              className="btn-subtle"
              onClick={handleSaveAndExit}
              style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
            >
              Save &amp; exit
            </button>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {currentIndex > 0 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={async () => {
                    await saveCurrentSkill();
                    setCurrentIndex(currentIndex - 1);
                  }}
                >
                  Back
                </button>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
              >
                {currentIndex < totalSkills - 1 ? "Save & continue" : "View Career Readiness →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
