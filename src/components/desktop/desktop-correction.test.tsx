import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DesktopSpacesLibraryGrid } from "@/components/desktop/DesktopSpacesLibraryGrid";
import { HostGrid } from "@/components/hosts/HostGrid";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { getLibraryCategories } from "@/content/spacesLibrary";
import { getHosts } from "@/content/hosts";

describe("DesktopSpacesLibraryGrid", () => {
  it("renders one archive card per show with attached recording data", async () => {
    const user = userEvent.setup();
    const categories = getLibraryCategories();
    render(<DesktopSpacesLibraryGrid categories={categories} />);

    expect(screen.getByRole("heading", { level: 2, name: /Spaces Library/i })).toBeInTheDocument();

    const grid = screen.getByLabelText(/Space archive by show/i);
    const cards = within(grid).getAllByRole("article");
    expect(cards).toHaveLength(categories.length);

    for (const category of categories) {
      expect(within(grid).getByRole("heading", { level: 3, name: category.name })).toBeInTheDocument();
      const card = within(grid)
        .getByRole("heading", { level: 3, name: category.name })
        .closest("article")!;
      const count = category.recordings.length;
      if (count > 0) {
        expect(within(card).getByText(new RegExp(`${count} recording`))).toBeInTheDocument();
        expect(within(card).getByRole("button", { name: /View recordings/i })).toBeInTheDocument();
      } else {
        expect(within(card).getByText(/Recordings coming soon/i)).toBeInTheDocument();
      }
    }

    const sundayCard = within(grid)
      .getByRole("heading", { level: 3, name: "DYOR Sunday" })
      .closest("article")!;
    await user.click(within(sundayCard).getByRole("button", { name: /View recordings/i }));
    expect(within(sundayCard).getAllByRole("link", { name: /Listen to episode/i }).length).toBeGreaterThan(0);
  });
});

describe("HostGrid desktop cards", () => {
  it("renders each host inside an individual profile card", () => {
    render(<HostGrid />);
    const hosts = getHosts();
    const desktopRoot = document.querySelector(".host-grid") as HTMLElement;
    expect(desktopRoot).toBeTruthy();

    const cards = within(desktopRoot).getAllByRole("article");
    expect(cards).toHaveLength(hosts.length);

    for (const host of hosts) {
      const card = within(desktopRoot)
        .getByRole("heading", { level: 3, name: host.name })
        .closest("article")!;
      expect(within(card).getByText(host.role)).toBeInTheDocument();
      expect(within(card).getByRole("link")).toHaveAttribute("href", host.xUrl);
    }
  });
});

describe("NewsletterSignup desktop form", () => {
  it("uses balanced grid classes on the desktop form", () => {
    render(<NewsletterSignup />);
    const desktopInput = document.getElementById("newsletter-email-desktop");
    const desktopForm = desktopInput?.closest("form");
    expect(desktopForm).toHaveClass("newsletter-form");

    const fieldRow = desktopInput?.parentElement;
    expect(fieldRow?.className).toMatch(/minmax\(260px,1fr\)/);

    const submit = desktopForm?.querySelector('button[type="submit"]');
    expect(submit?.className).toMatch(/min-\[1151px\]:max-w-\[280px\]/);
  });
});
