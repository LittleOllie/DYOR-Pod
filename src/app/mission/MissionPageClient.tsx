"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { reloadMissionStorageFromDisk, useMissionStorage } from "@/features/mission-ascent/hooks/useMissionStorage";
import { useEffect } from "react";

const MissionGame = dynamic(
  () =>
    import("@/features/mission-ascent/components/MissionGame").then((m) => m.MissionGame),
  { ssr: false },
);

export default function MissionPageClient() {
  const router = useRouter();
  const { preferences } = useMissionStorage();

  useEffect(() => {
    reloadMissionStorageFromDisk();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleExit = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/#about");
    }
  };

  return (
    <div className="fixed inset-0 z-[240] bg-bg-deep" style={{ height: "100dvh" }}>
      <MissionGame mode={preferences.lastMode} onExit={handleExit} standalone />
    </div>
  );
}
