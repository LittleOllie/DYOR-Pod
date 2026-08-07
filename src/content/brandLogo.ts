/** Layered DYOR logo assets — all canvases 2048×753px, black background (use .logo-layer-blend). */
export const LOGO_CANVAS = {
  width: 2048,
  height: 753,
} as const;

/** Persisted after the visitor completes the logo intro once. */
export const LOGO_INTRO_STORAGE_KEY = "dyor-logo-intro-seen";

export type LogoLayerId = "flame" | "d" | "y" | "o" | "r" | "rocket";

export type LogoIntroPhase = "idle" | "flame" | "rocket" | "letters" | "complete";

/** Intro sequence timing — keep in sync with globals.css animation durations. */
export const LOGO_INTRO_TIMING = {
  flameStartMs: 250,
  flameInMs: 750,
  rocketStartMs: 1000,
  rocketInMs: 1100,
  lettersStartMs: 2200,
  letterStaggerMs: 140,
  letterInMs: 600,
  actionsStartMs: 3800,
} as const;

export const logoLayers: {
  id: LogoLayerId;
  src: string;
  label: string;
  letterDelayMs?: number;
}[] = [
  { id: "flame", src: "/brand/logo-flame.png", label: "Rocket flame trail" },
  { id: "d", src: "/brand/logo-d.png", label: "Letter D", letterDelayMs: 0 },
  {
    id: "y",
    src: "/brand/logo-y.png",
    label: "Letter Y",
    letterDelayMs: LOGO_INTRO_TIMING.letterStaggerMs,
  },
  {
    id: "o",
    src: "/brand/logo-o.png",
    label: "Letter O",
    letterDelayMs: LOGO_INTRO_TIMING.letterStaggerMs * 2,
  },
  {
    id: "r",
    src: "/brand/logo-r.png",
    label: "Letter R",
    letterDelayMs: LOGO_INTRO_TIMING.letterStaggerMs * 3,
  },
  { id: "rocket", src: "/brand/logo-rocket.png", label: "Rocket" },
];

export const logoFinalSrc = "/brand/logo-final.png";
export const headerLogoSrc = "/brand/header-logo.webp";

export function getLogoIntroCompleteMs(): number {
  const { lettersStartMs, letterStaggerMs, letterInMs } = LOGO_INTRO_TIMING;
  const lastLetterDelay = letterStaggerMs * 3;
  return lettersStartMs + lastLetterDelay + letterInMs + 350;
}

/** Standalone DYOR letter marks for countdown cells and schedule cards (813×753, black bg). */
export const COUNTDOWN_LETTER_CANVAS = {
  width: 813,
  height: 753,
} as const;

export type CountdownLetterId = "d" | "y" | "o" | "r";

export const countdownLetters: {
  id: CountdownLetterId;
  src: string;
  label: string;
}[] = [
  { id: "d", src: "/brand/countdown-d.png", label: "Letter D" },
  { id: "y", src: "/brand/countdown-y.png", label: "Letter Y" },
  { id: "o", src: "/brand/countdown-o.png", label: "Letter O with rocket" },
  { id: "r", src: "/brand/countdown-r.png", label: "Letter R" },
];

/** O with orbiting rocket — used for subtle host portrait watermarks. */
export const countdownOSrc = "/brand/countdown-o.png";
