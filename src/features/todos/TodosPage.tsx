import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { EmptyState } from "../../ui/components/EmptyState";
import { newId, nowIso, repos } from "../../data/repositories";
import { completeTodo, reopenTodo } from "../../data/completeActions";
import { cancelReminder, reminderAfterClock } from "../../domain/reminders";
import { isOverdue } from "../../domain/metrics";
import type { PersonalTodo, Priority } from "../../domain/types";

export function TodosPage() {
  const store = useAppStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"open" | "all" | "completed">("open");
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");

  const rows = useMemo(() => {
    return store.todos
      .filter((t) => {
        if (filter === "open" && t.status === "completed") return false;
        if (filter === "completed" && t.status !== "completed") return false;
        if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  }, [store.todos, q, filter]);

  async function add() {
    if (!store.profile || !title.trim()) return;
    const t = nowIso();
    const todo: PersonalTodo = {
      id: newId(),
      profileId: store.profile.id,
      title: title.trim(),
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      priority,
      status: "pending",
      createdAt: t,
      updatedAt: t,
    };
    await repos.todos.put(todo);
    if (remindAt) {
      await repos.reminders.put({
        id: newId(),
        profileId: store.profile.id,
        personalTodoId: todo.id,
        remindAt: new Date(remindAt).toISOString(),
        state: "scheduled",
      });
    }
    setTitle("");
    setDueAt("");
    setRemindAt("");
    setPriority("Medium");
    await store.refresh();
  }

  return (
    <div className="stack" style={{ gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div>
        <div className="section-eyebrow">YOUR WORKSPACE</div>
        <h1 className="editorial-h1">Personal To-Do</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
          Track miscellaneous tasks separately from your Weekly Planner roadmap. Completing these won't move your Career Milestone Completion Rate.
        </p>
      </div>

      <div className="card" style={{ background: "var(--bg-surface-subtle)" }}>
        <form
          className="stack"
          style={{ gap: "1.25rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>I need to...</label>
            <input 
              required 
              placeholder="e.g., Email recruiter about next steps"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ fontSize: "1rem", padding: "0.75rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px" }}
            />
          </div>
          
          <div className="grid-3" style={{ gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Due (Optional)</label>
              <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Reminder (Optional)</label>
              <input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button type="submit" className="btn-primary">Add To-Do</button>
          </div>
        </form>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginTop: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          {["open", "completed", "all"].map((f) => (
            <button
              key={f}
              type="button"
              className="btn-subtle"
              style={{
                borderBottom: filter === f ? "2px solid var(--primary)" : "2px solid transparent",
                borderRadius: 0,
                padding: "0.5rem 0.25rem",
                fontWeight: filter === f ? 600 : 400,
                color: filter === f ? "var(--text-primary)" : "var(--text-secondary)",
                textTransform: "capitalize",
                marginBottom: "-1rem"
              }}
              onClick={() => setFilter(f as typeof filter)}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ width: "240px" }}>
          <input 
            placeholder="Search to-dos..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
            style={{ width: "100%", padding: "0.4rem 0.75rem", fontSize: "0.85rem", borderRadius: "20px" }}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No personal to-dos">
          {q ? "No matching to-dos found." : "Add a personal to-do above to keep track of smaller tasks."}
        </EmptyState>
      ) : (
        <div className="stack" style={{ gap: "0.75rem" }}>
          {rows.map((todo) => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}

function TodoRow({ todo }: { todo: PersonalTodo }) {
  const store = useAppStore();
  const reminder = store.reminders.find((r) => r.personalTodoId === todo.id);
  const overdue = isOverdue(todo.dueAt, todo.status, new Date().toISOString());
  const isDone = todo.status === "completed";
  
  return (
    <article 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "1.25rem", 
        background: isDone ? "var(--bg-surface-subtle)" : "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        gap: "1rem",
        opacity: isDone ? 0.7 : 1
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1 }}>
        <input
          type="checkbox"
          checked={isDone}
          onChange={async () => {
            if (isDone) {
              await reopenTodo(todo);
            } else {
              await completeTodo(todo);
              if (reminder) await repos.reminders.put(cancelReminder(reminder));
            }
            await store.refresh();
          }}
          style={{ width: "20px", height: "20px", marginTop: "0.2rem", cursor: "pointer", accentColor: "var(--primary)" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <h3 style={{ 
            fontSize: "1rem", 
            fontWeight: 500, 
            margin: 0, 
            textDecoration: isDone ? "line-through" : "none",
            color: isDone ? "var(--text-secondary)" : "var(--text-primary)" 
          }}>
            {todo.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {todo.priority && (
              <span style={{ 
                color: todo.priority === "High" ? "var(--accent)" : "inherit",
                fontWeight: todo.priority === "High" ? 600 : 400 
              }}>
                {todo.priority} priority
              </span>
            )}
            
            {todo.dueAt && (
              <>
                <span>•</span>
                <span style={{ color: overdue && !isDone ? "var(--danger)" : "inherit" }}>
                  Due {new Date(todo.dueAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  {overdue && !isDone && " (Overdue)"}
                </span>
              </>
            )}

            {reminder && reminder.state !== "canceled" && (
              <>
                <span>•</span>
                <span>
                  Reminder {reminder.state === "scheduled" ? "set" : reminder.state}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <button
          type="button"
          className="btn-subtle"
          style={{ padding: "0.5rem", color: "var(--text-muted)" }}
          onClick={async () => {
            await repos.todos.delete(todo.id);
            if (reminder) await repos.reminders.put(cancelReminder(reminder));
            await store.refresh();
          }}
          title="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </article>
  );
}

export function useReminderEngine() {
  const store = useAppStore();
  useEffect(() => {
    let timer: number | undefined;
    async function tick() {
      const now = nowIso();
      const settings = store.settings;
      for (const reminder of store.reminders) {
        const next = reminderAfterClock(reminder, now);
        if (next.state !== reminder.state) {
          await repos.reminders.put(next);
          if (next.state === "due") {
            const todo = store.todos.find((t) => t.id === next.personalTodoId);
            const existing = store.notifications.find(
              (n) => n.relatedEntityId === next.id && n.type === "reminder",
            );
            if (!existing && store.profile) {
              await repos.notifications.put({
                id: newId(),
                profileId: store.profile.id,
                type: "reminder",
                title: "Reminder",
                body: todo?.title ?? "A personal to-do is due",
                relatedEntityId: next.id,
                scheduledAt: next.remindAt,
                createdAt: now,
                state: "unread",
              });
            }
            if (
              settings?.notificationPreference === "browser_and_in_app" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("APTIMI reminder", {
                body: todo?.title ?? "A personal to-do is due",
                tag: next.id,
              });
            }
            await repos.reminders.put({ ...next, state: "shown", deliveredAt: now });
          }
        }
      }
      await store.refresh();
    }
    void tick();
    timer = window.setInterval(() => void tick(), 30000);
    const vis = () => void tick();
    document.addEventListener("visibilitychange", vis);
    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [store.reminders, store.settings, store.todos, store.profile, store.notifications, store.refresh]);
}
