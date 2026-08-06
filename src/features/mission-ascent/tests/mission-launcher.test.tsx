import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MissionAscentProvider } from "@/features/mission-ascent/context/MissionAscentContext";
import { MissionLauncher } from "@/features/mission-ascent/components/MissionLauncher";
import { MissionOverlay } from "@/features/mission-ascent/components/MissionOverlay";

vi.mock("@/features/mission-ascent/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

describe("MissionLauncher", () => {
  it("renders launcher panel with launch button", () => {
    render(
      <MissionAscentProvider>
        <MissionLauncher />
      </MissionAscentProvider>,
    );
    expect(screen.getByText(/Mission Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/DYOR: Mission Ascent/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Launch Mission/i })).toBeInTheDocument();
  });

  it("opens mission on launch click", async () => {
    const user = userEvent.setup();
    render(
      <MissionAscentProvider>
        <MissionLauncher />
        <MissionOverlay />
      </MissionAscentProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Launch Mission/i }));
    expect(await screen.findByRole("dialog", { name: /DYOR Mission Ascent/i })).toBeInTheDocument();
  });
});
