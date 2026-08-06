import type { LetterStyle } from "@/features/mission-ascent/progression/sectorTypes";

let activeLetterStyle: LetterStyle | null = null;

export function setActiveLetterStyle(style: LetterStyle | null): void {
  activeLetterStyle = style;
}

export function getActiveLetterStyle(): LetterStyle | null {
  return activeLetterStyle;
}
