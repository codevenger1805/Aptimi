import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { calculateReadinessProfile, type ReadinessDimensionId } from "../../domain/readiness";

export function ReadinessPage() {
  const store = useAppStore();
  const navigate = useNavigate();

  const profile = store.profile;
  const targetRole = profile?.targetRole || "Product Management";

  const { overall, dimensions } = useMemo(() => {
    return calculateReadinessProfile({
      skills: store.skills,
      milestones: store.milestones,
      tasks: store.tasks,
      notes: store.notes,
      opportunities: store.opportunities,
      focusSessions: store.focusSessions,
    });
  }, [store.skills, store.milestones, store.tasks, store.notes, store.opportunities, store.focusSessions]);

  const score = overall.score ?? 64;

  const dimMap = useMemo(() => {
    return Object.fromEntries(dimensions.map((d) => [d.id, d])) as Record<ReadinessDimensionId, typeof dimensions[0]>;
  }, [dimensions]);

  const getDimensionValue = (id: ReadinessDimensionId, fallback: number) => {
    return dimMap[id]?.score ?? fallback;
  };

  return (
    <div className="stack" style={{ gap: "2.5rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="section-eyebrow">CAREER READINESS PROFILE</div>
          <h1 className="editorial-h1">Your route to {targetRole}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
            See where you are now, what is shaping your readiness, and the most useful move toward your target role.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.4rem 0.75rem" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>
              DESTINATION
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{targetRole}</span>
          </div>
          <button type="button" className="btn-secondary" onClick={() => void store.refresh()}>
            Refresh profile
          </button>
        </div>
      </div>

      {/* Top Status Summary Bar */}
      <div
        style={{
          background: "var(--primary)",
          color: "#FFFFFF",
          borderRadius: "10px",
          padding: "1rem 1.75rem",
          display: "grid",
          gridTemplateColumns: "1.2fr 1.5fr 1.5fr 1.2fr",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75 }}>
            CURRENT STATUS
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ color: "var(--success-light)", fontSize: "0.6rem" }}>●</span>
            Building application readiness
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75 }}>
            STRONGEST SIGNALS
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, marginTop: "0.2rem" }}>
            Communication · Product thinking
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75 }}>
            ROUTE NEEDS ATTENTION
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, marginTop: "0.2rem" }}>
            Analytics · Interview practice
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.75 }}>
            PROFILE BASIS
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, marginTop: "0.2rem" }}>
            Assessment + roadmap activity
          </div>
        </div>
      </div>

      {/* Centerpiece Radial Gauge & 8 Dimension Meters */}
      <div
        className="card"
        style={{
          padding: "3rem 2.5rem",
          borderRadius: "16px",
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr 1fr",
          gap: "2.5rem",
          alignItems: "center",
        }}
      >
        {/* Left 4 Dimensions */}
        <div className="stack" style={{ gap: "1.75rem" }}>
          {/* 1. Skill Capability */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Skill Capability</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>
                {getDimensionValue("skillCapability", 70)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("skillCapability", 70)}%`, height: "100%", background: "#3D405B" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Developing well</div>
          </div>

          {/* 2. Practical Readiness */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Practical Readiness</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent)" }}>
                {getDimensionValue("practicalEvidence", 50)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("practicalEvidence", 50)}%`, height: "100%", background: "#E07A5F" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Needs application</div>
          </div>

          {/* 3. Execution Consistency */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Execution Consistency</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--success)" }}>
                {getDimensionValue("executionConsistency", 75)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("executionConsistency", 75)}%`, height: "100%", background: "#81B29A" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Consistent</div>
          </div>

          {/* 4. Communication */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Communication</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--info)" }}>
                {getDimensionValue("communication", 80)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("communication", 80)}%`, height: "100%", background: "#2563EB" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Current strength</div>
          </div>
        </div>

        {/* Center Radial SVG Gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            CURRENT POSITION
          </div>

          <div style={{ position: "relative", width: "260px", height: "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: "rotate(-90deg)" }}>
              {/* Background circular track */}
              <circle
                cx="130"
                cy="130"
                r="105"
                fill="none"
                stroke="var(--border-light)"
                strokeWidth="14"
              />
              {/* Segmented dashed progress ring */}
              <circle
                cx="130"
                cy="130"
                r="105"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="14"
                strokeDasharray={`${(score / 100) * 660} 660`}
                strokeLinecap="round"
              />
              {/* Inner decorative indicator ticks */}
              <circle
                cx="130"
                cy="130"
                r="86"
                fill="none"
                stroke="var(--success-light)"
                strokeWidth="6"
                strokeDasharray="12 28"
                opacity="0.8"
              />
            </svg>

            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "3.75rem", fontWeight: 700, lineHeight: 1, color: "var(--text-primary)" }}>
                {score}<span style={{ fontSize: "1.75rem", fontWeight: 500, color: "var(--text-secondary)" }}>%</span>
              </div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                CAREER READY
              </div>
              <div style={{ width: "36px", height: "2px", background: "var(--accent)", margin: "0.5rem auto 0.4rem" }}></div>
              <div style={{ fontFamily: "var(--font-editorial)", fontStyle: "italic", fontSize: "1.2rem", color: "var(--text-primary)" }}>
                Building momentum
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", maxWidth: "340px", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>● Not application-ready yet: </span>
            You have a clear direction and solid core skills. Closing two priority gaps will make your profile substantially stronger.
          </div>
        </div>

        {/* Right 4 Dimensions */}
        <div className="stack" style={{ gap: "1.75rem" }}>
          {/* 5. Analytical Ability */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Analytical Ability</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--warning)" }}>
                {getDimensionValue("analyticalAbility", 55)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("analyticalAbility", 55)}%`, height: "100%", background: "#F2CC8F" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Build more depth</div>
          </div>

          {/* 6. Interview Readiness */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Interview Readiness</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent)" }}>
                {getDimensionValue("interviewReadiness", 40)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("interviewReadiness", 40)}%`, height: "100%", background: "#E07A5F" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Priority area</div>
          </div>

          {/* 7. Career Materials */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Career Materials</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--warning)" }}>
                {getDimensionValue("careerMaterials", 60)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("careerMaterials", 60)}%`, height: "100%", background: "#F2CC8F" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Needs tailoring</div>
          </div>

          {/* 8. Target Role Alignment */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Target Role Alignment</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--success)" }}>
                {getDimensionValue("targetRoleAlignment", 80)}
              </span>
            </div>
            <div style={{ width: "100%", height: "7px", background: "var(--bg-surface-muted)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ width: `${getDimensionValue("targetRoleAlignment", 80)}%`, height: "100%", background: "#81B29A" }}></div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>Strong alignment</div>
          </div>
        </div>
      </div>

      {/* Cards 01 & 02: What is moving you forward & What is holding you back */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem" }}>
        {/* Card 01: Advantage */}
        <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span className="editorial-number" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>01</span>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                YOUR ADVANTAGE
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>What is moving you forward</h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ borderLeft: "3px solid var(--success)", paddingLeft: "0.75rem" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>Communication</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>
                You explain product decisions clearly and adapt them for different audiences.
              </div>
            </div>

            <div style={{ borderLeft: "3px solid var(--info)", paddingLeft: "0.75rem" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>Product thinking</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>
                You frame user problems well and connect them to business priorities.
              </div>
            </div>
          </div>
        </div>

        {/* Card 02: Development Route */}
        <div className="card" style={{ padding: "1.75rem", borderRadius: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <span className="editorial-number" style={{ fontSize: "1.5rem", color: "var(--accent)" }}>02</span>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                DEVELOPMENT ROUTE
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>What is holding you back</h2>
            </div>
          </div>

          <div className="stack" style={{ gap: "0.85rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                background: "var(--bg-surface-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--warning-tint)",
                    color: "var(--warning)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  A
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Analytics &amp; SQL</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Build confidence turning product data into decisions.
                  </div>
                </div>
              </div>
              <span className="status-pill pill-accent" style={{ fontSize: "0.7rem" }}>PRIORITY</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                background: "var(--bg-surface-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  B
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>Interview readiness</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Practise product sense and behavioural answers aloud.
                  </div>
                </div>
              </div>
              <span className="status-pill pill-neutral" style={{ fontSize: "0.7rem" }}>NEXT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 03: Recommended Next Stop */}
      <div
        style={{
          background: "var(--primary)",
          color: "#FFFFFF",
          borderRadius: "14px",
          padding: "2rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8 }}>
              RECOMMENDED NEXT STOP
            </span>
            <span className="editorial-number" style={{ fontSize: "1.2rem", color: "var(--accent)", fontStyle: "italic" }}>03</span>
          </div>

          <h2 className="editorial-h2" style={{ color: "#fff", margin: "0 0 0.5rem" }}>
            Build a product analytics case study
          </h2>
          <p style={{ fontSize: "0.9rem", opacity: 0.85, maxWidth: "600px", margin: "0 0 1rem" }}>
            Use one project to show how you found an insight, made a product decision and measured the result.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", fontSize: "0.8rem", opacity: 0.9 }}>
            <span>⏱ 45-minute first step</span>
            <span>•</span>
            <span>Improves 3 readiness areas</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="btn"
            style={{
              background: "#FFFFFF",
              color: "var(--primary)",
              fontWeight: 600,
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
            }}
            onClick={() => navigate("/roadmap")}
          >
            Improve my readiness →
          </button>
        </div>
      </div>
    </div>
  );
}
