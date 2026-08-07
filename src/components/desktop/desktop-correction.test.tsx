import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SpacesLibrary } from "@/components/library/SpacesLibrary";
import { HostGrid } from "@/components/hosts/HostGrid";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { getLibraryCategories } from "@/content/spacesLibrary";
import { getHosts } from "@/content/hosts";

describe("SpacesLibrary desktop", () => {
  it("renders compact show dropdowns for each archive category", async () => {
    const user = userEvent.setup();
    const categories = getLibraryCategories();
    render(<SpacesLibrary categories={categories} />);

    expect(
      screen.getAllByRole("heading", { level: 2, name: /Spaces Library/i }).length,
    ).toBeGreaterThan(0);

    const archive = screen.getByLabelText("Space archive by show");
    expect(archive.querySelectorAll("details")).toHaveLength(categories.length);

    for (const category of categories) {
      expect(within(archive).getByText(category.name)).toBeInTheDocument();
    }

    const sundayCard = within(archive).getByText("DYOR Sunday").closest("details");
    expect(sundayCard).toBeTruthy();
    await user.click(within(sundayCard as HTMLElement).getByText("DYOR Sunday"));

    const sundayRecordings = categories.find((c) => c.showId === "dyor-sunday")!.recordings;
    for (const recording of sundayRecordings) {
      expect(
        within(sundayCard as HTMLElement).getByRole("link", {
          name: `Listen to episode ${recording.episode} on X`,
        }),
      ).toBeInTheDocument();
    }
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
