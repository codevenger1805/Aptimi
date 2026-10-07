import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppShell } from "../app/layout/AppShell";

describe("AppShell", () => {
  it("exposes primary navigation landmarks", () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to main content" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Weekly Planner" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Focus Mode" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Internship Tracker" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notes/Whiteboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "To-Do" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });
});
