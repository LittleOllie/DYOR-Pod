import { MissionLauncher } from "@/features/mission-ascent/components/MissionLauncher";

export function GameSection() {
  return (
    <>
      <div className="md:hidden">
        <MissionLauncher compact />
      </div>
      <div className="hidden md:block">
        <MissionLauncher />
      </div>
    </>
  );
}
