import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { computeStreak } from "../../domain/streak";
import { NotificationCenter } from "../../features/notifications/NotificationCenter";

export function Header({
  onOpenCommandPalette,
  onToggleMobileNav,
}: {
  onOpenCommandPalette: () => void;
  onToggleMobileNav?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useAppStore();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const now = new Date().toISOString();
  const tz = store.profile?.timezone ?? "UTC";
  const streak = computeStreak(store.focusSessions, tz, now);

  const getBreadcrumbName = () => {
    const path = location.pathname;
    if (path === "/" || path === "/overview") return "Overview";
    if (path.startsWith("/roadmap")) return "Career Roadmap";
    if (path.startsWith("/focus")) return "Focus Mode";
    if (path.startsWith("/internships")) return "Internship Tracker";
    if (path.startsWith("/progress") || path.startsWith("/readiness")) return "Career Readiness";
    if (path.startsWith("/planner")) return "Weekly Planner";
    if (path.startsWith("/notes")) return location.search.includes("whiteboard") ? "Whiteboard" : "Notes & Evidence";
    if (path.startsWith("/todos")) return "Personal To-Do";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/onboarding")) return "Career Setup";
    return "Workspace";
  };

  const streakText = streak.current > 0
    ? `${streak.current} day streak`
    : "Start your streak";

  const initials = (store.profile?.targetRole ? store.profile.targetRole[0] : "A").toUpperCase();

  return (
    <header className="app-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {onToggleMobileNav && (
          <button
            type="button"
            className="btn-subtle menu-toggle"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation menu"
            style={{ padding: "0.4rem" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}

        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <span>Career workspace</span>
          <span style={{ color: "var(--border-dark)" }}>/</span>
          <span className="breadcrumb-active">{getBreadcrumbName()}</span>
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          type="button"
          className="search-command-trigger"
          onClick={onOpenCommandPalette}
          aria-label="Search and command palette"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Search APTIMI or enter a command...</span>
          <span className="kbd-badge">⌘ K</span>
        </button>

        <button
          type="button"
          className="streak-pill-btn"
          onClick={() => navigate("/focus")}
          title="Open Focus Mode to continue streak"
        >
          <span style={{ fontSize: "0.95rem" }}>🔥</span>
          <span>{streakText}</span>
        </button>

        <NotificationCenter />

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="btn-subtle"
            style={{ padding: "0.35rem 0.55rem", gap: "0.45rem" }}
            onClick={() => setAccountMenuOpen((v) => !v)}
            aria-expanded={accountMenuOpen}
            aria-label="User Account Menu"
          >
            <div className="avatar-circle" style={{ width: "28px", height: "28px", fontSize: "0.75rem" }}>
              {initials}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>
              Account
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {accountMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.4rem",
                width: "200px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                boxShadow: "var(--shadow-lg)",
                padding: "0.4rem",
                zIndex: 50,
              }}
            >
              <Link
                to="/settings"
                onClick={() => setAccountMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                }}
              >
                Settings &amp; Backup
              </Link>
              <Link
                to="/progress"
                onClick={() => setAccountMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                }}
              >
                Career Readiness
              </Link>
              <div style={{ height: "1px", background: "var(--border)", margin: "0.3rem 0" }}></div>
              <Link
                to="/onboarding"
                onClick={() => setAccountMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  color: "var(--text-secondary)",
                }}
              >
                Revisit Career Setup
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
