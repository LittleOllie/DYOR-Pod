import { aboutSection } from "@/content/about";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { HeadingWithAccent } from "@/components/ui/ColorfulAccent";

export function DesktopMissionPanel() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -left-6 top-0 hidden h-32 w-32 rounded-full bg-brand/5 blur-3xl lg:block xl:-left-12"
        aria-hidden="true"
      />

      <header className="max-w-4xl">
        <h2
          id="about-heading"
          className="mt-3 font-heading text-4xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-[3.5rem] lg:leading-[1.05] xl:text-6xl"
        >
          <HeadingWithAccent
            title={aboutSection.heading}
            accent={aboutSection.headingAccent}
          />
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary lg:mt-5 lg:text-lg">
          {aboutSection.mission}
        </p>
      </header>

      <CoreValuesGrid className="mt-12 lg:mt-14" ariaLabel={aboutSection.heading} />

      <p className="mt-12 max-w-3xl font-heading text-xl font-medium leading-snug text-text-primary lg:mt-14 lg:text-2xl">
        {aboutSection.brandStatement.join(" ")}
      </p>
    </div>
  );
}
