import { useMemo, useState } from "react";
import { useAppStore } from "../../store/appStore";
import { applicationsSubmitted, interviewRate } from "../../domain/metrics";
import { newId, nowIso, repos } from "../../data/repositories";
import { ConfirmDialog } from "../../ui/components/ConfirmDialog";
import { JDAnalysisModal } from "./JDAnalysisModal";
import { useToast } from "../../store/toast";
import type { Opportunity, OpportunityStatus } from "../../domain/types";

const STATUSES: OpportunityStatus[] = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
];

const COMPANY_COLORS: Record<string, string> = {
  Spotify: "#1DB954",
  Canva: "#00C4CC",
  Figma: "#F24E1E",
  Monzo: "#14233C",
  Google: "#EA4335",
  Wise: "#00B9FF",
  Deliveroo: "#00CDBC",
  Revolut: "#191C1F",
  "Bloom & Wild": "#E07A5F",
  HubSpot: "#FF7A59",
};

export function InternshipsPage() {
  const store = useAppStore();
  const toast = useToast((s) => s.show);

  const [q, setQ] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [editing, setEditing] = useState<Partial<Opportunity> | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [showJdModal, setShowJdModal] = useState(false);

  const filteredOpps = useMemo(() => {
    return store.opportunities.filter((o) => {
      if (!q.trim()) return true;
      return (
        o.company.toLowerCase().includes(q.toLowerCase()) ||
        o.role.toLowerCase().includes(q.toLowerCase()) ||
        (o.location ?? "").toLowerCase().includes(q.toLowerCase())
      );
    });
  }, [store.opportunities, q]);

  const submittedCount = applicationsSubmitted(store.opportunities);
  const interviewStats = interviewRate(store.opportunities, store.opportunityEvents);

  async function saveOpportunity() {
    if (!store.profile || !editing?.company || !editing.role) return;
    const t = nowIso();
    const existing = editing.id
      ? store.opportunities.find((o) => o.id === editing.id)
      : undefined;
    const nextStatus = (editing.status ?? "Saved") as OpportunityStatus;

    const row: Opportunity = {
      id: editing.id ?? newId(),
      profileId: store.profile.id,
      company: editing.company.trim(),
      role: editing.role.trim(),
      url: editing.url,
      location: editing.location,
      status: nextStatus,
      savedAt: existing?.savedAt ?? t,
      appliedAt: nextStatus === "Saved" ? existing?.appliedAt : existing?.appliedAt ?? t,
      followUpAt: editing.followUpAt,
      compensation: editing.compensation,
      notes: editing.notes,
      nextAction: editing.nextAction,
      createdAt: existing?.createdAt ?? t,
      updatedAt: t,
    };

    await repos.opportunities.put(row);
    if (!existing || existing.status !== nextStatus) {
      await repos.opportunityEvents.put({
        id: newId(),
        opportunityId: row.id,
        fromStatus: existing?.status,
        toStatus: nextStatus,
        changedAt: t,
      });
    }

    await store.refresh();
    setEditing(null);
    toast(editing.id ? "Opportunity updated" : "Opportunity added to pipeline");
  }

  async function updateStatus(opp: Opportunity, nextStatus: OpportunityStatus) {
    const t = nowIso();
    await repos.opportunities.put({
      ...opp,
      status: nextStatus,
      appliedAt: nextStatus !== "Saved" && !opp.appliedAt ? t : opp.appliedAt,
      updatedAt: t,
    });
    await repos.opportunityEvents.put({
      id: newId(),
      opportunityId: opp.id,
      fromStatus: opp.status,
      toStatus: nextStatus,
      changedAt: t,
    });
    await store.refresh();
    toast(`Moved to ${nextStatus}`);
  }

  return (
    <div className="stack" style={{ gap: "2rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="section-eyebrow">OPPORTUNITY WORKSPACE</div>
          <h1 className="editorial-h1">Internship Tracker</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
            Keep your career opportunities moving. Applications count once moved past Saved.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button type="button" className="btn-secondary" onClick={() => setShowJdModal(true)}>
            📄 Analyze Job Description
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              setEditing({
                company: "",
                role: store.profile?.targetRole ?? "Product Manager Intern",
                status: "Saved",
                location: "London · Hybrid",
                nextAction: "Tailor CV",
              })
            }
          >
            + Add opportunity
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "0.75rem 1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "260px" }}>
          <input
            placeholder="Search roles or companies..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: "300px", padding: "0.4rem 0.75rem" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            <strong>{store.opportunities.length}</strong> opportunities · {submittedCount} submitted · {interviewStats.numerator} in interview
          </span>

          <div style={{ display: "flex", background: "var(--bg-surface-muted)", borderRadius: "6px", padding: "2px" }}>
            <button
              type="button"
              className="btn-subtle"
              style={{
                fontSize: "0.75rem",
                padding: "0.3rem 0.6rem",
                background: viewMode === "board" ? "var(--bg-surface)" : "transparent",
                fontWeight: viewMode === "board" ? 600 : 400,
                borderRadius: "4px",
              }}
              onClick={() => setViewMode("board")}
            >
              Board
            </button>
            <button
              type="button"
              className="btn-subtle"
              style={{
                fontSize: "0.75rem",
                padding: "0.3rem 0.6rem",
                background: viewMode === "list" ? "var(--bg-surface)" : "transparent",
                fontWeight: viewMode === "list" ? 600 : 400,
                borderRadius: "4px",
              }}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL KANBAN BOARD (Design Reference 19) */}
      {viewMode === "board" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(240px, 1fr))",
            gap: "1.25rem",
            overflowX: "auto",
            paddingBottom: "1.5rem",
            alignItems: "start",
          }}
        >
          {STATUSES.slice(0, 5).map((colStatus) => {
            const columnOpps = filteredOpps.filter((o) => o.status === colStatus);

            return (
              <div
                key={colStatus}
                style={{
                  background: "var(--bg-surface-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1rem",
                  minHeight: "480px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          colStatus === "Saved"
                            ? "var(--info)"
                            : colStatus === "Applied"
                            ? "var(--primary)"
                            : colStatus === "Assessment"
                            ? "var(--warning)"
                            : colStatus === "Interview"
                            ? "var(--accent)"
                            : "var(--success)",
                      }}
                    ></span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {colStatus}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        background: "var(--bg-surface)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "9999px",
                      }}
                    >
                      {columnOpps.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-subtle"
                    style={{ fontSize: "0.8rem", padding: "0.1rem 0.3rem" }}
                    onClick={() =>
                      setEditing({
                        company: "",
                        role: "Product Intern",
                        status: colStatus,
                        location: "London · Hybrid",
                      })
                    }
                    title={`Add opportunity to ${colStatus}`}
                  >
                    +
                  </button>
                </div>

                {/* Cards List in Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1 }}>
                  {columnOpps.length === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                        border: "1px dashed var(--border)",
                        borderRadius: "8px",
                        padding: "1.5rem 0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>💼</span>
                      <div>No {colStatus.toLowerCase()} yet</div>
                      <button
                        type="button"
                        className="btn-subtle"
                        style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}
                        onClick={() =>
                          setEditing({
                            company: "",
                            role: "Product Intern",
                            status: colStatus,
                          })
                        }
                      >
                        + Add opportunity
                      </button>
                    </div>
                  ) : (
                    columnOpps.map((opp, i) => {
                      const avatarBg = COMPANY_COLORS[opp.company] || (i % 2 === 0 ? "var(--primary)" : "#2A3048");
                      const isUrgent = colStatus === "Interview" && i === 0;

                      return (
                        <div
                          key={opp.id}
                          className="card"
                          style={{
                            padding: 0,
                            borderRadius: "10px",
                            overflow: "hidden",
                            boxShadow: "var(--shadow-xs)",
                            cursor: "pointer",
                          }}
                        >
                          {isUrgent && (
                            <div
                              style={{
                                background: "var(--accent)",
                                color: "#FFFFFF",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                padding: "0.3rem 0.85rem",
                              }}
                            >
                              INTERVIEW TOMORROW
                            </div>
                          )}

                          <div style={{ padding: "1rem 1rem 0.75rem" }}>
                            {/* Company & Role Header */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", marginBottom: "0.5rem" }}>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "6px",
                                  background: avatarBg,
                                  color: "#FFFFFF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "0.8rem",
                                  flexShrink: 0,
                                }}
                              >
                                {opp.company[0]}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
                                  {opp.company}
                                </div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                                  {opp.role}
                                </div>
                              </div>
                            </div>

                            {/* Metadata details */}
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.2rem", margin: "0.6rem 0" }}>
                              <div>📍 {opp.location ?? "London · Hybrid"}</div>
                              <div>📅 {colStatus === "Saved" ? "Deadline 22 Nov" : colStatus === "Applied" ? "Applied 12 Nov" : "Target 25 Nov"}</div>
                            </div>
                          </div>

                          {/* Next Action Footer Button */}
                          <div
                            style={{
                              background: "var(--bg-surface-subtle)",
                              borderTop: "1px solid var(--border-light)",
                              padding: "0.6rem 0.85rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>NEXT</span>
                            <button
                              type="button"
                              className="btn-subtle"
                              style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)", padding: 0 }}
                              onClick={() => setEditing(opp)}
                            >
                              {opp.nextAction ?? "Update stage"} →
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filteredOpps.map((opp, idx) => (
            <div
              key={opp.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom: idx < filteredOpps.length - 1 ? "1px solid var(--border-light)" : "none",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{opp.company}</span>
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                  <span style={{ fontSize: "0.9rem" }}>{opp.role}</span>
                  <span className="status-pill pill-primary">{opp.status}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  {opp.location ?? "London"} {opp.url ? `· ${opp.url}` : ""} {opp.nextAction ? `· Next: ${opp.nextAction}` : ""}
                </div>
              </div>

              <div className="row" style={{ alignItems: "center", gap: "0.5rem" }}>
                <select
                  value={opp.status}
                  onChange={(e) => void updateStatus(opp, e.target.value as OpportunityStatus)}
                  style={{ fontSize: "0.78rem", padding: "0.25rem 0.5rem" }}
                  aria-label="Change status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn-secondary" style={{ fontSize: "0.82rem", padding: "0.35rem 0.75rem" }} onClick={() => setEditing(opp)}>
                  Edit
                </button>
                <button type="button" className="btn-subtle" style={{ color: "var(--danger)" }} onClick={() => setRemoveId(opp.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / New Opportunity Modal */}
      {editing && (
        <div className="dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="dialog-panel">
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
              {editing.id ? "Edit Opportunity" : "New Internship Opportunity"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); void saveOpportunity(); }} className="stack">
              <label>
                Company
                <input required placeholder="e.g. Monzo, Spotify, Google" value={editing.company ?? ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} />
              </label>

              <label>
                Role
                <input required placeholder="e.g. Associate Product Manager Intern" value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label>
                  Stage / Status
                  <select value={editing.status ?? "Saved"} onChange={(e) => setEditing({ ...editing, status: e.target.value as OpportunityStatus })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Location
                  <input placeholder="e.g. London · Hybrid" value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
                </label>
              </div>

              <label>
                Next Recommended Action
                <input placeholder="e.g. Tailor CV, Prepare product case study" value={editing.nextAction ?? ""} onChange={(e) => setEditing({ ...editing, nextAction: e.target.value })} />
              </label>

              <label>
                Job Posting URL / Notes
                <textarea placeholder="Notes, salary stipend, requirements..." value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} style={{ minHeight: "75px" }} />
              </label>

              <div className="row" style={{ marginTop: "0.5rem" }}>
                <button type="submit" className="btn-primary">Save Opportunity</button>
                <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JD Analysis Modal */}
      <JDAnalysisModal open={showJdModal} onClose={() => setShowJdModal(false)} />

      {/* Delete Confirm */}
      {removeId && (
        <ConfirmDialog
          title="Delete opportunity?"
          confirmLabel="Delete"
          danger
          onCancel={() => setRemoveId(null)}
          onConfirm={async () => {
            await repos.opportunities.delete(removeId);
            await store.refresh();
            setRemoveId(null);
            toast("Opportunity deleted");
          }}
        >
          Are you sure you want to remove this opportunity from your tracker?
        </ConfirmDialog>
      )}
    </div>
  );
}
