import { useMemo, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { localWeekRange, isOverdue } from "../../domain/metrics";
import { EmptyState } from "../../ui/components/EmptyState";
import { newId, nowIso, repos } from "../../data/repositories";
import { completeRoadmapTask, reopenRoadmapTask } from "../../data/completeActions";
import { useToast } from "../../store/toast";
import { AiPanel } from "../ai/AiPanel";
import type { Priority, RoadmapTask, TaskStatus } from "../../domain/types";

export function PlannerPage() {
  const store = useAppStore();
  const toast = useToast((s) => s.show);
  const [view, setView] = useState<"week" | "list">("list");
  const now = new Date().toISOString();
  const week = localWeekRange(now, store.profile?.timezone ?? "UTC");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [form, setForm] = useState({
    title: "",
    milestoneId: store.milestones[0]?.id ?? "",
    dueAt: "",
    priority: "Medium" as Priority,
  });

  const tasks = useMemo(() => {
    return [...store.tasks]
      .filter((t) => (filter === "all" ? true : t.status === filter))
      .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  }, [store.tasks, filter]);

  async function addTask() {
    if (!store.profile || !form.title.trim()) return;
    const t = nowIso();
    const row: RoadmapTask = {
      id: newId(),
      profileId: store.profile.id,
      milestoneId: form.milestoneId || undefined,
      title: form.title.trim(),
      order: store.tasks.length,
      priority: form.priority,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      status: "pending",
      createdAt: t,
      updatedAt: t,
    };
    await repos.tasks.put(row);
    await store.refresh();
    setForm({ ...form, title: "", dueAt: "" });
  }

  return (
    <div className="stack" style={{ gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="section-eyebrow">WEEK OF {week.start}–{week.end}</div>
          <h1 className="editorial-h1">Weekly Planner</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
            Schedule and manage roadmap tasks for this week.
          </p>
        </div>
        
        <div style={{ display: "flex", background: "var(--bg-surface)", padding: "0.25rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <button
            type="button"
            className="btn-subtle"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: view === "list" ? "var(--primary)" : "transparent",
              color: view === "list" ? "#fff" : "var(--text-secondary)",
              fontWeight: view === "list" ? 500 : 400,
            }}
            onClick={() => setView("list")}
          >
            List View
          </button>
          <button
            type="button"
            className="btn-subtle"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: view === "week" ? "var(--primary)" : "transparent",
              color: view === "week" ? "#fff" : "var(--text-secondary)",
              fontWeight: view === "week" ? 500 : 400,
            }}
            onClick={() => setView("week")}
          >
            Week View
          </button>
        </div>
      </div>

      <div className="card" style={{ background: "var(--bg-surface-subtle)" }}>
        <form
          className="stack"
          style={{ gap: "1.25rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            void addTask();
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>I will...</label>
            <input 
              required 
              placeholder="e.g., Draft user interview questions"
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              style={{ fontSize: "1rem", padding: "0.75rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px" }}
            />
          </div>
          
          <div className="grid-3" style={{ gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Parent Milestone</label>
              <select
                value={form.milestoneId}
                onChange={(e) => setForm({ ...form, milestoneId: e.target.value })}
                style={{ padding: "0.6rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "6px" }}
              >
                <option value="">None</option>
                {store.milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Due (Optional)</label>
              <input 
                type="datetime-local" 
                value={form.dueAt} 
                onChange={(e) => setForm({ ...form, dueAt: e.target.value })} 
                style={{ padding: "0.6rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "6px" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Priority</label>
              <select 
                value={form.priority} 
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                style={{ padding: "0.6rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "6px" }}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button type="submit" className="btn-primary">Add roadmap task</button>
          </div>
        </form>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginTop: "0.5rem" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Filter Status:</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              className="btn-subtle"
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                background: filter === f.value ? "var(--text-primary)" : "var(--bg-surface)",
                color: filter === f.value ? "var(--bg-surface)" : "var(--text-secondary)",
                border: "1px solid",
                borderColor: filter === f.value ? "var(--text-primary)" : "var(--border)",
              }}
              onClick={() => setFilter(f.value as typeof filter)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No roadmap tasks">
          Break a milestone into an actionable task to plan the week.
        </EmptyState>
      ) : view === "list" ? (
        <TaskList
          tasks={tasks}
          now={now}
          onChange={async () => {
            await store.refresh();
          }}
          toast={toast}
        />
      ) : (
        <WeekGrid tasks={tasks} week={week} now={now} toast={toast} />
      )}
      <AiPanel contextLabel="planner" />
    </div>
  );
}

function TaskList({
  tasks,
  now,
  onChange,
  toast,
}: {
  tasks: RoadmapTask[];
  now: string;
  onChange: () => Promise<void>;
  toast: (m: string) => void;
}) {
  const store = useAppStore();
  return (
    <ul className="stack" style={{ listStyle: "none", padding: 0, gap: "1rem" }}>
      {tasks.map((task) => {
        const overdue = isOverdue(task.dueAt, task.status, now);
        const milestone = store.milestones.find((m) => m.id === task.milestoneId);
        const isDone = task.status === "completed";
        const isInProgress = task.status === "in_progress";
        
        return (
          <li 
            key={task.id} 
            style={{ 
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1.25rem", 
              background: isDone ? "var(--bg-surface-subtle)" : "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderLeft: isInProgress ? "4px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: "12px",
              opacity: isDone ? 0.7 : 1
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={async () => {
                    if (isDone) {
                      await reopenRoadmapTask(task, milestone);
                    } else {
                      await completeRoadmapTask(task, store.tasks, milestone);
                      toast("Roadmap task completed");
                    }
                    await onChange();
                  }}
                  style={{ width: "20px", height: "20px", marginTop: "0.2rem", cursor: "pointer", accentColor: "var(--primary)" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <h3 style={{ 
                    fontSize: "1.05rem", 
                    fontWeight: 500, 
                    margin: 0, 
                    textDecoration: isDone ? "line-through" : "none",
                    color: isDone ? "var(--text-secondary)" : "var(--text-primary)" 
                  }}>
                    {task.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {milestone && (
                      <span style={{ 
                        background: "var(--bg-surface-subtle)", 
                        padding: "0.15rem 0.5rem", 
                        borderRadius: "4px",
                        border: "1px solid var(--border-light)"
                      }}>
                        {milestone.title}
                      </span>
                    )}
                    
                    {task.priority && (
                      <span style={{ 
                        color: task.priority === "High" ? "var(--accent)" : "inherit",
                        fontWeight: task.priority === "High" ? 600 : 400 
                      }}>
                        {task.priority} priority
                      </span>
                    )}
                    
                    {task.dueAt && (
                      <>
                        <span>•</span>
                        <span style={{ color: overdue && !isDone ? "var(--danger)" : "inherit" }}>
                          Due {new Date(task.dueAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          {overdue && !isDone && " (Overdue)"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {task.status === "pending" && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", borderRadius: "6px" }}
                    onClick={async () => {
                      await repos.tasks.put({
                        ...task,
                        status: "in_progress",
                        updatedAt: nowIso(),
                      });
                      await onChange();
                    }}
                  >
                    Start
                  </button>
                )}
                <button
                  type="button"
                  className="btn-subtle"
                  style={{ padding: "0.5rem", color: "var(--text-muted)" }}
                  onClick={async () => {
                    await repos.tasks.delete(task.id);
                    await onChange();
                  }}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function WeekGrid({
  tasks,
  week,
  now,
  toast,
}: {
  tasks: RoadmapTask[];
  week: { start: string; end: string };
  now: string;
  toast: (m: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${week.start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
      {days.map((day) => {
        const dayTasks = tasks.filter((t) => t.dueAt?.slice(0, 10) === day);
        const dateObj = new Date(`${day}T12:00:00Z`);
        const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(dateObj);
        const dayNum = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dateObj);
        const isToday = day === now.slice(0, 10);
        
        return (
          <section 
            key={day} 
            style={{ 
              background: "var(--bg-surface)",
              border: "1px solid",
              borderColor: isToday ? "var(--primary)" : "var(--border)",
              borderRadius: "12px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              minHeight: "250px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: isToday ? "var(--primary)" : "var(--text-primary)" }}>{dayName}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{dayNum}</span>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, background: "var(--bg-surface-subtle)", padding: "0.2rem 0.5rem", borderRadius: "10px" }}>
                {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            
            {dayTasks.length > 0 ? (
              <div style={{ flex: 1, overflowY: "auto" }}>
                <TaskList
                  tasks={dayTasks}
                  now={now}
                  onChange={async () => {
                    await useAppStore.getState().refresh();
                  }}
                  toast={toast}
                />
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No tasks due
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
