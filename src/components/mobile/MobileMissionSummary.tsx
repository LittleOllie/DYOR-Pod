import {
  aboutSection,
} from "@/content/about";
import { missionMobile } from "@/content/site";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";

const mobilePrinciples = [
  {
    title: "Independent perspectives",
    description: "Explore different views before forming your own.",
  },
  {
    title: "Live community conversation",
    description: "Learn through open discussion with the people living the market.",
  },
  {
    title: "Research before reaction",
    description: "Look beyond headlines, hype and screenshots.",
  },
] as const;

export function MobileMissionSummary() {
  return (
    <div className="md:hidden">
      <MobileSectionHeader
        id="about-heading"
        title={missionMobile.title}
        accent="Own Research"
      />

      <p className="text-[15px] leading-[1.65] text-text-secondary">{missionMobile.mission}</p>

      <ul className="mt-6 space-y-4">
        {mobilePrinciples.map((principle) => (
          <li key={principle.title} className="flex gap-3">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
              aria-hidden="true"
            />
            <div>
              <p className="font-heading text-base font-bold capitalize text-text-primary">
                {principle.title}
              </p>
              <p className="mt-1 text-sm leading-snug text-text-secondary">
                {principle.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm font-medium leading-snug text-text-primary">
        {missionMobile.valuesLine}
      </p>

      <a
        href="/legal?tab=disclaimer"
        className="mt-4 inline-block text-xs text-text-secondary/80 underline-offset-2 hover:text-brand-bright hover:underline focus-ring"
      >
        Editorial disclaimer
      </a>

      <details className="mt-6 rounded-[var(--radius-large)] border border-border/80 bg-surface/30">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-brand-bright focus-ring">
          {missionMobile.readMoreLabel}
        </summary>
        <div className="border-t border-border/60 px-4 py-3 text-sm leading-relaxed text-text-secondary">
          <p>{aboutSection.disclaimer}</p>
        </div>
      </details>
    </div>
  );
}
