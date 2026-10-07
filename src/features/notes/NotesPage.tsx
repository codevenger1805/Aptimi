import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { EmptyState } from "../../ui/components/EmptyState";
import { ConfirmDialog } from "../../ui/components/ConfirmDialog";
import { newId, nowIso, repos } from "../../data/repositories";
import type { LinkedEntityType, Note } from "../../domain/types";
import { WhiteboardPage } from "../whiteboard/WhiteboardPage";

export function NotesPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "whiteboard" ? "whiteboard" : "notes";
  return (
    <div className="stack" style={{ gap: "2rem", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="section-eyebrow">CAPTURE & CONNECT</div>
          <h1 className="editorial-h1">Notes & Evidence</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "680px", marginTop: "0.35rem" }}>
            Capture ideas, project details, and learning evidence to connect with your career journey.
          </p>
        </div>
        
        <div style={{ display: "flex", background: "var(--bg-surface)", padding: "0.25rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <button
            type="button"
            className="btn-subtle"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: tab === "notes" ? "var(--primary)" : "transparent",
              color: tab === "notes" ? "#fff" : "var(--text-secondary)",
              fontWeight: tab === "notes" ? 500 : 400,
            }}
            onClick={() => setParams({})}
          >
            Notes
          </button>
          <button
            type="button"
            className="btn-subtle"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: tab === "whiteboard" ? "var(--primary)" : "transparent",
              color: tab === "whiteboard" ? "#fff" : "var(--text-secondary)",
              fontWeight: tab === "whiteboard" ? 500 : 400,
            }}
            onClick={() => setParams({ tab: "whiteboard" })}
          >
            Whiteboard
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === "notes" ? <NotesList /> : <WhiteboardPage />}
      </div>
    </div>
  );
}

function NotesList() {
  const store = useAppStore();
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(store.notes[0]?.id ?? null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  
  const notes = store.notes
    .filter((n) => !n.archivedAt && (`${n.title} ${n.body}`.toLowerCase().includes(q.toLowerCase()) || !q))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    
  const archived = store.notes.filter((n) => n.archivedAt);

  async function create() {
    if (!store.profile) return;
    const t = nowIso();
    const note: Note = {
      id: newId(),
      profileId: store.profile.id,
      title: "Untitled note",
      body: "",
      createdAt: t,
      updatedAt: t,
    };
    await repos.notes.put(note);
    await store.refresh();
    setActiveId(note.id);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", height: "100%" }}>
      {/* Sidebar */}
      <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)" }}>
          <button type="button" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "1rem" }} onClick={() => void create()}>
            Create new note
          </button>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              placeholder="Search notes..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              style={{ width: "100%", padding: "0.5rem 0.5rem 0.5rem 2rem", fontSize: "0.85rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface-subtle)" }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {notes.length === 0 ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {q ? "No notes found." : "Create a note to get started."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {notes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setActiveId(n.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    background: activeId === n.id ? "var(--bg-surface-muted)" : "transparent",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s"
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: activeId === n.id ? 600 : 500, marginBottom: "0.25rem" }}>
                    {n.title || "Untitled"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {n.body ? n.body.substring(0, 50) : "No content"}
                  </span>
                </button>
              ))}
            </div>
          )}
          
          {archived.length > 0 && (
            <details style={{ marginTop: "1rem" }}>
              <summary style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)", cursor: "pointer", userSelect: "none" }}>
                Archived ({archived.length})
              </summary>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0.5rem" }}>
                {archived.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setActiveId(n.id)}
                    style={{
                      display: "block",
                      padding: "0.5rem 0.5rem",
                      borderRadius: "6px",
                      border: "none",
                      background: activeId === n.id ? "var(--bg-surface-muted)" : "transparent",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "0.8rem"
                    }}
                  >
                    {n.title || "Untitled"}
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* Editor */}
      {activeId ? (
        <NoteEditor
          noteId={activeId}
          onDelete={() => setConfirmId(activeId)}
        />
      ) : (
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-surface-subtle)" }}>
          <EmptyState title="Select a note">Create a new note or select one from the list.</EmptyState>
        </div>
      )}
      
      {confirmId ? (
        <ConfirmDialog
          title="Delete note?"
          danger
          confirmLabel="Delete"
          onCancel={() => setConfirmId(null)}
          onConfirm={async () => {
            await repos.notes.delete(confirmId);
            await store.refresh();
            setConfirmId(null);
            setActiveId(null);
          }}
        >
          This cannot be undone except from a backup.
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

function NoteEditor({ noteId, onDelete }: { noteId: string; onDelete: () => void }) {
  const store = useAppStore();
  const note = store.notes.find((n) => n.id === noteId);
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [linkType, setLinkType] = useState<LinkedEntityType | "">(
    note?.linkedEntityType ?? "",
  );
  const [linkId, setLinkId] = useState(note?.linkedEntityId ?? "");
  const [status, setStatus] = useState<"saved" | "unsaved">("saved");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
    setLinkType(note?.linkedEntityType ?? "");
    setLinkId(note?.linkedEntityId ?? "");
    setStatus("saved");
  }, [noteId, note?.id]);

  useEffect(() => {
    if (!note) return;
    if (title === note.title && body === note.body && (linkId || "") === (note.linkedEntityId ?? "") && (linkType || "") === (note.linkedEntityType ?? "")) {
      return;
    }
    setStatus("unsaved");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      await repos.notes.put({
        ...note,
        title,
        body,
        linkedEntityType: linkType || undefined,
        linkedEntityId: linkId || undefined,
        updatedAt: nowIso(),
      });
      await store.refresh();
      setStatus("saved");
    }, 400);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [title, body, linkType, linkId]);

  if (!note) return <div className="card"><EmptyState title="Note missing" /></div>;

  const linkOptions =
    linkType === "milestone"
      ? store.milestones.map((m) => ({ id: m.id, label: m.title }))
      : linkType === "roadmapTask"
        ? store.tasks.map((t) => ({ id: t.id, label: t.title }))
        : linkType === "personalTodo"
          ? store.todos.map((t) => ({ id: t.id, label: t.title }))
          : linkType === "opportunity"
            ? store.opportunities.map((o) => ({ id: o.id, label: o.company }))
            : [];

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {note.archivedAt && (
            <span className="status-pill pill-neutral">Archived</span>
          )}
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status === "saved" ? "var(--success)" : "var(--warning)" }}></span>
            {status === "saved" ? "Autosaved" : "Saving..."}
          </span>
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn-subtle"
            style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
            onClick={async () => {
              const isArchived = !!note.archivedAt;
              await repos.notes.put({ ...note, archivedAt: isArchived ? undefined : nowIso(), updatedAt: nowIso() });
              await store.refresh();
            }}
          >
            {note.archivedAt ? "Unarchive" : "Archive"}
          </button>
          <button
            type="button"
            className="btn-subtle"
            style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: "var(--danger)" }}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "1.5rem", overflowY: "auto" }}>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Note Title"
          style={{ 
            fontSize: "1.5rem", 
            fontWeight: 600, 
            border: "none", 
            background: "transparent", 
            outline: "none", 
            marginBottom: "1rem",
            color: "var(--text-primary)"
          }} 
        />
        
        <textarea 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          placeholder="Start typing your note here..."
          style={{ 
            flex: 1, 
            border: "none", 
            background: "transparent", 
            outline: "none", 
            resize: "none",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            color: "var(--text-primary)"
          }} 
        />
        
        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px dashed var(--border)", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}>Link to:</span>
          <select
            value={linkType}
            onChange={(e) => {
              setLinkType(e.target.value as LinkedEntityType | "");
              setLinkId("");
            }}
            style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-surface)" }}
          >
            <option value="">None</option>
            <option value="milestone">Milestone</option>
            <option value="roadmapTask">Roadmap task</option>
            <option value="personalTodo">Personal to-do</option>
            <option value="opportunity">Opportunity</option>
          </select>
          
          {linkType && (
            <select 
              value={linkId} 
              onChange={(e) => setLinkId(e.target.value)}
              style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-surface)", flex: 1, minWidth: "200px" }}
            >
              <option value="">Select item...</option>
              {linkOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
