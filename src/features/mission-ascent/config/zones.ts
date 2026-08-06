import type { AltitudeZoneId } from "@/features/mission-ascent/types/mission.types";

export type AltitudeZone = {
  id: AltitudeZoneId;
  label: string;
  minKm: number;
  maxKm: number;
  bgTop: string;
  bgBottom: string;
  starDensity: number;
  hazardWeight: number;
  researchWeight: number;
};

export const altitudeZones: AltitudeZone[] = [
  {
    id: "launch-corridor",
    label: "Launch Corridor",
    minKm: 0,
    maxKm: 10,
    bgTop: "#0a2630",
    bgBottom: "#061821",
    starDensity: 0.2,
    hazardWeight: 0.4,
    researchWeight: 1.2,
  },
  {
    id: "upper-atmosphere",
    label: "Upper Atmosphere",
    minKm: 10,
    maxKm: 50,
    bgTop: "#081e28",
    bgBottom: "#040f14",
    starDensity: 0.35,
    hazardWeight: 0.7,
    researchWeight: 1,
  },
  {
    id: "low-orbit",
    label: "Low Orbit",
    minKm: 50,
    maxKm: 200,
    bgTop: "#061018",
    bgBottom: "#030a0e",
    starDensity: 0.55,
    hazardWeight: 1,
    researchWeight: 1,
  },
  {
    id: "lunar-transfer",
    label: "Lunar Transfer",
    minKm: 200,
    maxKm: 500,
    bgTop: "#050c12",
    bgBottom: "#020608",
    starDensity: 0.7,
    hazardWeight: 1.2,
    researchWeight: 0.9,
  },
  {
    id: "deep-space",
    label: "Deep Space",
    minKm: 500,
    maxKm: 1000,
    bgTop: "#040810",
    bgBottom: "#010304",
    starDensity: 0.85,
    hazardWeight: 1.4,
    researchWeight: 1.1,
  },
  {
    id: "unknown-sector",
    label: "Unknown Sector",
    minKm: 1000,
    maxKm: Infinity,
    bgTop: "#031018",
    bgBottom: "#010204",
    starDensity: 1,
    hazardWeight: 1.6,
    researchWeight: 1.3,
  },
];

export function getZoneForAltitude(km: number): AltitudeZone {
  for (let i = altitudeZones.length - 1; i >= 0; i -= 1) {
    if (km >= altitudeZones[i].minKm) return altitudeZones[i];
  }
  return altitudeZones[0];
}

export function blendZones(
  km: number,
): { current: AltitudeZone; next: AltitudeZone | null; blend: number } {
  const current = getZoneForAltitude(km);
  const idx = altitudeZones.findIndex((z) => z.id === current.id);
  const next = idx < altitudeZones.length - 1 ? altitudeZones[idx + 1] : null;
  if (!next || !Number.isFinite(current.maxKm)) {
    return { current, next: null, blend: 0 };
  }
  const span = current.maxKm - current.minKm;
  const blend = span > 0 ? (km - (current.maxKm - span * 0.15)) / (span * 0.15) : 0;
  return { current, next, blend: Math.max(0, Math.min(1, blend)) };
}
