"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GameMode } from "@/features/mission-ascent/types/mission.types";

type MissionAscentContextValue = {
  isOpen: boolean;
  mode: GameMode;
  scrollY: number;
  launchButtonRef: React.RefObject<HTMLButtonElement | null>;
  openMission: (mode: GameMode, source?: "homepage" | "route") => void;
  closeMission: () => void;
  setMode: (mode: GameMode) => void;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  source: "homepage" | "route" | null;
};

const MissionAscentContext = createContext<MissionAscentContextValue | null>(null);

export function MissionAscentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeState] = useState<GameMode>("timed");
  const [scrollY, setScrollY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [source, setSource] = useState<"homepage" | "route" | null>(null);
  const launchButtonRef = useRef<HTMLButtonElement>(null);

  const openMission = useCallback((nextMode: GameMode, nextSource: "homepage" | "route" = "homepage") => {
    setScrollY(window.scrollY);
    setModeState(nextMode);
    setSource(nextSource);
    setIsOpen(true);
  }, []);

  const closeMission = useCallback(() => {
    setIsOpen(false);
    setIsTransitioning(false);
    setSource(null);
    document.body.style.overflow = "";
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      launchButtonRef.current?.focus();
    });
  }, [scrollY]);

  const setMode = useCallback((nextMode: GameMode) => {
    setModeState(nextMode);
  }, []);

  return (
    <MissionAscentContext.Provider
      value={{
        isOpen,
        mode,
        scrollY,
        launchButtonRef,
        openMission,
        closeMission,
        setMode,
        isTransitioning,
        setIsTransitioning,
        source,
      }}
    >
      {children}
    </MissionAscentContext.Provider>
  );
}

export function useMissionAscent() {
  const ctx = useContext(MissionAscentContext);
  if (!ctx) throw new Error("useMissionAscent must be used within MissionAscentProvider");
  return ctx;
}
