import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { repos } from "../../data/repositories";
import { nowIso } from "../../data/repositories";
import { useReminderEngine } from "../todos/TodosPage";

export function NotificationCenter() {
  useReminderEngine();
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unread = store.notifications.filter((n) => n.state === "unread");
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        type="button"
        className="btn-subtle"
        style={{ padding: "0.4rem", position: "relative" }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unread.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "var(--accent)",
              color: "white",
              fontSize: "0.6rem",
              fontWeight: 700,
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-xl)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "var(--bg-surface)", zIndex: 1 }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>Notifications</h3>
            {unread.length > 0 && (
              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", padding: 0 }}
                onClick={async () => {
                  const updates = unread.map((n) => ({ ...n, state: "read" as const, readAt: nowIso() }));
                  for (const u of updates) {
                    await repos.notifications.put(u);
                  }
                  await store.refresh();
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {store.notifications.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No notifications yet.
              </div>
            ) : (
              store.notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--border-light)",
                    background: n.state === "unread" ? "var(--bg-surface-subtle)" : "transparent",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: n.state === "unread" ? "var(--accent)" : "transparent",
                      marginTop: "0.4rem",
                      flexShrink: 0,
                    }}
                  ></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: n.state === "unread" ? 600 : 500, color: "var(--text-primary)" }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem", lineHeight: 1.4 }}>
                      {n.body}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {n.state === "unread" && (
                    <button
                      type="button"
                      className="btn-subtle"
                      style={{ padding: "0.25rem", fontSize: "0.7rem", color: "var(--text-muted)" }}
                      onClick={async () => {
                        await repos.notifications.put({
                          ...n,
                          state: "read",
                          readAt: nowIso(),
                        });
                        await store.refresh();
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
