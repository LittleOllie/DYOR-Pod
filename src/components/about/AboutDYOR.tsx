import { DesktopMissionPanel } from "@/components/desktop/DesktopMissionPanel";
import { MobileMissionSummary } from "@/components/mobile/MobileMissionSummary";
import { MissionLauncher } from "@/features/mission-ascent/components/MissionLauncher";

export function AboutDYOR() {
  return (
    <>
      <MobileMissionSummary />

      <div className="mt-8 md:hidden">
        <MissionLauncher compact />
      </div>

      <div className="hidden md:block">
        <DesktopMissionPanel />
        <div className="mt-12 lg:mt-16">
          <MissionLauncher />
        </div>
      </div>
    </>
  );
}
