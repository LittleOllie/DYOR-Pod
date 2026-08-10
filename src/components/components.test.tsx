import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "@/components/hero/HeroSection";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { ScheduleCarousel } from "@/components/schedule/ScheduleCarousel";
import { getWeeklyShows, shows } from "@/content/shows";

describe("HeroSection", () => {
  const sunday = shows.find((s) => s.id === "dyor-sunday")!;

  it("renders upcoming state", () => {
    render(
      <HeroSection featuredShow={sunday} isAnyLive={false} startDate="2099-01-01T21:00:00.000Z" />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Crypto conversations worth tuning in for/,
    );
    expect(screen.getByRole("link", { name: /See what's next/i })).toBeInTheDocument();
  });

  it("renders live state", () => {
    render(<HeroSection featuredShow={sunday} isAnyLive={true} />);
    expect(screen.getByRole("link", { name: /Join live/i })).toBeInTheDocument();
  });

  it("renders confirmed WWFC in hero card", () => {
    const wwfc = shows.find((s) => s.id === "will-work-for-crypto")!;
    render(
      <HeroSection
        featuredShow={wwfc}
        isAnyLive={false}
        startDate="2099-01-07T23:00:00.000Z"
      />,
    );
    expect(screen.getByText(/Will Work for Crypto/i)).toBeInTheDocument();
    expect(screen.getByText(/Live in/i)).toBeInTheDocument();
  });
});

describe("ScheduleCarousel", () => {
  it("renders weekly show carousel", () => {
    render(<ScheduleCarousel shows={getWeeklyShows()} />);
    expect(screen.getByRole("region", { name: /Weekly DYOR schedule/i })).toBeInTheDocument();
    expect(screen.getAllByText("DYOR Sunday").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Will Work for Crypto").length).toBeGreaterThan(0);
  });
});

describe("NewsletterSignup", () => {
  it("shows validation for invalid email", async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = document.getElementById("newsletter-email-mobile") as HTMLInputElement;
    const mobileForm = input.closest("form")!;
    await user.type(input, "not-an-email");
    await user.click(mobileForm.querySelector('button[type="submit"]')!);

    expect(input).toBeInvalid();
  });

  it("shows server error when not configured", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          success: false,
          message: "Newsletter signup is not yet configured.",
        }),
        ok: false,
        status: 503,
      }),
    );

    render(<NewsletterSignup />);
    const input = document.getElementById("newsletter-email-mobile") as HTMLInputElement;
    const mobileForm = input.closest("form")!;
    await user.type(input, "test@example.com");
    await user.click(mobileForm.querySelector('button[type="submit"]')!);

    expect(document.getElementById("newsletter-error-mobile")).toHaveTextContent(
      /not yet configured/i,
    );
    vi.unstubAllGlobals();
  });
});
