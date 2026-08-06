import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import { seededRange, seededUnit } from "@/features/mission-ascent/rendering/shared/seededVisualRandom";
import {
  drawCircuitLine,
  drawGlow,
  drawMetalPanel,
} from "@/features/mission-ascent/rendering/shared/primitives";
import type { EntityDrawContext, EntityDrawEntity } from "@/features/mission-ascent/rendering/types";
import type { HazardDefinition } from "@/features/mission-ascent/config/entityDefinitions";

const { colours, pulseSpeeds } = missionVisuals;

function drawTelegraphBrackets(
  ctx: CanvasRenderingContext2D,
  r: number,
  quality: string,
): void {
  if (quality === "reduced") return;
  ctx.strokeStyle = "rgba(232, 93, 76, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  const pad = r + 6;
  ctx.strokeRect(-pad, -pad, pad * 2, pad * 2);
  ctx.setLineDash([]);
}

export function drawAsteroid(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  const seed = entity.id;
  const r = entity.radius;
  const variant = entity.id % 3;
  const scale = variant === 0 ? 0.92 : variant === 1 ? 1 : 1.08;
  const points = 8 + (seed % 4);

  ctx.save();
  ctx.scale(scale, scale);
  ctx.rotate(entity.rotation + time * missionVisuals.rotationSpeeds.asteroid * 0.001);

  if (entity.telegraphed) drawTelegraphBrackets(ctx, r, quality);

  drawGlow(ctx, 0, 0, r, colours.tealDeep, missionVisuals.glow.hazard * 0.5, quality);

  ctx.beginPath();
  for (let i = 0; i < points; i += 1) {
    const a = (i / points) * Math.PI * 2;
    const jitter = 0.72 + seededUnit(seed, i) * 0.35;
    const px = Math.cos(a) * r * jitter;
    const py = Math.sin(a) * r * jitter;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r);
  grad.addColorStop(0, colours.rockLight);
  grad.addColorStop(0.55, colours.rock);
  grad.addColorStop(1, colours.rockDark);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(49, 209, 198, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const craters = 2 + (seed % 3);
  for (let c = 0; c < craters; c += 1) {
    const ca = seededRange(seed, 0, Math.PI * 2, c + 10);
    const cr = r * seededRange(seed, 0.12, 0.28, c + 20);
    const cx = Math.cos(ca) * r * 0.45;
    const cy = Math.sin(ca) * r * 0.45;
    ctx.fillStyle = colours.rockDark;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawSatelliteDebris(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  const seed = entity.id;
  const r = entity.radius;
  const template = seed % 6;

  ctx.save();
  ctx.rotate(entity.rotation + time * missionVisuals.rotationSpeeds.debris * 0.001);
  if (entity.telegraphed) drawTelegraphBrackets(ctx, r, quality);

  ctx.fillStyle = colours.debris;
  ctx.strokeStyle = "rgba(49, 209, 198, 0.25)";
  ctx.lineWidth = 1;

  switch (template) {
    case 0:
      ctx.fillRect(-r, -r * 0.15, r * 2, r * 0.3);
      ctx.fillRect(-r * 0.9, -r * 0.5, r * 0.25, r * 0.35);
      ctx.fillRect(r * 0.65, -r * 0.5, r * 0.25, r * 0.35);
      break;
    case 1:
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, r * 0.3);
      ctx.lineTo(r * 0.6, -r * 0.2);
      ctx.lineTo(r * 0.3, r * 0.7);
      ctx.closePath();
      ctx.fill();
      break;
    case 2:
      ctx.fillRect(-r * 0.15, -r, r * 0.3, r * 1.6);
      ctx.fillRect(-r * 0.6, -r * 0.4, r * 1.2, r * 0.12);
      break;
    case 3:
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(r * 0.2, -r * 0.08, r * 0.7, r * 0.16);
      break;
    case 4:
      ctx.fillRect(-r * 0.5, -r * 0.6, r, r * 0.35);
      ctx.fillRect(-r * 0.08, -r * 0.25, r * 0.16, r * 1.1);
      break;
    default:
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0);
      ctx.lineTo(0, -r * 0.8);
      ctx.lineTo(r * 0.8, r * 0.2);
      ctx.lineTo(0, r * 0.6);
      ctx.closePath();
      ctx.fill();
  }
  ctx.stroke();

  if (quality !== "reduced" && seededUnit(seed, 99) > 0.5) {
    ctx.fillStyle = colours.warning;
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.35, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.4 + Math.sin(time * pulseSpeeds.fast) * 0.3;
    ctx.strokeStyle = colours.warning;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.2);
    ctx.lineTo(r * 0.75, -r * 0.55);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawDrone(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  const r = entity.radius;
  const scan = Math.sin(time * pulseSpeeds.fast) * r * 0.08;
  const eyePulse = 0.6 + Math.sin(time * pulseSpeeds.medium) * 0.4;

  ctx.save();
  ctx.translate(scan, 0);
  if (entity.telegraphed) drawTelegraphBrackets(ctx, r, quality);

  ctx.fillStyle = colours.metal;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.95, r * 0.75);
  ctx.lineTo(-r * 0.95, r * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(49, 209, 198, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = eyePulse > 0.85 ? colours.warning : colours.warningAmber;
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  if (quality !== "reduced" && eyePulse > 0.8) {
    ctx.strokeStyle = "rgba(232, 93, 76, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.05);
    ctx.lineTo(r * 2.5, r * 0.05);
    ctx.stroke();
  }

  for (const sx of [-1, 1]) {
    ctx.fillStyle = colours.navyDeep;
    ctx.beginPath();
    ctx.arc(sx * r * 0.65, r * 0.55, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colours.tealDeep;
    ctx.globalAlpha = 0.5 + Math.sin(time * pulseSpeeds.fast + sx) * 0.3;
    ctx.beginPath();
    ctx.arc(sx * r * 0.65, r * 0.65, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawRadiationBarrier(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  const r = entity.radius;
  const charge = entity.telegraphed ? Math.min(1, Math.sin(time * pulseSpeeds.medium) * 0.5 + 0.5) : 1;

  ctx.save();
  if (entity.telegraphed) drawTelegraphBrackets(ctx, r, quality);

  const pylons = [-r * 0.75, r * 0.75];
  for (const px of pylons) {
    ctx.save();
    ctx.translate(px, 0);
    drawMetalPanel(ctx, r * 0.22, r * 0.55, 2);
    ctx.fillStyle = colours.warning;
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("!", 0, r * 0.08);
    ctx.restore();
  }

  ctx.globalAlpha = quality === "reduced" ? 0.25 : 0.32 + charge * 0.15;
  const fieldGrad = ctx.createLinearGradient(-r, 0, r, 0);
  fieldGrad.addColorStop(0, "rgba(232, 93, 76, 0.05)");
  fieldGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.35)");
  fieldGrad.addColorStop(1, "rgba(232, 93, 76, 0.05)");
  ctx.fillStyle = fieldGrad;
  ctx.fillRect(-r * 0.72, -r * 0.35, r * 1.44, r * 0.7);

  if (quality !== "reduced") {
    ctx.strokeStyle = "rgba(49, 209, 198, 0.35)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      const y = -r * 0.3 + ((time * 0.06 + i * 8) % (r * 0.6));
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, y);
      ctx.lineTo(r * 0.7, y);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawFudCloud(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  const r = entity.radius;
  const glitch = Math.sin(time * pulseSpeeds.fast * 1.5);

  ctx.save();
  if (entity.telegraphed) drawTelegraphBrackets(ctx, r, quality);

  ctx.globalAlpha = quality === "reduced" ? 0.35 : 0.45;
  ctx.fillStyle = "rgba(30, 35, 45, 0.85)";
  ctx.beginPath();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const wobble = 0.75 + seededUnit(entity.id, i) * 0.35 + glitch * 0.05;
    const px = Math.cos(a) * r * wobble;
    const py = Math.sin(a) * r * wobble * 0.65;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.5;
  ctx.fillStyle = colours.rugGlitch;
  for (let i = 0; i < 6; i += 1) {
    const gx = seededRange(entity.id, -r * 0.5, r * 0.5, i);
    const gy = seededRange(entity.id, -r * 0.3, r * 0.3, i + 7);
    ctx.fillRect(gx + glitch * 3, gy, 4 + (i % 2) * 3, 3);
  }

  ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, (i - 1) * r * 0.2);
    ctx.lineTo(r * 0.6, (i - 1) * r * 0.2 + glitch * 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawRugSignal(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  const r = entity.radius;
  const flicker = seededUnit(entity.id, Math.floor(time / 120)) > 0.15 ? 1 : 0.35;

  ctx.save();
  if (entity.telegraphed) drawTelegraphBrackets(ctx, r, quality);

  drawGlow(ctx, 0, 0, r, colours.teal, missionVisuals.glow.pickup * flicker, quality);

  ctx.fillStyle = colours.navyDeep;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colours.teal;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.globalAlpha = flicker;
  drawCircuitLine(ctx, -r * 0.35, 0, r * 0.35, 0);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = colours.warning;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, -r * 0.4);
  ctx.lineTo(r * 0.4, r * 0.4);
  ctx.stroke();

  if (quality !== "reduced") {
    ctx.strokeStyle = "rgba(232, 93, 76, 0.5)";
    ctx.globalAlpha = 0.35 + Math.sin(time * pulseSpeeds.fast) * 0.25;
    ctx.beginPath();
    ctx.arc(0, 0, r * (0.9 + Math.sin(time * pulseSpeeds.medium) * 0.08), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawMagneticDistortion(
  drawCtx: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  drawRadiationBarrier(drawCtx, entity, def);
}

export function drawHazardEntity(
  drawCtx: EntityDrawContext,
  entity: EntityDrawEntity,
  def: HazardDefinition,
): void {
  const { ctx } = drawCtx;
  ctx.save();
  ctx.translate(entity.x, entity.y);

  switch (entity.type) {
    case "asteroid":
      drawAsteroid(drawCtx, entity, def);
      break;
    case "debris":
      drawSatelliteDebris(drawCtx, entity, def);
      break;
    case "drone":
      drawDrone(drawCtx, entity, def);
      break;
    case "radiation":
      drawRadiationBarrier(drawCtx, entity, def);
      break;
    case "fud-cloud":
      drawFudCloud(drawCtx, entity, def);
      break;
    case "rug-signal":
      drawRugSignal(drawCtx, entity, def);
      break;
    case "magnetic":
      drawMagneticDistortion(drawCtx, entity, def);
      break;
    default:
      drawAsteroid(drawCtx, entity, def);
  }

  ctx.restore();
}
