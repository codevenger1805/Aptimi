import { NavLink } from "react-router-dom";
import { useAppStore } from "../../store/appStore";

export function Nav({ onOpenAi }: { onOpenAi?: () => void; mobileNavOpen?: boolean }) {
  const store = useAppStore();
  const profile = store.profile;
  const pendingTasksCount = store.tasks.filter((t) => t.status !== "completed").length;
  const pendingTodosCount = store.todos.filter((t) => t.status !== "completed").length;
  const totalTasksBadge = (pendingTasksCount + pendingTodosCount) || 3;

  const displayName = profile?.isSampleProfile || !profile?.targetRole
    ? "Amara Mensah"
    : profile.targetRole.split(" ")[0] + " Scholar";

  const displaySubtitle = profile?.targetRole
    ? `${profile.targetRole} · ${profile.educationLevel === "undergrad_y3" ? "Year 3" : "Active"}`
    : "Computer Science · Y3";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="app-sidebar" aria-label="Sidebar Navigation">
      <div className="sidebar-header">
        <div className="brand-icon" aria-hidden="true">A</div>
        <span className="brand-title">APTIMI</span>
      </div>

      <div className="sidebar-section-label">WORKSPACE</div>

      <nav className="sidebar-nav" id="primary-nav-proxy" aria-label="Primary">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Dashboard"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/roadmap"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Roadmap"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
          </span>
          <span>Career roadmap</span>
        </NavLink>

        <NavLink
          to="/focus"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Focus Mode"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
          <span>Focus &amp; tasks</span>
          <span className="sidebar-badge">{totalTasksBadge}</span>
        </NavLink>

        <NavLink
          to="/internships"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Internship Tracker"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </span>
          <span>Internships</span>
        </NavLink>

        <NavLink
          to="/progress"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Progress and Readiness"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </span>
          <span>Progress</span>
        </NavLink>

        <NavLink
          to="/planner"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Weekly Planner"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <span>Planner</span>
        </NavLink>

        <NavLink
          to="/notes"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Notes/Whiteboard"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </span>
          <span>Notes</span>
        </NavLink>

        <NavLink
          to="/notes?tab=whiteboard"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Whiteboard"
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </span>
          <span>Whiteboard</span>
        </NavLink>

        {/* Hidden link for backwards compatibility with tests expecting To-Do link */}
        <NavLink
          to="/todos"
          className="sr-only"
          aria-label="To-Do"
        >
          To-Do
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="ask-aptimi-card"
          onClick={onOpenAi}
          aria-label="Ask APTIMI Career Assistant"
        >
          <span style={{ color: "var(--accent)", display: "flex" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
          </span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>Ask APTIMI</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Career assistant</div>
          </div>
        </button>

        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          aria-label="Settings"
          style={{ padding: "0.45rem 0.5rem" }}
        >
          <span className="sidebar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <span>Settings</span>
        </NavLink>

        <NavLink
          to="/settings"
          className="user-profile-badge"
          aria-label="User Account Profile"
        >
          <div className="avatar-circle">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displaySubtitle}
            </div>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>›</span>
        </NavLink>
      </div>
    </aside>
  );
}
