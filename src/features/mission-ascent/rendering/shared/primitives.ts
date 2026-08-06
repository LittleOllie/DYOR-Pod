import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import type { MissionVisualQuality } from "@/features/mission-ascent/config/visualConfig";

const { colours, glow: glowCfg } = missionVisuals;

export function drawEntityShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
): void {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.62, r * 0.75, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  intensity: number,
  quality: MissionVisualQuality,
): void {
  if (quality === "reduced") return;
  const blur = Math.min(glowCfg.shadowBlurMax, intensity);
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawHexPath(ctx: CanvasRenderingContext2D, r: number, rotation = 0): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 6 + rotation;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawMetalPanel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cornerCut = 4,
): void {
  const hw = w / 2;
  const hh = h / 2;
  ctx.beginPath();
  ctx.moveTo(-hw + cornerCut, -hh);
  ctx.lineTo(hw - cornerCut, -hh);
  ctx.lineTo(hw, -hh + cornerCut);
  ctx.lineTo(hw, hh - cornerCut);
  ctx.lineTo(hw - cornerCut, hh);
  ctx.lineTo(-hw + cornerCut, hh);
  ctx.lineTo(-hw, hh - cornerCut);
  ctx.lineTo(-hw, -hh + cornerCut);
  ctx.closePath();
  const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  grad.addColorStop(0, colours.metalLight);
  grad.addColorStop(0.45, colours.metal);
  grad.addColorStop(1, colours.navyDeep);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(49, 209, 198, 0.35)";
  ctx.lineWidth = missionVisuals.lineWidths.thin;
  ctx.stroke();
}

export function drawEnergyCore(
  ctx: CanvasRenderingContext2D,
  r: number,
  coreColor: string,
  pulse: number,
): void {
  const coreR = r * (0.28 + pulse * 0.06);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
  grad.addColorStop(0, colours.white);
  grad.addColorStop(0.35, coreColor);
  grad.addColorStop(1, "rgba(19, 169, 166, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, coreR, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCircuitLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = colours.tealDeep,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = missionVisuals.lineWidths.thin;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawAngularFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  inset = 3,
): void {
  ctx.strokeStyle = colours.teal;
  ctx.lineWidth = missionVisuals.lineWidths.frame;
  ctx.strokeRect(-w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2);
  const bracket = Math.min(w, h) * 0.12;
  ctx.lineWidth = missionVisuals.lineWidths.medium;
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo((w / 2) * sx, (h / 2 - bracket) * sy);
    ctx.lineTo((w / 2) * sx, (h / 2) * sy);
    ctx.lineTo((w / 2 - bracket) * sx, (h / 2) * sy);
    ctx.stroke();
  }
}
