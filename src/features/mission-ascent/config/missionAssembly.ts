import type { LogoComponentType } from "@/features/mission-ascent/types/mission.types";

export const LOGO_COMPONENT_ORDER: readonly LogoComponentType[] = [
  "d",
  "y",
  "o",
  "r",
] as const;

export const LOGO_COMPONENT_COUNT = LOGO_COMPONENT_ORDER.length;

export const LOGO_COMPONENT_LABELS: Record<LogoComponentType, string> = {
  d: "LETTER D",
  y: "LETTER Y",
  o: "LETTER O",
  r: "LETTER R",
};

export const LOGO_COMPONENT_SHORT: Record<LogoComponentType, string> = {
  d: "D",
  y: "Y",
  o: "O",
  r: "R",
};

/** In-game player ship */
export const GAME_ROCKET_SPRITE = "/brand/rocket-game.png";
export const LOGO_FLAME_SPRITE = "/brand/logo-flame.png";

export const LOGO_COMPONENT_ASSETS: Record<LogoComponentType, string> = {
  d: "/brand/Game-D.png",
  y: "/brand/Game-Y.png",
  o: "/brand/Game-O.png",
  r: "/brand/Game-R.png",
};

export type LetterAnchor = "left" | "right" | "center";

export type LetterSlotConfig = {
  width: number;
  anchor: LetterAnchor;
  fullFrame?: boolean;
};

export const LOGO_LETTER_SLOT_HEIGHT_PX = 56;
export const LOGO_LETTER_SLOTS: Record<LogoComponentType, LetterSlotConfig> = {
  d: { width: 60, anchor: "center", fullFrame: true },
  y: { width: 60, anchor: "center", fullFrame: true },
  o: { width: 72, anchor: "center", fullFrame: true },
  r: { width: 58, anchor: "right", fullFrame: false },
};

export const LOGO_FLAME_CROP: LetterSlotConfig = { width: 110, anchor: "left" };

export const LOGO_LETTER_FILLED_GLOW =
  "drop-shadow(0 0 10px rgba(49, 209, 198, 0.55))";

export const LOGO_LETTER_GHOST_FILTER = "brightness(0) invert(1)";
export const LOGO_LETTER_GHOST_OPACITY = 0.32;

export function getLetterSourceCrop(
  naturalWidth: number,
  naturalHeight: number,
  slot: LetterSlotConfig,
): { sx: number; sy: number; sw: number; sh: number } {
  if (slot.fullFrame) {
    return { sx: 0, sy: 0, sw: naturalWidth, sh: naturalHeight };
  }
  const sh = naturalHeight;
  const sw = (slot.width / LOGO_LETTER_SLOT_HEIGHT_PX) * naturalHeight;
  let sx = 0;
  if (slot.anchor === "right") sx = Math.max(0, naturalWidth - sw);
  else if (slot.anchor === "center") sx = Math.max(0, (naturalWidth - sw) / 2);
  return { sx, sy: 0, sw: Math.min(sw, naturalWidth), sh };
}

export function getNextLogoComponent(
  collected: readonly LogoComponentType[],
  missed: readonly LogoComponentType[] = [],
): LogoComponentType | null {
  for (const component of LOGO_COMPONENT_ORDER) {
    if (!collected.includes(component) && !missed.includes(component)) return component;
  }
  return null;
}

export function isAssemblyComplete(collected: readonly LogoComponentType[]): boolean {
  return LOGO_COMPONENT_ORDER.every((c) => collected.includes(c));
}

/** All four letters have been collected or missed — sector can advance. */
export function isAssemblyCycleComplete(
  collected: readonly LogoComponentType[],
  missed: readonly LogoComponentType[] = [],
): boolean {
  return LOGO_COMPONENT_ORDER.every(
    (component) => collected.includes(component) || missed.includes(component),
  );
}

export function getAssemblyResolvedCount(
  collected: readonly LogoComponentType[],
  missed: readonly LogoComponentType[],
): number {
  return collected.length + missed.length;
}

export function getLogoComponentIndex(component: LogoComponentType): number {
  return LOGO_COMPONENT_ORDER.indexOf(component);
}
