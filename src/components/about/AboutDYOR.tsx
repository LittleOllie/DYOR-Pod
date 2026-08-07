import { DesktopMissionPanel } from "@/components/desktop/DesktopMissionPanel";
import { MobileMissionSummary } from "@/components/mobile/MobileMissionSummary";

export function AboutDYOR() {
  return (
    <>
      <MobileMissionSummary />

      <div className="hidden md:block">
        <DesktopMissionPanel />
      </div>
    </>
  );
}
