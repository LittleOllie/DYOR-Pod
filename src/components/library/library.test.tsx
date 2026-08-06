import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SpacesLibrary } from "@/components/library/SpacesLibrary";
import { getLibraryCategories, spaceRecordings } from "@/content/spacesLibrary";

describe("SpacesLibrary", () => {
  it("renders collapsible show sections and episode disclosures", async () => {
    const user = userEvent.setup();
    const categories = getLibraryCategories();
    render(<SpacesLibrary categories={categories} />);

    expect(
      screen.getAllByRole("heading", { level: 2, name: /Spaces Library/i }).length,
    ).toBeGreaterThan(0);

    const sundaySection = document.getElementById("library-recordings-dyor-sunday")?.closest("details");
    expect(sundaySection).not.toHaveAttribute("open");

    const mobileRoot = document.querySelector(".md\\:hidden .flex.flex-col.gap-2");
    expect(mobileRoot).toBeTruthy();

    const sundaySummary = within(mobileRoot as HTMLElement)
      .getAllByText("DYOR Sunday")[0]
      .closest("summary");
    expect(sundaySummary).toBeTruthy();
    await user.click(sundaySummary!);
    expect(sundaySection).toHaveAttribute("open");

    for (const recording of spaceRecordings.filter((r) => r.showId === "dyor-sunday")) {
      expect(
        within(sundaySection!).getAllByText(new RegExp(`Ep\\. ${recording.episode}(?:\\s|·|$)`))
          .length,
      ).toBeGreaterThan(0);
    }

    const wwfcSummary = within(mobileRoot as HTMLElement)
      .getAllByText("Will Work for Crypto")[0]
      .closest("summary");
    expect(wwfcSummary).toBeTruthy();
    await user.click(wwfcSummary!);

    const wwfcSection = document.getElementById("library-recordings-will-work-for-crypto")?.closest("details");
    expect(wwfcSection).toHaveAttribute("open");

    const wwfcEpisodes = spaceRecordings.filter((r) => r.showId === "will-work-for-crypto");
    for (const recording of wwfcEpisodes) {
      expect(
        within(wwfcSection!).getAllByText(new RegExp(`Ep\\. ${recording.episode}(?:\\s|·|$)`))
          .length,
      ).toBeGreaterThan(0);
    }

    const ep5 = within(sundaySection!).getAllByText(/Ep\. 5/)[0].closest("details");
    expect(ep5).not.toHaveAttribute("open");
    await user.click(ep5!.querySelector("summary")!);
    expect(ep5).toHaveAttribute("open");
    expect(
      within(ep5 as HTMLElement).getByRole("link", { name: /Listen to episode 5 on X/i }),
    ).toBeInTheDocument();
  });
});
