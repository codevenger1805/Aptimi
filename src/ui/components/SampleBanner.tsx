import { useAppStore } from "../../store/appStore";

export function SampleBanner() {
  const sample = useAppStore((s) => s.profile?.isSampleProfile);
  if (!sample) return null;
  return (
    <div className="banner sample" role="status">
      Sample data — this is a labeled example profile, not your real progress.
    </div>
  );
}
