import { useState } from "react";
import { useAppStore } from "../../store/appStore";
import { EmptyState } from "../../ui/components/EmptyState";
import { newId, nowIso, repos } from "../../data/repositories";
import type { Whiteboard, WhiteboardObject, WhiteboardObjectType } from "../../domain/types";

const COLORS = ["#215a4a", "#1a4d80", "#7a5a12", "#8a2b2b", "#1c1b18"];

export function WhiteboardPage() {
  const store = useAppStore();
  const board = store.whiteboards[0];
  const [selected, setSelected] = useState<string | null>(null);
  const [color, setColor] = useState(COLORS[0]);

  async function ensureBoard(): Promise<Whiteboard | undefined> {
    if (board) return board;
    if (!store.profile) return;
    const t = nowIso();
    const created: Whiteboard = {
      id: newId(),
      profileId: store.profile.id,
      title: "Career whiteboard",
      objects: [],
      createdAt: t,
      updatedAt: t,
    };
    await repos.whiteboards.put(created);
    await store.refresh();
    return created;
  }

  async function persist(next: Whiteboard) {
    await repos.whiteboards.put({ ...next, updatedAt: nowIso() });
    await store.refresh();
  }

  async function add(type: WhiteboardObjectType) {
    const current = await ensureBoard();
    if (!current) return;
    const obj: WhiteboardObject = {
      id: newId(),
      type,
      x: 40 + current.objects.length * 16,
      y: 40 + current.objects.length * 16,
      width: type === "text" ? 160 : 80,
      height: type === "text" ? 48 : 80,
      text: type === "text" ? "Text" : undefined,
      style: { color, fill: color },
      zIndex: current.objects.length + 1,
    };
    await persist({ ...current, objects: [...current.objects, obj] });
    setSelected(obj.id);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!board || !selected) return;
    const obj = board.objects.find((o) => o.id === selected);
    if (!obj) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      void persist({ ...board, objects: board.objects.filter((o) => o.id !== selected) });
      setSelected(null);
    }
    const delta = e.shiftKey ? 10 : 4;
    let x = obj.x;
    let y = obj.y;
    if (e.key === "ArrowLeft") x -= delta;
    if (e.key === "ArrowRight") x += delta;
    if (e.key === "ArrowUp") y -= delta;
    if (e.key === "ArrowDown") y += delta;
    if (x !== obj.x || y !== obj.y) {
      e.preventDefault();
      void persist({
        ...board,
        objects: board.objects.map((o) => (o.id === obj.id ? { ...o, x, y } : o)),
      });
    }
  }

  return (
    <div className="stack" onKeyDown={onKey}>
      <h1>Whiteboard</h1>
      <p className="muted">
        Text boxes, rectangles, and circles. Keyboard: select an object, arrows to move, Delete to
        remove. Use Notes if you need a simpler capture.
      </p>
      <div className="row">
        <button type="button" onClick={() => void add("text")}>
          Add text
        </button>
        <button type="button" className="secondary" onClick={() => void add("rect")}>
          Add rectangle
        </button>
        <button type="button" className="secondary" onClick={() => void add("circle")}>
          Add circle
        </button>
        <label>
          Color
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Linked milestone
          <select
            value={board?.linkedEntityId ?? ""}
            onChange={(e) => {
              if (!board) return;
              void persist({
                ...board,
                linkedEntityType: e.target.value ? "milestone" : undefined,
                linkedEntityId: e.target.value || undefined,
              });
            }}
          >
            <option value="">None</option>
            {store.milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!board || board.objects.length === 0 ? (
        <EmptyState title="Empty canvas">Add a text box or shape. Nothing is decorative-only.</EmptyState>
      ) : null}
      <div className="whiteboard-board" role="application" aria-label="Whiteboard canvas">
        {(board?.objects ?? []).map((obj) => (
          <div
            key={obj.id}
            className={`wb-item ${selected === obj.id ? "selected" : ""}`}
            tabIndex={0}
            role="button"
            aria-label={`${obj.type} ${obj.text ?? ""}`.trim()}
            style={{
              left: obj.x,
              top: obj.y,
              width: obj.width,
              height: obj.height,
              borderColor: obj.style?.color,
              borderRadius: obj.type === "circle" ? "50%" : 4,
              zIndex: obj.zIndex,
            }}
            onClick={() => setSelected(obj.id)}
            onFocus={() => setSelected(obj.id)}
            draggable
            onDragEnd={(e) => {
              if (!board) return;
              const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
              const x = e.clientX - rect.left - obj.width / 2;
              const y = e.clientY - rect.top - obj.height / 2;
              void persist({
                ...board,
                objects: board.objects.map((o) =>
                  o.id === obj.id ? { ...o, x: Math.max(0, x), y: Math.max(0, y) } : o,
                ),
              });
            }}
          >
            {obj.type === "text" ? (
              <input
                aria-label="Whiteboard text"
                value={obj.text ?? ""}
                onChange={(e) => {
                  if (!board) return;
                  void persist({
                    ...board,
                    objects: board.objects.map((o) =>
                      o.id === obj.id ? { ...o, text: e.target.value } : o,
                    ),
                  });
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
