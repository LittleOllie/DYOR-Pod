import Link from "next/link";
import {
  aboutSection,
  coreValues,
  researchPrinciples,
} from "@/content/about";
import { HeadingWithAccent } from "@/components/ui/ColorfulAccent";
import { cn } from "@/lib/utils/cn";

function PrincipleRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-t border-border/40 py-6 first:border-t-0 first:pt-0 lg:py-8">
      <h3 className="font-heading text-xl font-bold capitalize text-text-primary lg:text-2xl">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-base leading-relaxed text-text-secondary lg:text-lg">
        {description}
      </p>
    </div>
  );
}

function ValueCard({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "rounded-[var(--radius-large)] border border-border/80 bg-surface/50 p-5 shadow-[inset_0_1px_0_rgba(49,209,198,0.06)] transition-[border-color,background-color] duration-[var(--motion-base)] hover:border-brand/25 hover:bg-surface/70",
        className,
      )}
    >
      <p className="font-heading text-lg font-bold text-text-primary">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
    </li>
  );
}

export function DesktopMissionPanel() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -left-6 top-0 hidden h-32 w-32 rounded-full bg-brand/5 blur-3xl lg:block xl:-left-12"
        aria-hidden="true"
      />

      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
          {aboutSection.eyebrow}
        </p>
        <h2
          id="about-heading"
          className="mt-3 font-heading text-4xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-[3.5rem] lg:leading-[1.05] xl:text-6xl"
        >
          <HeadingWithAccent
            title={aboutSection.heading}
            accent={aboutSection.headingAccent}
          />
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-text-secondary lg:text-xl lg:leading-relaxed">
          {aboutSection.mission}
        </p>
      </header>

      <div
        role="region"
        aria-labelledby="desktop-principles-heading"
        className="mt-12 grid gap-0 lg:mt-16 lg:grid-cols-3 lg:gap-8"
      >
        <h3 id="desktop-principles-heading" className="sr-only">
          {aboutSection.principlesLabel}
        </h3>
        {researchPrinciples.map((principle) => (
          <PrincipleRow
            key={principle.title}
            title={principle.title}
            description={principle.description}
          />
        ))}
      </div>

      <div
        role="region"
        aria-labelledby="desktop-values-heading"
        className="mt-10 border-t border-border/50 pt-10 lg:mt-14 lg:pt-14"
      >
        <h3
          id="desktop-values-heading"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-brand/90"
        >
          {aboutSection.valuesLabel}
        </h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {coreValues.map((value) => (
            <ValueCard key={value.title} title={value.title} description={value.description} />
          ))}
        </ul>
      </div>

      <p className="mt-10 max-w-3xl font-heading text-xl font-medium leading-snug text-text-primary lg:mt-12 lg:text-2xl">
        {aboutSection.brandStatement.join(" ")}
      </p>

      <p className="mt-6">
        <Link
          href="/legal?tab=disclaimer"
          className="text-xs text-text-secondary/60 underline-offset-4 transition-colors hover:text-brand-bright hover:underline focus-ring"
        >
          Editorial disclaimer
        </Link>
      </p>
    </div>
  );
}
