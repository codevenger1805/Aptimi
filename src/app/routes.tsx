import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RequireOnboarding } from "./RequireOnboarding";
import { OnboardingPage } from "../features/onboarding/OnboardingPage";

const DashboardPage = lazy(() =>
  import("../features/analytics/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const RoadmapPage = lazy(() =>
  import("../features/roadmap/RoadmapPage").then((m) => ({ default: m.RoadmapPage })),
);
const MilestoneDetailPage = lazy(() =>
  import("../features/roadmap/MilestoneDetailPage").then((m) => ({ default: m.MilestoneDetailPage })),
);
const AssessmentPage = lazy(() =>
  import("../features/assessment/AssessmentPage").then((m) => ({ default: m.AssessmentPage })),
);
const ReadinessPage = lazy(() =>
  import("../features/readiness/ReadinessPage").then((m) => ({ default: m.ReadinessPage })),
);
const PlannerPage = lazy(() =>
  import("../features/planner/PlannerPage").then((m) => ({ default: m.PlannerPage })),
);
const FocusPage = lazy(() =>
  import("../features/focus/FocusPage").then((m) => ({ default: m.FocusPage })),
);
const InternshipsPage = lazy(() =>
  import("../features/internships/InternshipsPage").then((m) => ({ default: m.InternshipsPage })),
);
const NotesPage = lazy(() =>
  import("../features/notes/NotesPage").then((m) => ({ default: m.NotesPage })),
);
const TodosPage = lazy(() =>
  import("../features/todos/TodosPage").then((m) => ({ default: m.TodosPage })),
);
const WhiteboardPage = lazy(() =>
  import("../features/whiteboard/WhiteboardPage").then((m) => ({ default: m.WhiteboardPage })),
);
const SettingsPage = lazy(() =>
  import("../features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

function Fallback() {
  return (
    <div style={{ padding: "40px", display: "flex", justifyContent: "center", color: "var(--color-ink-muted)" }}>
      Loading…
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<RequireOnboarding />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/progress" element={<ReadinessPage />} />
          <Route path="/readiness" element={<ReadinessPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/roadmap/milestones/:id" element={<MilestoneDetailPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/whiteboard" element={<WhiteboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
