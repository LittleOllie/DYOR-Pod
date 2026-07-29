import { ScheduleTimeline } from "@/components/schedule/ScheduleTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function WeeklySchedule() {
  return (
    <RevealOnScroll>
      <SectionHeading
        eyebrow="Weekly Flight Plan"
        title="This Week at DYOR"
        description="Live Spaces, market analysis, interviews and the weekly podcast."
        className="mb-6 md:mb-10"
      />
      <ScheduleTimeline />
    </RevealOnScroll>
  );
}
