"use client";

import dynamic from "next/dynamic";
import {
  MissionAscentProvider,
  useMissionAscent,
} from "@/features/mission-ascent/context/MissionAscentContext";

const MissionOverlay = dynamic(
  () =>
    import("@/features/mission-ascent/components/MissionOverlay").then(
      (module) => module.MissionOverlay,
    ),
  { ssr: false },
);

function MissionOverlayGate() {
  const { isOpen } = useMissionAscent();
  if (!isOpen) {
    return null;
  }
  return <MissionOverlay />;
}

export function MissionAscentRoot({ children }: { children: React.ReactNode }) {
  return (
    <MissionAscentProvider>
      {children}
      <MissionOverlayGate />
    </MissionAscentProvider>
  );
}
