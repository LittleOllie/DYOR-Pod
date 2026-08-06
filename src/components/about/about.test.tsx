import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutDYOR } from "@/components/about/AboutDYOR";
import { DesktopMissionPanel } from "@/components/desktop/DesktopMissionPanel";
import { MobileMissionSummary } from "@/components/mobile/MobileMissionSummary";
import { MissionAscentProvider } from "@/features/mission-ascent/context/MissionAscentContext";
import { aboutSection, coreValues, researchPrinciples } from "@/content/about";

function renderAbout() {
  return render(
    <MissionAscentProvider>
      <AboutDYOR />
    </MissionAscentProvider>,
  );
}

describe("MobileMissionSummary", () => {
  it("renders concise mission summary for mobile homepage", () => {
    render(<MobileMissionSummary />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Do Your Own Research/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/think independently/i)).toBeInTheDocument();
    expect(screen.getByText(/Independent perspectives/i)).toBeInTheDocument();
    expect(screen.getByText(/Live community conversation/i)).toBeInTheDocument();
    expect(screen.getByText(/Research before reaction/i)).toBeInTheDocument();
    expect(screen.queryByText("Community First")).not.toBeInTheDocument();
    expect(screen.getByText(/Read our mission and values/i)).toBeInTheDocument();
  });
});

describe("DesktopMissionPanel", () => {
  it("renders editorial mission with principles and values", () => {
    render(<DesktopMissionPanel />);

    expect(
      screen.getByRole("heading", { level: 2, name: /Do Your Own Research/i }),
    ).toBeInTheDocument();

    const principlesRegion = screen.getByRole("region", {
      name: aboutSection.principlesLabel,
    });
    const valuesRegion = screen.getByRole("region", {
      name: aboutSection.valuesLabel,
    });

    expect(
      principlesRegion.compareDocumentPosition(valuesRegion) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    for (const principle of researchPrinciples) {
      expect(screen.getByText(new RegExp(principle.title, "i"))).toBeInTheDocument();
    }

    for (const value of coreValues) {
      expect(screen.getByText(value.title)).toBeInTheDocument();
    }

    expect(screen.getByText(/Editorial disclaimer/i)).toBeInTheDocument();
  });
});

describe("AboutDYOR", () => {
  it("renders both mobile summary and desktop panel markup", () => {
    renderAbout();

    expect(
      screen.getAllByRole("heading", { level: 2, name: /Do Your Own Research/i }).length,
    ).toBeGreaterThan(0);
  });
});
