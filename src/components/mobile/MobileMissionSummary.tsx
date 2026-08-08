import { aboutSection } from "@/content/about";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";

export function MobileMissionSummary() {
  return (
    <div className="md:hidden">
      <MobileSectionHeader
        id="about-heading"
        title={aboutSection.heading}
        accent={aboutSection.headingAccent}
      />

      <p className="text-sm leading-relaxed text-text-secondary">{aboutSection.mission}</p>

      <CoreValuesGrid className="mt-8" ariaLabel={aboutSection.heading} />

      <p className="mt-8 font-heading text-base font-medium leading-snug text-text-primary">
        {aboutSection.brandStatement.join(" ")}
      </p>
    </div>
  );
}
