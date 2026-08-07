import { DesktopScheduleGrid } from "@/components/desktop/DesktopScheduleGrid";
import { MobileScheduleList } from "@/components/mobile/MobileScheduleList";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";
import { InstallAndNotifyPrompt } from "@/components/pwa/InstallAndNotifyPrompt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { scheduleDesktop, scheduleMobile } from "@/content/site";
import { fetchEffectiveShows } from "@/lib/schedule/scheduleStorage";
import type { Show } from "@/types/content";

function sortWeeklyShows(shows: Show[]): Show[] {
  return [...shows].sort((a, b) => {
    const dayOrder = (day: number) => (day === 0 ? 7 : day);
    return dayOrder(a.dayOfWeek) - dayOrder(b.dayOfWeek);
  });
}

export async function WeeklySchedule() {
  const effectiveShows = await fetchEffectiveShows();
  const weeklyShows = sortWeeklyShows(effectiveShows.filter((show) => show.isActive));
  const showCount = weeklyShows.length;
  const scheduleDescription =
    showCount === 3
      ? scheduleMobile.description
      : `${showCount} conversations. One place to stay informed.`;
  const desktopDescription =
    showCount === 4
      ? scheduleDesktop.description
      : `${showCount} conversations across the week — live on X and on demand.`;

  return (
    <RevealOnScroll>
      <MobileSectionHeader
        title={scheduleMobile.title}
        accent="DYOR"
        description={scheduleDescription}
        className="md:hidden"
      />
      <SectionHeading
        title={scheduleDesktop.title}
        accent="DYOR"
        description={desktopDescription}
        className="mb-8 hidden md:mb-12 md:block lg:mb-14"
      />

      <MobileScheduleList shows={weeklyShows} />

      <div className="hidden md:block">
        <DesktopScheduleGrid shows={weeklyShows} />
      </div>

      <InstallAndNotifyPrompt />
    </RevealOnScroll>
  );
}
