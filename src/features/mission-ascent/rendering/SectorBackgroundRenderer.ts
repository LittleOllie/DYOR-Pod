import type { BackgroundConfig } from "@/features/mission-ascent/progression/sectorTypes";
import { lerpColor } from "@/features/mission-ascent/utils/math";

export type SectorBackgroundState = {
  current: BackgroundConfig;
  previous: BackgroundConfig | null;
  blend: number;
  altitudeKm: number;
  signalBoostActive: boolean;
  quality: "high" | "standard" | "reduced";
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function blendBackgroundConfig(
  from: BackgroundConfig,
  to: BackgroundConfig,
  blend: number,
): BackgroundConfig {
  const t = clamp01(blend);
  const gridFrom = from.grid;
  const gridTo = to.grid;
  const grid =
    gridFrom && gridTo
      ? {
          enabled: t < 0.5 ? gridFrom.enabled : gridTo.enabled,
          color: lerpColor(gridFrom.color, gridTo.color, t),
          opacity: gridFrom.opacity + (gridTo.opacity - gridFrom.opacity) * t,
          spacing: Math.round(gridFrom.spacing + (gridTo.spacing - gridFrom.spacing) * t),
          style: t < 0.5 ? gridFrom.style : gridTo.style,
        }
      : gridTo ?? gridFrom;

  return {
    baseColors: [
      lerpColor(from.baseColors[0], to.baseColors[0], t),
      lerpColor(from.baseColors[1], to.baseColors[1], t),
      lerpColor(from.baseColors[2], to.baseColors[2], t),
    ],
    grid,
    stars: {
      density: from.stars.density + (to.stars.density - from.stars.density) * t,
      color: lerpColor(from.stars.color, to.stars.color, t),
      streakMultiplier:
        from.stars.streakMultiplier +
        (to.stars.streakMultiplier - from.stars.streakMultiplier) * t,
    },
    particles: {
      count: Math.round(from.particles.count + (to.particles.count - from.particles.count) * t),
      color: lerpColor(from.particles.color, to.particles.color, t),
      speedMultiplier:
        from.particles.speedMultiplier +
        (to.particles.speedMultiplier - from.particles.speedMultiplier) * t,
    },
    nebula:
      from.nebula && to.nebula
        ? {
            enabled: t < 0.5 ? from.nebula.enabled : to.nebula.enabled,
            colors: [
              lerpColor(from.nebula.colors[0] ?? "transparent", to.nebula.colors[0] ?? "transparent", t),
              lerpColor(from.nebula.colors[1] ?? "transparent", to.nebula.colors[1] ?? "transparent", t),
            ],
            opacity: from.nebula.opacity + (to.nebula.opacity - from.nebula.opacity) * t,
          }
        : to.nebula ?? from.nebula,
    vignette: from.vignette + (to.vignette - from.vignette) * t,
    ambientGlow: lerpColor(from.ambientGlow, to.ambientGlow, t),
    hudAccent: lerpColor(from.hudAccent, to.hudAccent, t),
    horizonGlow: to.horizonGlow ?? from.horizonGlow,
    scanlines: t >= 0.5 ? to.scanlines : from.scanlines,
    speedLineIntensity:
      (from.speedLineIntensity ?? 0) + ((to.speedLineIntensity ?? 0) - (from.speedLineIntensity ?? 0)) * t,
  };
}

function drawAmbientGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
): void {
  const glow = ctx.createRadialGradient(width * 0.5, height * 0.45, 0, width * 0.5, height * 0.45, width * 0.55);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function drawHorizonGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizon: NonNullable<BackgroundConfig["horizonGlow"]>,
): void {
  const grad = ctx.createLinearGradient(0, height * 0.55, 0, height);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.5, horizon.color);
  grad.addColorStop(1, horizon.color);
  ctx.globalAlpha = horizon.opacity;
  ctx.fillStyle = grad;
  ctx.fillRect(0, height * 0.48, width, height * 0.52);
  ctx.globalAlpha = 1;
}

function drawBackgroundParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: BackgroundConfig,
  altitudeKm: number,
  quality: string,
): void {
  const count =
    quality === "reduced"
      ? Math.floor(config.particles.count * 0.4)
      : quality === "high"
        ? config.particles.count
        : Math.floor(config.particles.count * 0.75);
  if (count <= 0) return;

  const scroll = altitudeKm * 60 * config.particles.speedMultiplier;
  for (let i = 0; i < count; i += 1) {
    const seed = i * 7919;
    const x = (seed * 17) % width;
    const baseY = (seed * 31) % height;
    const y = (baseY + scroll + seed) % height;
    const size = 1 + (seed % 3) * 0.5;
    ctx.globalAlpha = 0.15 + (seed % 5) * 0.04;
    ctx.fillStyle = config.particles.color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpeedLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
  color: string,
  altitudeKm: number,
): void {
  const lineCount = Math.floor(8 + intensity * 14);
  const scroll = (altitudeKm * 120) % height;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < lineCount; i += 1) {
    const x = ((i * 137) % width) + width * 0.05;
    const len = height * (0.08 + (i % 4) * 0.04) * intensity;
    const y = ((i * 89 + scroll) % (height + len)) - len;
    ctx.globalAlpha = 0.04 + (i % 3) * 0.02;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (i % 2 === 0 ? 8 : -8), y + len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawScanlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
}

export function renderSectorBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: SectorBackgroundState,
): void {
  const { current, previous, blend } = state;
  const from = previous && blend < 1 ? previous : current;
  const to = current;
  const t = clamp01(blend);
  const config = previous && blend < 1 ? blendBackgroundConfig(from, to, t) : current;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, config.baseColors[0]);
  grad.addColorStop(0.55, config.baseColors[1]);
  grad.addColorStop(1, config.baseColors[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (config.ambientGlow && state.quality !== "reduced") {
    drawAmbientGlow(ctx, width, height, config.ambientGlow);
  }

  if (config.horizonGlow && state.quality !== "reduced") {
    drawHorizonGlow(ctx, width, height, config.horizonGlow);
  }

  if (config.nebula?.enabled && state.quality !== "reduced") {
    ctx.globalAlpha = config.nebula.opacity;
    const ng = ctx.createRadialGradient(width * 0.5, height * 0.35, 0, width * 0.5, height * 0.35, width * 0.65);
    ng.addColorStop(0, config.nebula.colors[0] ?? "transparent");
    ng.addColorStop(1, config.nebula.colors[1] ?? "transparent");
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }

  if (config.speedLineIntensity && config.speedLineIntensity > 0.05 && state.quality !== "reduced") {
    drawSpeedLines(ctx, width, height, config.speedLineIntensity, config.particles.color, state.altitudeKm);
  }

  const starCount =
    state.quality === "reduced"
      ? Math.floor(18 * config.stars.density)
      : Math.floor(36 * config.stars.density);
  ctx.fillStyle = config.stars.color;
  for (let i = 0; i < starCount; i += 1) {
    const sx = (i * 97) % width;
    const sy = (i * 53) % height;
    const streak = (state.altitudeKm * 8 * config.stars.streakMultiplier + i * 11) % 16;
    ctx.fillRect((sx + streak) % width, sy, 1.2, 1.2);
  }

  if (state.quality !== "reduced") {
    drawBackgroundParticles(ctx, width, height, config, state.altitudeKm, state.quality);
  }

  if (config.scanlines && state.quality !== "reduced") {
    drawScanlines(ctx, width, height);
  }

  if (config.vignette > 0 && state.quality !== "reduced") {
    const vg = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.2,
      width / 2,
      height / 2,
      height * 0.75,
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(0,0,0,${config.vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawSquareGrid(
  ctx: CanvasRenderingContext2D,
  activeWidth: number,
  height: number,
  gridSize: number,
  offset: number,
): void {
  for (let x = 0; x < activeWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = -gridSize + offset; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(activeWidth, y);
    ctx.stroke();
  }
}

function drawHexGrid(
  ctx: CanvasRenderingContext2D,
  activeWidth: number,
  height: number,
  spacing: number,
  offset: number,
): void {
  const rowH = spacing * 0.866;
  const startY = -rowH + (offset % rowH);
  for (let row = 0, y = startY; y < height + rowH; row += 1, y += rowH) {
    const xShift = row % 2 === 0 ? 0 : spacing * 0.5;
    for (let x = -spacing + xShift; x < activeWidth + spacing; x += spacing) {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + spacing * 0.45 * Math.cos(angle);
        const py = y + spacing * 0.45 * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawRadialGrid(
  ctx: CanvasRenderingContext2D,
  activeWidth: number,
  height: number,
  spacing: number,
  offset: number,
): void {
  const cx = activeWidth * 0.5;
  const cy = height + spacing * 0.5;
  for (let r = spacing; r < height * 1.4; r += spacing) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + (offset % spacing), Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  for (let i = -8; i <= 8; i += 1) {
    const angle = Math.PI * 1.5 + i * 0.12;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * height * 1.2, cy + Math.sin(angle) * height * 1.2);
    ctx.stroke();
  }
}

export function renderSectorGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  activeWidth: number,
  altitudeKm: number,
  config: BackgroundConfig,
  signalBoostActive: boolean,
  quality: string,
): void {
  if (quality === "reduced" || !config.grid?.enabled) return;

  ctx.strokeStyle = config.grid.color;
  ctx.globalAlpha = signalBoostActive ? config.grid.opacity * 1.4 : config.grid.opacity;
  ctx.lineWidth = 1;

  const gridSize = config.grid.spacing;
  const speedFactor = signalBoostActive ? 1.6 : 1;
  const offset = (altitudeKm * 100 * speedFactor) % gridSize;

  if (config.grid.style === "hex") {
    drawHexGrid(ctx, activeWidth, height, gridSize, offset);
  } else if (config.grid.style === "radial") {
    drawRadialGrid(ctx, activeWidth, height, gridSize, offset);
  } else {
    drawSquareGrid(ctx, activeWidth, height, gridSize, offset);
  }

  ctx.globalAlpha = 1;
}
