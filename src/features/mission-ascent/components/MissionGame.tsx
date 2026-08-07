"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { OnboardingHints } from "@/features/mission-ascent/components/OnboardingHints";
import { LaunchSequenceOverlay } from "@/features/mission-ascent/components/LaunchSequenceOverlay";
import { MissionDebriefPanel } from "@/features/mission-ascent/components/MissionDebriefPanel";
import { MissionHUD } from "@/features/mission-ascent/components/MissionHUD";
import { MissionIntelPanel } from "@/features/mission-ascent/components/MissionIntelPanel";
import { PauseMenu } from "@/features/mission-ascent/components/PauseMenu";
import { ThrottleControl } from "@/features/mission-ascent/components/ThrottleControl";
import { AudioManager } from "@/features/mission-ascent/engine/AudioManager";
import { HapticsManager } from "@/features/mission-ascent/engine/HapticsManager";
import { renderMissionFrame } from "@/features/mission-ascent/engine/CanvasRenderer";
import { MissionEngine } from "@/features/mission-ascent/engine/MissionEngine";
import { useMissionStorage } from "@/features/mission-ascent/hooks/useMissionStorage";
import type {
  GameMode,
  GamePhase,
  HudSnapshot,
  MissionDebrief,
  PickupFeedbackType,
} from "@/features/mission-ascent/types/mission.types";
import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import {
  applyCanvasSize,
  applyCanvasTransform,
  isCanvasContainerReady,
} from "@/features/mission-ascent/utils/canvasSizing";
import { defaultHudSnapshot } from "@/features/mission-ascent/utils/defaultHud";
import { getThrottleZone } from "@/features/mission-ascent/utils/math";

const ONBOARDING_HINTS = missionConfig.onboarding.hints;

type MissionGameProps = {
  mode: GameMode;
  onExit: () => void;
  standalone?: boolean;
};

export function MissionGame({ mode, onExit, standalone = false }: MissionGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MissionEngine | null>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const hapticsRef = useRef<HapticsManager | null>(null);
  const rafRenderRef = useRef<number | null>(null);
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const lastPointerClientXRef = useRef<number | null>(null);
  const lastThrottleZoneRef = useRef<string>("cruise");

  const {
    preferences,
    setMode,
    setAudioEnabled,
    setReducedEffects,
    markLaunchSequenceSeen,
    markOnboardingComplete,
    markEntityDiscovered,
    resetDiscoveredEntities,
    saveDebrief,
    getBest,
  } = useMissionStorage();

  const [hud, setHud] = useState<HudSnapshot>(defaultHudSnapshot);
  const [phase, setPhase] = useState<GamePhase>("launch-sequence");
  const [launchStep, setLaunchStep] = useState(0);
  const [debrief, setDebrief] = useState<MissionDebrief | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const [gameReady, setGameReady] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const [onboardingHint, setOnboardingHint] = useState<string | null>(
    preferences.onboardingComplete ? null : ONBOARDING_HINTS[0],
  );
  const onboardingDone = useRef(preferences.onboardingComplete);
  const onboardingStepRef = useRef(preferences.onboardingComplete ? -1 : 0);
  const preferencesRef = useRef(preferences);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const completeOnboarding = useCallback(() => {
    if (onboardingDone.current) return;
    onboardingDone.current = true;
    onboardingStepRef.current = -1;
    setOnboardingHint(null);
    markOnboardingComplete();
  }, [markOnboardingComplete]);

  const markOnboardingAction = useCallback(
    (step: (typeof ONBOARDING_HINTS)[number]) => {
      if (onboardingDone.current) return;
      if (ONBOARDING_HINTS[onboardingStepRef.current] !== step) return;
      const next = onboardingStepRef.current + 1;
      if (next >= ONBOARDING_HINTS.length) {
        completeOnboarding();
        return;
      }
      onboardingStepRef.current = next;
      setOnboardingHint(ONBOARDING_HINTS[next]);
    },
    [completeOnboarding],
  );

  const storageActionsRef = useRef({
    saveDebrief,
    markLaunchSequenceSeen,
    markEntityDiscovered,
    markOnboardingAction,
    getBest,
  });

  useEffect(() => {
    storageActionsRef.current = {
      saveDebrief,
      markLaunchSequenceSeen,
      markEntityDiscovered,
      markOnboardingAction,
      getBest,
    };
  }, [
    saveDebrief,
    markLaunchSequenceSeen,
    markEntityDiscovered,
    markOnboardingAction,
    getBest,
  ]);

  const syncCanvasToContainer = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!canvas || !container) return false;

    const rect = container.getBoundingClientRect();
    if (!isCanvasContainerReady(rect.width, rect.height)) return false;

    const { cssWidth, cssHeight } = applyCanvasSize(canvas, rect.width, rect.height);
    engine?.resize(cssWidth, cssHeight);
    return true;
  }, []);

  const initEngine = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const prefs = preferencesRef.current;
    const actions = storageActionsRef.current;

    const rect = container.getBoundingClientRect();
    if (!isCanvasContainerReady(rect.width, rect.height)) return;

    const { cssWidth, cssHeight } = applyCanvasSize(canvas, rect.width, rect.height);

    audioRef.current = new AudioManager({ enabled: prefs.audioEnabled });
    hapticsRef.current = new HapticsManager({
      enabled: true,
      reducedEffects: prefs.reducedEffects,
    });

    const engine = new MissionEngine(
      {
        onHudUpdate: (next) => {
          setHud(next);
          const zone = getThrottleZone(next.throttle);
          if (zone !== lastThrottleZoneRef.current) {
            if (zone === "boost") hapticsRef.current?.pulse("boost-zone");
            lastThrottleZoneRef.current = zone;
          }
          if (prefs.audioEnabled && next.phase === "playing") {
            audioRef.current?.updateEngine(next.throttle, false);
          }
          if (next.fuel <= 5 && next.fuel > 4.5)
            hapticsRef.current?.pulse("fuel-critical");
          if (next.altitudeKm >= 8) actions.markOnboardingAction("survive");
        },
        onPhaseChange: setPhase,
        onLiveAnnouncement: setLiveMessage,
        onDebrief: (d) => {
          const isBest = actions.saveDebrief(mode, {
            finalScore: d.breakdown.finalScore,
            altitudeKm: d.altitudeKm,
            bestChain: d.bestChain,
            logosCompleted: d.logosCompleted,
            logoComponentsCollected: d.logoComponentsCollected,
            signalBoostPeakScore: d.signalBoostPeakScore,
            logoCompletionTimeMs: d.logoCompletionTimeMs,
            sectorsCompleted: d.sectorsCompleted,
            highestSectorReached: d.highestSectorReached,
            highestCycleReached: d.highestCycleReached,
            fastestSectorCompletionMs: d.fastestSectorCompletionMs,
          });
          engineRef.current?.setPreviousBest(actions.getBest(mode));
          setDebrief({ ...d, isPersonalBest: isBest });
          actions.markLaunchSequenceSeen();
          audioRef.current?.play(isBest ? "new-record" : "mission-complete");
          if (isBest) hapticsRef.current?.pulse("new-record");
        },
        onScreenShake: (intensity) => {
          if (prefs.reducedEffects) return;
          shakeRef.current.intensity = intensity;
          if (intensity >= 0.5) {
            audioRef.current?.play("collision");
            hapticsRef.current?.pulse("collision");
          } else if (intensity >= 0.3) {
            audioRef.current?.play("shield-hit");
            hapticsRef.current?.pulse("shield");
          }
        },
        onPickup: (type: PickupFeedbackType) => {
          const isLogo = type === "d" || type === "y" || type === "o" || type === "r";
          if (isLogo) audioRef.current?.play("chain-milestone");
          else if (type === "fuel") audioRef.current?.play("pickup-fuel");
          else if (type === "cooling") audioRef.current?.play("pickup-cooling");
          else if (type === "shield") audioRef.current?.play("pickup-shield");
          else audioRef.current?.play("pickup-research");
          if (!onboardingDone.current) {
            if (isLogo) actions.markOnboardingAction("component");
            else if (type === "fuel" || type === "cooling")
              actions.markOnboardingAction("survive");
          }
        },
        onLogoComponent: () => {
          if (!onboardingDone.current) actions.markOnboardingAction("component");
        },
        onSignalBoost: () => {
          audioRef.current?.play("event-alert");
          hapticsRef.current?.pulse("boost-zone");
        },
        onAssemblyComplete: () => {
          audioRef.current?.play("zone-transition");
          hapticsRef.current?.pulse("new-record");
        },
        onChainMilestone: () => audioRef.current?.play("chain-milestone"),
        onZoneEnter: () => audioRef.current?.play("zone-transition"),
        onEventAlert: () => audioRef.current?.play("event-alert"),
        onEntityDiscovered: (type) => {
          actions.markEntityDiscovered(type);
        },
      },
      {
        mode,
        skipLaunchSequence: prefs.launchSequenceSeen,
        reducedEffects: prefs.reducedEffects,
        width: cssWidth,
        height: cssHeight,
        previousBest: actions.getBest(mode),
        discoveredEntities: prefs.discoveredEntities,
      },
    );

    for (const type of prefs.discoveredEntities) {
      engine.markEntityDiscovered(type);
    }

    engineRef.current = engine;
    setGameReady(true);
    engine.start();
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    let initRaf = 0;

    const tryInit = () => {
      if (cancelled) return;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      if (!isCanvasContainerReady(rect.width, rect.height)) {
        initRaf = requestAnimationFrame(tryInit);
        return;
      }

      initEngine();
    };

    initRaf = requestAnimationFrame(tryInit);

    return () => {
      cancelled = true;
      cancelAnimationFrame(initRaf);
      engineRef.current?.stop();
      engineRef.current = null;
      audioRef.current?.dispose();
      audioRef.current = null;
      if (rafRenderRef.current) cancelAnimationFrame(rafRenderRef.current);
      rafRenderRef.current = null;
      setGameReady(false);
    };
  }, [initEngine]);

  useEffect(() => {
    if (!gameReady) return;
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      syncCanvasToContainer();
    });
    observer.observe(container);
    syncCanvasToContainer();

    return () => observer.disconnect();
  }, [gameReady, syncCanvasToContainer]);

  useEffect(() => {
    audioRef.current?.setEnabled(preferences.audioEnabled);
  }, [preferences.audioEnabled]);

  useEffect(() => {
    hapticsRef.current?.setOptions(true, preferences.reducedEffects);
    engineRef.current?.setReducedEffects(preferences.reducedEffects);
  }, [preferences.reducedEffects]);

  useEffect(() => {
    if (!gameReady) return;

    const render = () => {
      try {
        const canvas = canvasRef.current;
        const activeEngine = engineRef.current;
        if (canvas && activeEngine) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            applyCanvasTransform(ctx, canvas);

            if (shakeRef.current.intensity > 0) {
              shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity * 6;
              shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity * 6;
              shakeRef.current.intensity *= 0.88;
            } else {
              shakeRef.current.x = 0;
              shakeRef.current.y = 0;
            }

            renderMissionFrame(
              ctx,
              activeEngine,
              shakeRef.current.x,
              shakeRef.current.y,
              preferencesRef.current.reducedEffects ? "reduced" : "standard",
            );
          }
        }
      } catch (error) {
        console.error("[Mission Ascent] render frame failed", error);
      }

      rafRenderRef.current = requestAnimationFrame(render);
    };

    rafRenderRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRenderRef.current) cancelAnimationFrame(rafRenderRef.current);
      rafRenderRef.current = null;
    };
  }, [gameReady]);

  useEffect(() => {
    if (phase !== "launch-sequence") return;
    const interval = window.setInterval(() => {
      setLaunchStep((s) => Math.min(s + 1, 8));
    }, 850);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const onKeyDown = (e: KeyboardEvent) => {
      audioRef.current?.unlock();
      hapticsRef.current?.unlock();
      if (e.code === "Escape") {
        e.preventDefault();
        if (phase === "playing") {
          engine.pause();
          audioRef.current?.updateEngine(0, true);
        } else if (phase === "paused") engine.resume();
        return;
      }
      if (phase === "paused" && e.code === "KeyR") {
        engine.restart(mode);
        setDebrief(null);
        setLaunchStep(0);
        return;
      }
      if (phase === "playing") {
        engine.input.handleKeyDown(e.code);
        if (e.code === "ArrowLeft" || e.code === "KeyA") markOnboardingAction("steer");
        if (e.code === "ArrowUp" || e.code === "KeyW") markOnboardingAction("throttle");
      }
    };
    const onKeyUp = (e: KeyboardEvent) => engine.input.handleKeyUp(e.code);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [phase, mode, gameReady, markOnboardingAction]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phase === "playing") {
        engineRef.current?.pause();
        audioRef.current?.updateEngine(0, true);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [phase]);

  const handleCanvasPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    audioRef.current?.unlock();
    hapticsRef.current?.unlock();
    const engine = engineRef.current;
    if (!engine || phase !== "playing") return;
    pointerIdRef.current = e.pointerId;
    lastPointerClientXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    engine.input.beginPointer();
    markOnboardingAction("steer");
  };

  const handleCanvasPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine || phase !== "playing" || pointerIdRef.current !== e.pointerId) return;
    if (lastPointerClientXRef.current !== null) {
      engine.input.addPointerDelta(e.clientX - lastPointerClientXRef.current);
    }
    lastPointerClientXRef.current = e.clientX;
  };

  const handleCanvasPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (pointerIdRef.current === e.pointerId) {
      pointerIdRef.current = null;
      lastPointerClientXRef.current = null;
      engineRef.current?.input.endPointer();
    }
  };

  const handleThrottleChange = (value: number) => {
    if (hud.noFuel) return;
    audioRef.current?.unlock();
    hapticsRef.current?.unlock();
    engineRef.current?.input.setThrottlePointer(value);
    markOnboardingAction("throttle");
  };

  const handleSkipLaunch = () => {
    engineRef.current?.skipLaunchSequence();
    setLaunchStep(8);
  };

  const handleRestart = () => {
    setDebrief(null);
    setLaunchStep(0);
    engineRef.current?.restart(mode, getBest(mode));
  };

  const handleSwitchMode = () => {
    const next = mode === "timed" ? "endless" : "timed";
    setMode(next);
    setDebrief(null);
    setLaunchStep(0);
    engineRef.current?.restart(next, getBest(next));
  };

  const handleAbandon = () => {
    engineRef.current?.abandon();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none select-none overflow-hidden bg-bg-deep"
      style={{
        height: standalone ? "100dvh" : "100%",
        touchAction: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full touch-none select-none"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        aria-label="Mission Ascent gameplay field"
        role="img"
      />

      <OnboardingHints activeHint={onboardingHint} />

      {(phase === "playing" || phase === "paused") && (
        <MissionHUD hud={hud} onPause={() => engineRef.current?.pause()} />
      )}

      <div className="pointer-events-none absolute bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-[max(0.5rem,env(safe-area-inset-left))] right-[max(0.5rem,env(safe-area-inset-right))] z-20 flex justify-center sm:left-[max(0.75rem,env(safe-area-inset-left))] sm:right-auto sm:justify-start">
        {(phase === "playing" || phase === "paused") && (
          <ThrottleControl
            value={hud.requestedThrottle}
            onChange={handleThrottleChange}
            overheated={hud.overheated}
            disabled={hud.throttleDisabled}
            noFuel={hud.noFuel}
            className="pointer-events-auto max-w-[min(100%,16rem)] sm:max-w-none"
          />
        )}
      </div>

      <LaunchSequenceOverlay
        visible={phase === "launch-sequence"}
        step={launchStep}
        skippable={preferences.launchSequenceSeen}
        onSkip={handleSkipLaunch}
      />

      <PauseMenu
        open={phase === "paused"}
        audioEnabled={preferences.audioEnabled}
        reducedEffects={preferences.reducedEffects}
        hasProgress={hud.score > 0}
        onResume={() => engineRef.current?.resume()}
        onRestart={handleRestart}
        onToggleAudio={() => setAudioEnabled(!preferences.audioEnabled)}
        onToggleReducedEffects={() => setReducedEffects(!preferences.reducedEffects)}
        onAbandon={handleAbandon}
        onClose={onExit}
        onOpenIntel={() => setIntelOpen(true)}
      />

      <MissionIntelPanel
        open={intelOpen}
        onClose={() => setIntelOpen(false)}
        onResetTips={() => {
          resetDiscoveredEntities();
          engineRef.current?.resetEntityDiscovery([]);
        }}
      />

      {debrief && (
        <MissionDebriefPanel
          debrief={debrief}
          onPlayAgain={handleRestart}
          onSwitchMode={handleSwitchMode}
          onReturn={onExit}
        />
      )}

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>

      <button
        type="button"
        onClick={onExit}
        className="absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex h-10 w-10 items-center justify-center rounded-[var(--radius-medium)] border border-border bg-surface/90 text-text-secondary backdrop-blur-md focus-ring hover:border-brand/40 hover:text-brand-bright"
        aria-label="Close mission and return to website"
      >
        ×
      </button>
    </div>
  );
}
