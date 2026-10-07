import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { skillsForPreset } from "../../domain/skillCatalog";
import { generateRoadmap } from "../../domain/roadmapGenerator";
import { newId, nowIso, repos } from "../../data/repositories";
import type { EducationLevel, RolePresetId, Skill } from "../../domain/types";

export function OnboardingPage() {
  const profile = useAppStore((s) => s.profile);
  const saveProfile = useAppStore((s) => s.saveProfile);
  const refresh = useAppStore((s) => s.refresh);
  const navigate = useNavigate();

  // 1 to 5 steps matching Design References 04 to 08
  const [step, setStep] = useState(1);

  // Step 1: Direction
  const [role, setRole] = useState(profile?.targetRole || "Product Manager");
  const [preset, setPreset] = useState<RolePresetId>(profile?.rolePresetId || "product_manager");
  const [education, setEducation] = useState<string>("University student");
  const [degree, setDegree] = useState(profile?.degreeField || "Business Analytics & Computer Science");
  const [currentYear, setCurrentYear] = useState(profile?.currentYear || "Third year");

  // Step 2: Experience & Time
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "some" | "experienced">("some");
  const [experienceSummary, setExperienceSummary] = useState(profile?.experienceSummary || "");
  const [timelineOption, setTimelineOption] = useState("Within 6 months");
  const [weeklyHoursOption, setWeeklyHoursOption] = useState<"2-4" | "5-7" | "8+">("5-7");

  // Step 3: Preferences
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([
    "Solve business problems",
    "Work with data",
  ]);
  const [learningStyle, setLearningStyle] = useState<string[]>([
    "Short, structured actions",
    "Learn by building",
  ]);

  // Step 4: Current Skills
  const [skillRatings, setSkillRatings] = useState<Record<string, "Learning" | "Comfortable" | "Strong">>({
    "Product Thinking": "Comfortable",
    "User Research": "Learning",
    "Communication": "Strong",
    "Analytics": "Learning",
    "SQL": "Learning",
  });
  const [newSkillInput, setNewSkillInput] = useState("");
  const [skillList, setSkillList] = useState<string[]>([
    "Excel",
    "SQL",
    "Data visualisation",
    "Presentation",
    "Python",
    "User research",
    "Product Thinking",
  ]);

  // Step 5: Target Role Context
  const [jobDescription, setJobDescription] = useState(profile?.pastedJobDescription || "");

  const rolePills = [
    { name: "Product Manager", preset: "product_manager" as RolePresetId },
    { name: "Business Analyst", preset: "data_analyst" as RolePresetId },
    { name: "Data Analyst", preset: "data_analyst" as RolePresetId },
    { name: "Software Engineer", preset: "software_engineer" as RolePresetId },
    { name: "UX Designer", preset: "ux_designer" as RolePresetId },
  ];

  const workTypeOptions = [
    "Solve business problems",
    "Work with data",
    "Build digital products",
    "Research users",
    "Create systems",
    "Communicate ideas",
  ];

  const learningStyleCards = [
    { title: "Short, structured actions", desc: "Clear tasks I can complete throughout the week" },
    { title: "Longer focused sessions", desc: "Fewer sessions with more time for deep work" },
    { title: "Examples before theory", desc: "Show me what good looks like, then explain it" },
    { title: "Learn by building", desc: "Use projects and practice to develop skills" },
  ];

  const progressPercent = Math.round((step / 5) * 100);

  function calculateTargetDate(): string {
    const months = timelineOption.includes("3") ? 3 : timelineOption.includes("6") ? 6 : timelineOption.includes("9") ? 9 : 12;
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  }

  function getNumericHours(): number {
    if (weeklyHoursOption === "2-4") return 4;
    if (weeklyHoursOption === "5-7") return 6;
    return 10;
  }

  function addCustomSkill() {
    if (!newSkillInput.trim()) return;
    if (!skillList.includes(newSkillInput.trim())) {
      setSkillList([...skillList, newSkillInput.trim()]);
      setSkillRatings({ ...skillRatings, [newSkillInput.trim()]: "Learning" });
    }
    setNewSkillInput("");
  }

  async function handleCompleteSetup(goToAssessment = false) {
    if (!profile) return;
    const t = nowIso();
    const targetDate = calculateTargetDate();

    // Map skill ratings to level numbers: Learning -> 2, Comfortable -> 3, Strong -> 4
    const createdSkills: Skill[] = skillsForPreset(preset).map((s) => {
      const rating = skillRatings[s.name];
      const level = rating === "Strong" ? 4 : rating === "Comfortable" ? 3 : rating === "Learning" ? 2 : null;
      return {
        id: newId(),
        profileId: profile.id,
        name: s.name,
        currentLevel: level,
        targetLevel: s.targetLevel,
        weight: s.weight,
        assessedAt: level ? t : undefined,
      };
    });

    const updatedProfile = {
      ...profile,
      targetRole: role.trim() || "Product Manager",
      rolePresetId: preset,
      educationLevel: "undergrad_y3" as EducationLevel,
      currentYear,
      degreeField: degree,
      targetDate,
      weeklyAvailableHours: getNumericHours(),
      experienceSummary,
      careerPreference: selectedWorkTypes.join(", "),
      learningPreference: learningStyle.join(", "),
      pastedJobDescription: jobDescription,
      onboardingCompletedAt: t,
    };

    await saveProfile(updatedProfile);
    await repos.skills.clearProfile(profile.id);
    await repos.skills.bulkPut(createdSkills);

    // Generate personalized 5-phase career roadmap
    await repos.phases.clearProfile(profile.id);
    await repos.milestones.clearProfile(profile.id);
    await repos.tasks.clearProfile(profile.id);
    const generated = generateRoadmap({ profile: updatedProfile, skills: createdSkills });
    await repos.phases.bulkPut(generated.phases);
    await repos.milestones.bulkPut(generated.milestones);
    await repos.tasks.bulkPut(generated.tasks);

    await refresh();
    if (goToAssessment) {
      navigate("/assessment");
    } else {
      navigate("/");
    }
  }

  return (
    <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
        <div>
          <div className="section-eyebrow">PERSONALISE YOUR APTIMI WORKSPACE</div>
          <h1 className="editorial-h1">Shape your career plan</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
            Share a few practical details so APTIMI can build a roadmap that fits your direction, experience and time.
          </p>
        </div>

        <div style={{ textAlign: "right", minWidth: "160px" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
            Step {step} of 5 <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>{progressPercent}% complete</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "var(--border)", borderRadius: "9999px", overflow: "hidden", margin: "0.4rem 0" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s ease" }}></div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Your answers are saved as you go</div>
        </div>
      </div>

      {/* Main Container with Left Stepper and Right Content Card */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2.5rem", alignItems: "start" }}>
        {/* Left Stepper */}
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "1rem" }}>
            SETUP PLAN
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { num: 1, title: "Direction", desc: "Goal and background" },
              { num: 2, title: "Experience & time", desc: "Starting point and pace" },
              { num: 3, title: "Preferences", desc: "Work and learning style" },
              { num: 4, title: "Current skills", desc: "What you already know" },
              { num: 5, title: "Target role context", desc: "Job description, optional" },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isPast = step > s.num;
              return (
                <div
                  key={s.num}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    cursor: isPast ? "pointer" : "default",
                    opacity: step >= s.num ? 1 : 0.6,
                  }}
                  onClick={() => { if (isPast) setStep(s.num); }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: isCurrent ? "var(--primary)" : isPast ? "var(--success)" : "var(--bg-surface-muted)",
                      color: isCurrent || isPast ? "#FFFFFF" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      flexShrink: 0,
                    }}
                  >
                    {isPast ? "✓" : s.num}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: isCurrent ? 600 : 500, color: "var(--text-primary)" }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.desc}</div>
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
              <strong>Private by default</strong><br />
              Your setup answers stay in your workspace.
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="card" style={{ padding: "2.5rem", borderRadius: "16px", minHeight: "520px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* STEP 1: DIRECTION (Screen 04) */}
          {step === 1 && (
            <div className="stack" style={{ gap: "1.75rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  STEP 1 · DIRECTION
                </div>
                <h2 className="editorial-h2" style={{ margin: "0.4rem 0 0.5rem" }}>What are you working toward?</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                  Your target role gives APTIMI a clear destination. You can change it at any time.
                </p>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Target career or role
                </label>
                <input
                  placeholder="e.g. Product Manager, Data Analyst..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ fontSize: "1rem", padding: "0.75rem 1rem" }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                  {rolePills.map((rp) => (
                    <button
                      key={rp.name}
                      type="button"
                      className={`btn-secondary ${role === rp.name ? "btn-primary" : ""}`}
                      style={{ fontSize: "0.82rem", padding: "0.35rem 0.85rem", borderRadius: "8px" }}
                      onClick={() => {
                        setRole(rp.name);
                        setPreset(rp.preset);
                      }}
                    >
                      {rp.name} {role === rp.name ? "✓" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.25rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.2rem" }}>Your background</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  This helps us suggest an appropriate starting point.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <label>
                    Current education
                    <select value={education} onChange={(e) => setEducation(e.target.value)}>
                      <option>University student</option>
                      <option>Graduate student</option>
                      <option>Recent graduate</option>
                      <option>Career switcher</option>
                      <option>Self-directed learner</option>
                    </select>
                  </label>

                  <label>
                    Degree or field
                    <input value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="e.g. Computer Science" />
                  </label>

                  <label>
                    Current year
                    <select value={currentYear} onChange={(e) => setCurrentYear(e.target.value)}>
                      <option>First year</option>
                      <option>Second year</option>
                      <option>Third year</option>
                      <option>Final year</option>
                      <option>Graduated</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EXPERIENCE & TIME (Screen 05) */}
          {step === 2 && (
            <div className="stack" style={{ gap: "1.75rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  STEP 2 · EXPERIENCE &amp; TIME
                </div>
                <h2 className="editorial-h2" style={{ margin: "0.4rem 0 0.5rem" }}>Choose a realistic starting pace</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                  We'll use this to keep your roadmap ambitious without making it unmanageable.
                </p>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem" }}>
                  Current experience level
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  {[
                    { id: "beginner" as const, title: "Beginner", desc: "I'm exploring and learning the basics" },
                    { id: "some" as const, title: "Some experience", desc: "I have coursework or project exposure" },
                    { id: "experienced" as const, title: "Experienced", desc: "I've worked in similar roles or projects" },
                  ].map((lvl) => (
                    <div
                      key={lvl.id}
                      onClick={() => setExperienceLevel(lvl.id)}
                      style={{
                        padding: "1.25rem",
                        borderRadius: "10px",
                        border: experienceLevel === lvl.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                        background: experienceLevel === lvl.id ? "var(--primary-tint)" : "var(--bg-surface)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>{lvl.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{lvl.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <label>
                Relevant experience <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional)</span>
                <textarea
                  placeholder="For example: coursework, societies, part-time work or personal projects..."
                  value={experienceSummary}
                  onChange={(e) => setExperienceSummary(e.target.value)}
                  style={{ minHeight: "80px" }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <label>
                  When do you want to be ready?
                  <select value={timelineOption} onChange={(e) => setTimelineOption(e.target.value)}>
                    <option>Within 3 months</option>
                    <option>Within 6 months</option>
                    <option>Within 9 months</option>
                    <option>Within 12 months</option>
                  </select>
                </label>

                <div>
                  <label style={{ marginBottom: "0.5rem" }}>Weekly availability</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                    {(["2-4", "5-7", "8+"] as const).map((h) => (
                      <button
                        key={h}
                        type="button"
                        className={`btn-secondary ${weeklyHoursOption === h ? "btn-primary" : ""}`}
                        style={{ padding: "0.55rem 0.5rem", fontSize: "0.85rem" }}
                        onClick={() => setWeeklyHoursOption(h)}
                      >
                        {h} hours
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES (Screen 06) */}
          {step === 3 && (
            <div className="stack" style={{ gap: "1.75rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  STEP 3 · PREFERENCES
                </div>
                <h2 className="editorial-h2" style={{ margin: "0.4rem 0 0.5rem" }}>What kind of work suits you?</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                  Choose what sounds useful—not what you think a personality test expects.
                </p>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem" }}>
                  Work you'd like to do
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {workTypeOptions.map((opt) => {
                    const isSelected = selectedWorkTypes.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`btn-secondary ${isSelected ? "btn-primary" : ""}`}
                        style={{ fontSize: "0.85rem", padding: "0.45rem 1rem", borderRadius: "8px" }}
                        onClick={() => {
                          if (isSelected) setSelectedWorkTypes(selectedWorkTypes.filter((x) => x !== opt));
                          else setSelectedWorkTypes([...selectedWorkTypes, opt]);
                        }}
                      >
                        {opt} {isSelected ? "✓" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.25rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.6rem" }}>
                  How do you prefer to learn and execute?
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {learningStyleCards.map((card) => {
                    const active = learningStyle.includes(card.title);
                    return (
                      <div
                        key={card.title}
                        onClick={() => {
                          if (active) setLearningStyle(learningStyle.filter((x) => x !== card.title));
                          else setLearningStyle([...learningStyle, card.title]);
                        }}
                        style={{
                          padding: "1.25rem",
                          borderRadius: "10px",
                          border: active ? "2px solid var(--primary)" : "1px solid var(--border)",
                          background: active ? "var(--primary-tint)" : "var(--bg-surface)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>{card.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{card.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CURRENT SKILLS (Screen 07) */}
          {step === 4 && (
            <div className="stack" style={{ gap: "1.5rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  STEP 4 · CURRENT SKILLS
                </div>
                <h2 className="editorial-h2" style={{ margin: "0.4rem 0 0.5rem" }}>What can you already do?</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                  Select the skills you have today. We'll assess confidence more carefully later.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  placeholder="Search or add a skill..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                />
                <button type="button" className="btn-secondary" onClick={addCustomSkill}>
                  + Add
                </button>
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {skillList.map((skillName) => {
                  const rating = skillRatings[skillName];
                  return (
                    <div
                      key={skillName}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-surface)",
                      }}
                    >
                      <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>{skillName}</span>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        {(["Learning", "Comfortable", "Strong"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            className={`btn-subtle ${rating === lvl ? "btn-primary" : ""}`}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "6px",
                              border: rating === lvl ? "1px solid var(--primary)" : "1px solid var(--border)",
                            }}
                            onClick={() => setSkillRatings({ ...skillRatings, [skillName]: lvl })}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: TARGET ROLE CONTEXT (Screen 08) */}
          {step === 5 && (
            <div className="stack" style={{ gap: "1.5rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.08em" }}>
                  STEP 5 · ROLE CONTEXT
                </div>
                <h2 className="editorial-h2" style={{ margin: "0.4rem 0 0.5rem" }}>Add a target job description</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                  This is optional, but it helps APTIMI tailor skills, evidence and milestones to a real opportunity.
                </p>
              </div>

              <div
                style={{
                  background: "var(--accent-tint)",
                  border: "1px solid rgba(224, 122, 95, 0.25)",
                  borderRadius: "8px",
                  padding: "0.85rem 1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>💼</span>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>No job description yet?</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    You can skip this and add one later from Internships or your Career Roadmap.
                  </div>
                </div>
              </div>

              <label>
                Paste job description <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Optional)</span>
                <textarea
                  placeholder="Paste the responsibilities, requirements and role description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{ minHeight: "120px" }}
                />
              </label>

              <div style={{ background: "var(--bg-surface-subtle)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                  WHAT HAPPENS NEXT
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                  We'll create your first career roadmap
                </div>
                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <div>✓ Suggested phases and milestones</div>
                  <div>✓ A practical weekly pace</div>
                  <div>✓ Skills to assess next</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div>
              <button
                type="button"
                className="btn-subtle"
                onClick={() => navigate("/")}
                style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
              >
                Save &amp; exit
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {step > 1 && (
                <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}

              {step < 5 ? (
                <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>
                  Continue
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => void handleCompleteSetup(false)}
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => void handleCompleteSetup(true)}
                  >
                    Assess Skills &amp; Create Roadmap →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
