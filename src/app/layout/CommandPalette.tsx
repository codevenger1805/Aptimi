import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Action" | "Roadmap" | "Opportunity";
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const store = useAppStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          setQuery("");
          setSelectedIndex(0);
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const commands: CommandItem[] = [
    {
      id: "nav-overview",
      title: "Go to Overview / Dashboard",
      category: "Navigation",
      action: () => { navigate("/"); onClose(); },
    },
    {
      id: "nav-roadmap",
      title: "Go to Career Roadmap",
      category: "Navigation",
      action: () => { navigate("/roadmap"); onClose(); },
    },
    {
      id: "nav-focus",
      title: "Start Focus Session",
      category: "Action",
      shortcut: "F",
      action: () => { navigate("/focus"); onClose(); },
    },
    {
      id: "nav-internships",
      title: "Go to Internship Tracker",
      category: "Navigation",
      action: () => { navigate("/internships"); onClose(); },
    },
    {
      id: "nav-progress",
      title: "Go to Career Readiness / Progress",
      category: "Navigation",
      action: () => { navigate("/progress"); onClose(); },
    },
    {
      id: "nav-planner",
      title: "Go to Weekly Planner",
      category: "Navigation",
      action: () => { navigate("/planner"); onClose(); },
    },
    {
      id: "nav-notes",
      title: "Go to Notes & Evidence",
      category: "Navigation",
      action: () => { navigate("/notes"); onClose(); },
    },
    {
      id: "nav-whiteboard",
      title: "Go to Whiteboard",
      category: "Navigation",
      action: () => { navigate("/notes?tab=whiteboard"); onClose(); },
    },
    {
      id: "nav-settings",
      title: "Go to Settings & Profile",
      category: "Navigation",
      action: () => { navigate("/settings"); onClose(); },
    },
    ...store.milestones.slice(0, 5).map((m) => ({
      id: `ms-${m.id}`,
      title: `Milestone: ${m.title}`,
      category: "Roadmap" as const,
      action: () => { navigate("/roadmap"); onClose(); },
    })),
    ...store.opportunities.slice(0, 5).map((o) => ({
      id: `opp-${o.id}`,
      title: `Opportunity: ${o.company} (${o.role})`,
      category: "Opportunity" as const,
      action: () => { navigate("/internships"); onClose(); },
    })),
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="dialog-backdrop"
      style={{ zIndex: 1000 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dialog-panel"
        style={{
          maxWidth: "580px",
          padding: 0,
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.85rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            gap: "0.75rem",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            autoFocus
            placeholder="Search tasks, notes, internships or jump to screen..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              border: "none",
              padding: 0,
              fontSize: "0.95rem",
              background: "transparent",
              outline: "none",
              boxShadow: "none",
            }}
          />
          <span className="kbd-badge">ESC</span>
        </div>

        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "0.5rem" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No matching commands or destinations found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: selectedIndex === idx ? "var(--bg-surface-muted)" : "transparent",
                  color: selectedIndex === idx ? "var(--text-primary)" : "var(--text-secondary)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      background: "var(--bg-canvas)",
                      border: "1px solid var(--border)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {item.category}
                  </span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 500 }}>{item.title}</span>
                </div>
                {item.shortcut && <span className="kbd-badge">{item.shortcut}</span>}
              </div>
            ))
          )}
        </div>

        <div
          style={{
            padding: "0.5rem 1rem",
            background: "var(--bg-surface-subtle)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
          <span>Press <strong>Enter</strong> to select</span>
        </div>
      </div>
    </div>
  );
}
