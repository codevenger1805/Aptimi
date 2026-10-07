import { useEffect, useId, useRef, type ReactNode } from "react";

export function ConfirmDialog({
  title,
  children,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const headingId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current?.querySelector("button") as HTMLButtonElement | null;
    node?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={headingId}>{title}</h2>
        <div>{children}</div>
        <div className="row" style={{ marginTop: "1rem" }}>
          <button type="button" className={danger ? "danger" : undefined} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
