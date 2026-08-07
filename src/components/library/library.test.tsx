import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SpacesLibrary } from "@/components/library/SpacesLibrary";
import { getLibraryCategories, spaceRecordings } from "@/content/spacesLibrary";

describe("SpacesLibrary", () => {
  it("renders compact show dropdowns with episode links", async () => {
    const user = userEvent.setup();
    const categories = getLibraryCategories();
    render(<SpacesLibrary categories={categories} />);

    expect(
      screen.getAllByRole("heading", { level: 2, name: /Spaces Library/i }).length,
    ).toBeGreaterThan(0);

    const archive = screen.getByLabelText("Space archive by show");
    const sundaySection = document.getElementById("library-recordings-dyor-sunday")?.closest("details");
    expect(sundaySection).not.toHaveAttribute("open");

    const sundaySummary = within(archive).getByText("DYOR Sunday").closest("summary");
    expect(sundaySummary).toBeTruthy();
    await user.click(sundaySummary!);
    expect(sundaySection).toHaveAttribute("open");

    for (const recording of spaceRecordings.filter((r) => r.showId === "dyor-sunday")) {
      expect(
        within(sundaySection!).getAllByText(new RegExp(`Ep\\. ${recording.episode}(?:\\s|·|$)`))
          .length,
      ).toBeGreaterThan(0);
      expect(
        within(sundaySection!).getByRole("link", {
          name: `Listen to episode ${recording.episode} on X`,
        }),
      ).toBeInTheDocument();
    }

    const wwfcSummary = within(archive).getByText("Will Work for Crypto").closest("summary");
    expect(wwfcSummary).toBeTruthy();
    await user.click(wwfcSummary!);

    const wwfcSection = document
      .getElementById("library-recordings-will-work-for-crypto")
      ?.closest("details");
    expect(wwfcSection).toHaveAttribute("open");

    for (const recording of spaceRecordings.filter((r) => r.showId === "will-work-for-crypto")) {
      expect(
        within(wwfcSection!).getByRole("link", {
          name: `Listen to episode ${recording.episode} on X`,
        }),
      ).toBeInTheDocument();
    }
  });
});
