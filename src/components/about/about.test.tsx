import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutDYOR } from "@/components/about/AboutDYOR";
import { DesktopMissionPanel } from "@/components/desktop/DesktopMissionPanel";
import { MobileMissionSummary } from "@/components/mobile/MobileMissionSummary";
import { MissionAscentProvider } from "@/features/mission-ascent/context/MissionAscentContext";
import { aboutSection, coreValues } from "@/content/about";

function renderAbout() {
  return render(
    <MissionAscentProvider>
      <AboutDYOR />
    </MissionAscentProvider>,
  );
}

describe("MobileMissionSummary", () => {
  it("renders values section for mobile homepage", () => {
    render(<MobileMissionSummary />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Our Values/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/think independently/i)).toBeInTheDocument();
    expect(screen.getByText(/Signal over noise/i)).toBeInTheDocument();
    expect(screen.getByText("Community First")).toBeInTheDocument();
  });
});

describe("DesktopMissionPanel", () => {
  it("renders values heading and cards", () => {
    render(<DesktopMissionPanel />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Our Values/i }),
    ).toBeInTheDocument();

    const valuesRegion = screen.getByRole("region", {
      name: aboutSection.heading,
    });

    expect(valuesRegion).toBeInTheDocument();

    for (const value of coreValues) {
      expect(screen.getByText(value.title)).toBeInTheDocument();
    }
  });
});

describe("AboutDYOR", () => {
  it("renders both mobile summary and desktop panel markup", () => {
    renderAbout();

    expect(
      screen.getAllByRole("heading", { level: 2, name: /Our Values/i }).length,
    ).toBeGreaterThan(0);
  });
});
