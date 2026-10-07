import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { AppShell } from "./layout/AppShell";

export function RequireOnboarding() {
  const { ready, profile, error } = useAppStore();
  if (!ready) return <p>Loading APTIMI…</p>;
  if (error) {
    return (
      <main id="main" className="main">
        <h1>Storage error</h1>
        <p>{error}</p>
        <p>Your source data was not overwritten. Try exporting from another browser profile if available.</p>
      </main>
    );
  }
  if (!profile?.onboardingCompletedAt) {
    return <Navigate to="/onboarding" replace />;
  }
  return <AppShell />;
}
