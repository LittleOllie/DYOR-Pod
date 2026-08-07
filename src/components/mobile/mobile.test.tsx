import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HeroSection } from "@/components/hero/HeroSection";
import { MobileHostList } from "@/components/mobile/MobileHostList";
import { MobileMissionSummary } from "@/components/mobile/MobileMissionSummary";
import { MobileScheduleList } from "@/components/mobile/MobileScheduleList";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getHosts } from "@/content/hosts";
import { getWeeklyShows, shows } from "@/content/shows";

describe("Mobile homepage", () => {
  const sunday = shows.find((s) => s.id === "dyor-sunday")!;

  it("hero uses mobile primary CTA copy", () => {
    render(
      <HeroSection featuredShow={sunday} isAnyLive={false} startDate="2099-01-01T21:00:00.000Z" />,
    );
    expect(screen.getByRole("link", { name: /See what's next/i })).toBeInTheDocument();
    expect(
      document.querySelector('a[href="/#podcast"].md\\:hidden'),
    ).toBeTruthy();
  });

  it("header hides next space CTA on mobile breakpoints", () => {
    render(<SiteHeader isLive={false} ctaHref="/#schedule" nextEventLabel="DYOR Sunday" />);
    const nextSpaceLink = screen.getByRole("link", { name: /Next Space/i });
    expect(nextSpaceLink).toHaveClass("hidden");
    expect(nextSpaceLink).toHaveClass("md:inline-flex");
  });

  it("schedule list renders all shows without carousel controls", () => {
    render(<MobileScheduleList shows={getWeeklyShows()} />);
    expect(screen.getByText("DYOR Sunday")).toBeInTheDocument();
    expect(screen.getByText("Will Work for Crypto")).toBeInTheDocument();
    expect(screen.getByText("No FUD Friday")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Previous show/i)).not.toBeInTheDocument();
  });

  it("schedule row expands with aria-expanded", async () => {
    const user = userEvent.setup();
    render(<MobileScheduleList shows={getWeeklyShows()} />);
    const row = screen.getByRole("button", { name: /DYOR Sunday/i });
    expect(row).toHaveAttribute("aria-expanded", "false");
    await user.click(row);
    expect(row).toHaveAttribute("aria-expanded", "true");
  });

  it("hosts are listed vertically without carousel", () => {
    render(<MobileHostList hosts={getHosts()} />);
    expect(screen.getByText("DW")).toBeInTheDocument();
    expect(screen.getByText("Petey K")).toBeInTheDocument();
    expect(screen.getByText("Janner")).toBeInTheDocument();
    expect(screen.getByText("MJ")).toBeInTheDocument();
  });

  it("mission summary shows three principles only", () => {
    render(<MobileMissionSummary />);
    expect(screen.getByText(/Independent perspectives/i)).toBeInTheDocument();
    expect(screen.getByText(/Live community conversation/i)).toBeInTheDocument();
    expect(screen.getByText(/Research before reaction/i)).toBeInTheDocument();
    expect(screen.queryByText("Community First")).not.toBeInTheDocument();
    expect(screen.getByText(/Read our mission and values/i)).toBeInTheDocument();
  });
});

describe("HeroSection live state", () => {
  const sunday = shows.find((s) => s.id === "dyor-sunday")!;

  it("renders live join CTA", () => {
    render(<HeroSection featuredShow={sunday} isAnyLive={true} />);
    expect(screen.getByRole("link", { name: /Join live/i })).toBeInTheDocument();
  });
});
