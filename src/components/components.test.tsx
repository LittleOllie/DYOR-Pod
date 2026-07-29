import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "@/components/hero/HeroSection";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { ShowGrid } from "@/components/shows/ShowGrid";
import { shows } from "@/content/shows";

describe("HeroSection", () => {
  const sunday = shows.find((s) => s.id === "dyor-sunday")!;

  it("renders upcoming state", () => {
    render(
      <HeroSection featuredShow={sunday} isAnyLive={false} startDate="2099-01-01T21:00:00.000Z" />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Crypto conversations worth tuning in for/,
    );
    expect(screen.getByRole("link", { name: /View Next Space/i })).toBeInTheDocument();
  });

  it("renders live state", () => {
    render(<HeroSection featuredShow={sunday} isAnyLive={true} />);
    expect(screen.getByRole("link", { name: /Join Live on X/i })).toBeInTheDocument();
  });

  it("renders fallback when no x url on pending show", () => {
    const pending = shows.find((s) => s.id === "will-work-for-crypto")!;
    render(<HeroSection featuredShow={pending} isAnyLive={false} />);
    expect(screen.getByText(/Time to be confirmed/i)).toBeInTheDocument();
  });
});

describe("ShowGrid", () => {
  it("renders programme carousel", () => {
    render(<ShowGrid />);
    expect(screen.getByRole("heading", { name: /Four Ways to Tune In/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /DYOR programmes/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "DYOR Sunday" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Will Work for Crypto" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "No FUD Friday" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "The DYOR Podcast" })).toBeInTheDocument();
  });
});

describe("NewsletterSignup", () => {
  it("shows validation for invalid email", async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText(/Email address/i);
    await user.type(input, "not-an-email");
    await user.click(screen.getByRole("button", { name: /Join the Briefing/i }));

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
    await user.type(screen.getByLabelText(/Email address/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /Join the Briefing/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/not yet configured/i);
    vi.unstubAllGlobals();
  });
});
