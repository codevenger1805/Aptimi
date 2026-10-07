import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { computeStreak, focusHours, sessionsCompleted } from "../../domain/streak";
import { awardIfNew } from "../../domain/rewards";
import { POINTS } from "../../domain/types";
import { newId, nowIso, repos } from "../../data/repositories";
import type { FocusSession } from "../../domain/types";

interface FocusSticky {
  id: string;
  text: string;
  color: string;
}

const DEFAULT_STICKIES: FocusSticky[] = [
  { id: "1", text: "Check activation metric definition and drop-off rate", color: "#F2CC8F" },
  { id: "2", text: "Ask: what would the user actually do in the first 60 seconds?", color: "#E07A5F" },
  { id: "3", text: "Review SQL query: funnel conversion by cohort", color: "#81B29A" },
];

export function FocusPage() {
  const store = useAppStore();
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin] = useState(5);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [linkTask, setLinkTask] = useState("");
  const [stickies, setStickies] = useState<FocusSticky[]>(DEFAULT_STICKIES);
  const [newStickyText, setNewStickyText] = useState("");
  const [scratchpad, setScratchpad] = useState("");
  const [fullScreen, setFullScreen] = useState(false);

  const startedAt = useRef<string | null>(null);
  const planned = useRef(25 * 60);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          void finish(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running]);

  function start() {
    planned.current = (mode === "focus" ? focusMin : breakMin) * 60;
    if (!startedAt.current) {
      setRemaining(planned.current);
      startedAt.current = nowIso();
    }
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  async function finish(completed: boolean) {
    setRunning(false);
    if (tick.current) window.clearInterval(tick.current);
    if (mode === "break") {
      setMode("focus");
      setRemaining(focusMin * 60);
      startedAt.current = null;
      return;
    }
    if (!store.profile || !startedAt.current) return;
    const ended = nowIso();
    const duration = completed
      ? planned.current
      : Math.max(0, planned.current - remaining);
    const session: FocusSession = {
      id: newId(),
      profileId: store.profile.id,
      roadmapTaskId: linkTask || undefined,
      startedAt: startedAt.current,
      endedAt: ended,
      durationSeconds: duration,
      plannedSeconds: planned.current,
      status: completed ? "completed" : "abandoned",
      completedAt: completed ? ended : undefined,
    };
    await repos.focus.put(session);
    if (completed) {
      const ledger = await repos.rewards.list(store.profile.id);
      const { awarded } = awardIfNew({
        ledger,
        profileId: store.profile.id,
        sourceType: "focusSession",
        sourceId: session.id,
        points: POINTS.focusSession,
        nowIso: ended,
        id: newId(),
        reason: "Completed 25-minute deep focus block",
      });
      if (awarded) await repos.rewards.put(awarded);
    }
    startedAt.current = null;
    setRemaining(focusMin * 60);
    await store.refresh();
  }

  function selectPreset(mins: number) {
    if (running) return;
    setFocusMin(mins);
    setRemaining(mins * 60);
    planned.current = mins * 60;
  }

  function addSticky() {
    if (!newStickyText.trim()) return;
    const colors = ["#F2CC8F", "#E07A5F", "#81B29A", "#B8C0FF"];
    const chosenColor = colors[stickies.length % colors.length];
    setStickies([...stickies, { id: newId(), text: newStickyText.trim(), color: chosenColor }]);
    setNewStickyText("");
  }

  function removeSticky(id: string) {
    setStickies(stickies.filter((s) => s.id !== id));
  }

  const tz = store.profile?.timezone ?? "UTC";
  const now = new Date().toISOString();
  const streak = computeStreak(store.focusSessions, tz, now);
  const hours = focusHours(store.focusSessions);
  const sessions = sessionsCompleted(store.focusSessions);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const totalTime = (mode === "focus" ? focusMin : breakMin) * 60;
  const progressFraction = Math.min(1, Math.max(0, 1 - remaining / (totalTime || 1)));
  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference * (1 - progressFraction);

  // Active task context title
  const activeTask = store.tasks.find((t) => t.id === linkTask);
  const activeMilestone = store.milestones.find((m) => m.id === activeTask?.milestoneId);

  // 7 days of this week for visual tracker
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <div
      style={{
        backgroundColor: "#111318",
        color: "#F8F9FA",
        borderRadius: fullScreen ? 0 : "var(--radius-xl)",
        padding: "36px",
        minHeight: fullScreen ? "100vh" : "calc(100vh - 120px)",
        position: fullScreen ? "fixed" : "relative",
        top: fullScreen ? 0 : "auto",
        left: fullScreen ? 0 : "auto",
        right: fullScreen ? 0 : "auto",
        bottom: fullScreen ? 0 : "auto",
        zIndex: fullScreen ? 9999 : "auto",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {/* Top Bar inside Focus Canvas */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1F232D", paddingBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#1C1F26", display: "flex", alignItems: "center", justifyContent: "center", color: "#E07A5F", fontSize: "18px" }}>
            🔥
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#81B29A", textTransform: "uppercase" }}>
              DEEP WORK CHAMBER
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 600, margin: 0, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
              {activeMilestone ? activeMilestone.title : activeTask ? activeTask.title : "Product Execution Sprint"}
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#16181D", padding: "6px 14px", borderRadius: "999px", border: "1px solid #282D39", fontSize: "13px" }}>
            <span>🔥</span>
            <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{streak.current} Day Streak</span>
            <span style={{ color: "#6C7280" }}>· {hours} hrs total</span>
          </div>

          <button
            type="button"
            onClick={() => setFullScreen(!fullScreen)}
            style={{
              background: "#16181D",
              border: "1px solid #282D39",
              color: "#9CA3AF",
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "13px",
            }}
            aria-label="Toggle Fullscreen"
          >
            {fullScreen ? "Exit Fullscreen" : "⛶ Fullscreen"}
          </button>
        </div>
      </div>

      {/* Main Focus Area: Timer Center & Sidebars */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "36px", flex: 1 }}>
        {/* Left: Huge Timer Display */}
        <div
          style={{
            backgroundColor: "#16181D",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #222631",
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", background: "#111318", padding: "4px", borderRadius: "999px", border: "1px solid #282D39", marginBottom: "32px" }}>
            <button
              type="button"
              onClick={() => {
                if (running) return;
                setMode("focus");
                setRemaining(focusMin * 60);
              }}
              style={{
                border: "none",
                background: mode === "focus" ? "#3D405B" : "transparent",
                color: mode === "focus" ? "#FFFFFF" : "#9CA3AF",
                padding: "8px 20px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Focus Block ({focusMin}m)
            </button>
            <button
              type="button"
              onClick={() => {
                if (running) return;
                setMode("break");
                setRemaining(breakMin * 60);
              }}
              style={{
                border: "none",
                background: mode === "break" ? "#81B29A" : "transparent",
                color: mode === "break" ? "#111318" : "#9CA3AF",
                padding: "8px 20px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Short Break ({breakMin}m)
            </button>
          </div>

          {/* SVG Circular Timer */}
          <div style={{ position: "relative", width: "290px", height: "290px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="290" height="290" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="145"
                cy="145"
                r="130"
                stroke="#1E232E"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="145"
                cy="145"
                r="130"
                stroke={mode === "focus" ? "#E07A5F" : "#81B29A"}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>

            <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "68px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {mm}:{ss}
              </div>
              <div style={{ fontSize: "12px", color: mode === "focus" ? "#E07A5F" : "#81B29A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "8px" }}>
                {running ? "Session in Progress" : "Ready to focus"}
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "32px" }}>
            {[15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                disabled={running}
                onClick={() => selectPreset(mins)}
                style={{
                  background: focusMin === mins ? "#2D2F44" : "#111318",
                  border: focusMin === mins ? "1px solid #E07A5F" : "1px solid #282D39",
                  color: focusMin === mins ? "#FFFFFF" : "#9CA3AF",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: running ? "not-allowed" : "pointer",
                }}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: "flex", gap: "16px", marginTop: "24px", alignItems: "center" }}>
            {!running ? (
              <button
                type="button"
                onClick={start}
                style={{
                  background: "#E07A5F",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px 36px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 6px 16px rgba(224, 122, 95, 0.3)",
                }}
              >
                ▶ {startedAt.current ? "Resume Session" : "Start Focus"}
              </button>
            ) : (
              <button
                type="button"
                onClick={pause}
                style={{
                  background: "#3D405B",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px 36px",
                  borderRadius: "999px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                ⏸ Pause
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                void finish(false);
                setRemaining(focusMin * 60);
              }}
              style={{
                background: "#1C1F26",
                border: "1px solid #282D39",
                color: "#9CA3AF",
                padding: "14px 22px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ↺ Reset
            </button>
          </div>

          {/* Task Linker Context */}
          <div style={{ marginTop: "28px", width: "100%", maxWidth: "440px", borderTop: "1px solid #222631", paddingTop: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Link to Career Roadmap Task:</span>
            </div>
            <select
              value={linkTask}
              onChange={(e) => setLinkTask(e.target.value)}
              disabled={running}
              style={{
                width: "100%",
                background: "#111318",
                border: "1px solid #282D39",
                color: "#F8F9FA",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              <option value="">No specific task selected</option>
              {store.tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Sticky Notes, 7-day Streak & Scratchpad */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 7-Day Consistency Meter */}
          <div style={{ backgroundColor: "#16181D", borderRadius: "var(--radius-lg)", border: "1px solid #222631", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔥</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>Weekly Habit Consistency</span>
              </div>
              <span style={{ fontSize: "11px", color: "#81B29A", fontWeight: 600 }}>{sessions} completed sessions</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === currentDayIndex;
                const isDone = idx <= currentDayIndex && (streak.todayHasSession || idx < currentDayIndex);
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      background: isDone ? "#1E2722" : "#111318",
                      border: isToday ? "1px solid #E07A5F" : "1px solid #282D39",
                      borderRadius: "8px",
                      padding: "10px 4px",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 700 }}>{day}</span>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: isDone ? "#81B29A" : "#282D39",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Notes Prompts */}
          <div style={{ backgroundColor: "#16181D", borderRadius: "var(--radius-lg)", border: "1px solid #222631", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📌</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>Focus Prompts & Notes</span>
              </div>
              <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{stickies.length} active notes</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "190px", overflowY: "auto" }}>
              {stickies.map((s) => (
                <div
                  key={s.id}
                  style={{
                    backgroundColor: "#1F232D",
                    borderLeft: `4px solid ${s.color}`,
                    borderRadius: "6px",
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "12px", color: "#F1F3F5", lineHeight: 1.4 }}>{s.text}</p>
                  <button
                    type="button"
                    onClick={() => removeSticky(s.id)}
                    style={{ background: "transparent", border: "none", color: "#6C7280", cursor: "pointer", padding: "2px" }}
                    aria-label="Delete sticky"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add Sticky Input */}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input
                type="text"
                placeholder="Add a deep work prompt..."
                value={newStickyText}
                onChange={(e) => setNewStickyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSticky();
                }}
                style={{
                  flex: 1,
                  background: "#111318",
                  border: "1px solid #282D39",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
              <button
                type="button"
                onClick={addSticky}
                style={{
                  background: "#3D405B",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Scratchpad */}
          <div style={{ backgroundColor: "#16181D", borderRadius: "var(--radius-lg)", border: "1px solid #222631", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>Instant Scratchpad</span>
              <span style={{ fontSize: "11px", color: "#6C7280" }}>Auto-clears on reset</span>
            </div>
            <textarea
              placeholder="Jot down quick thoughts without leaving the focus zone..."
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              style={{
                width: "100%",
                flex: 1,
                minHeight: "100px",
                background: "#111318",
                border: "1px solid #282D39",
                color: "#FFFFFF",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "13px",
                resize: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
