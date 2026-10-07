import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Nav } from "./Nav";
import { Header } from "./Header";
import { CommandPalette } from "./CommandPalette";
import { AskAptimiModal } from "../../features/ai/AskAptimiModal";
import { SkipLink } from "../../ui/components/SkipLink";
import { OfflineBanner } from "../../ui/components/OfflineBanner";
import { SampleBanner } from "../../ui/components/SampleBanner";
import { ToastHost } from "../../ui/components/Toast";

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const location = useLocation();

  // Focus mode intentionally uses a full immersive dark canvas without default shell
  const isFocusMode = location.pathname.startsWith("/focus");

  if (isFocusMode) {
    return (
      <>
        <SkipLink />
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <ToastHost />
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <div className="app-layout">
        <Nav onOpenAi={() => setAiModalOpen(true)} mobileNavOpen={mobileNavOpen} />
        <div className="app-main-area">
          <Header
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onToggleMobileNav={() => setMobileNavOpen((v) => !v)}
          />
          <main id="main" className="app-content" tabIndex={-1}>
            <SampleBanner />
            <OfflineBanner />
            <Outlet />
          </main>
        </div>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <AskAptimiModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      <ToastHost />
    </>
  );
}
