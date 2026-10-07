import type { ReactNode } from "react";

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div className="banner error" role="alert">
      {children}
    </div>
  );
}
