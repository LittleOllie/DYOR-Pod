import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import {
  drawCircuitLine,
  drawEnergyCore,
  drawGlow,
  drawHexPath,
  drawMetalPanel,
} from "@/features/mission-ascent/rendering/shared/primitives";
import type { EntityDrawContext, EntityDrawEntity } from "@/features/mission-ascent/rendering/types";
import type { CollectibleDefinition } from "@/features/mission-ascent/config/entityDefinitions";

const { colours, pulseSpeeds, rotationSpeeds } = missionVisuals;

export function drawDataShard(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: CollectibleDefinition,
): void {
  const r = entity.radius;
  const pulse = 0.5 + Math.sin(time * pulseSpeeds.medium) * 0.5;
  const tilt = entity.rotation + time * rotationSpeeds.shard * 0.001;

  ctx.save();
  ctx.rotate(tilt);
  drawGlow(ctx, 0, 0, r, def.glow, missionVisuals.glow.pickup, quality);

  ctx.fillStyle = "rgba(49, 209, 198, 0.18)";
  ctx.strokeStyle = colours.teal;
  ctx.lineWidth = missionVisuals.lineWidths.medium;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.72, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.72, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -r * 0.55);
  ctx.lineTo(r * 0.38, 0);
  ctx.lineTo(0, r * 0.55);
  ctx.lineTo(-r * 0.38, 0);
  ctx.closePath();
  ctx.fillStyle = colours.navyDeep;
  ctx.fill();

  drawEnergyCore(ctx, r, colours.tealBright, pulse);
  drawCircuitLine(ctx, -r * 0.3, -r * 0.15, r * 0.25, r * 0.2);
  drawCircuitLine(ctx, r * 0.1, -r * 0.35, -r * 0.15, r * 0.35);

  if (quality !== "reduced") {
    ctx.strokeStyle = colours.cyan;
    ctx.globalAlpha = 0.35 + pulse * 0.25;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawDataCluster(
  ctx: EntityDrawContext,
  entity: EntityDrawEntity,
  def: CollectibleDefinition,
): void {
  drawDataShard(ctx, entity, def);
  const { ctx: c, time } = ctx;
  const r = entity.radius * 0.35;
  const orbit = time * 0.002;
  c.save();
  for (let i = 0; i < 3; i += 1) {
    const a = orbit + (i / 3) * Math.PI * 2;
    c.translate(Math.cos(a) * entity.radius * 0.55, Math.sin(a) * entity.radius * 0.55);
    drawDataShard(ctx, { ...entity, radius: r, rotation: entity.rotation + i }, def);
    c.translate(-Math.cos(a) * entity.radius * 0.55, -Math.sin(a) * entity.radius * 0.55);
  }
  c.restore();
}

export function drawFuelCell(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: CollectibleDefinition,
): void {
  const r = entity.radius;
  const pulse = 0.5 + Math.sin(time * pulseSpeeds.medium) * 0.5;
  const clampRot = time * rotationSpeeds.fuelClamp * 0.001;

  ctx.save();
  drawGlow(ctx, 0, 0, r, colours.amberDeep, missionVisuals.glow.pickup, quality);

  drawMetalPanel(ctx, r * 1.1, r * 2, 3);
  ctx.fillStyle = "rgba(229, 207, 89, 0.15)";
  ctx.fillRect(-r * 0.35, -r * 0.75, r * 0.7, r * 1.5);

  const fluidY = -r * 0.6 + (1 - pulse) * r * 1.1;
  const grad = ctx.createLinearGradient(0, fluidY, 0, fluidY + r * 1.2);
  grad.addColorStop(0, colours.amber);
  grad.addColorStop(0.5, "#f0d060");
  grad.addColorStop(1, colours.amberDeep);
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(-r * 0.32, fluidY, r * 0.64, r * 1.15);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = colours.tealDeep;
  ctx.lineWidth = 2;
  ctx.strokeRect(-r * 0.08, -r * 0.85, r * 0.16, r * 1.7);

  ctx.save();
  ctx.rotate(clampRot);
  ctx.strokeStyle = "rgba(49, 209, 198, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-r * 0.48, -r * 0.55, r * 0.18, r * 1.1);
  ctx.strokeRect(r * 0.3, -r * 0.55, r * 0.18, r * 1.1);
  ctx.restore();

  drawEnergyCore(ctx, r * 0.5, colours.amber, pulse);
  ctx.restore();
}

export function drawShieldCore(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: CollectibleDefinition,
): void {
  const r = entity.radius;
  const t = time * 0.001;

  ctx.save();
  drawGlow(ctx, 0, 0, r, def.glow, missionVisuals.glow.pickupHigh, quality);

  ctx.fillStyle = colours.navyDeep;
  drawHexPath(ctx, r * 0.55);
  ctx.fill();
  ctx.strokeStyle = colours.tealDeep;
  ctx.lineWidth = missionVisuals.lineWidths.medium;
  ctx.stroke();

  ctx.save();
  ctx.rotate(t * rotationSpeeds.shieldRing);
  ctx.strokeStyle = "rgba(49, 209, 198, 0.45)";
  ctx.lineWidth = 1.5;
  drawHexPath(ctx, r * 0.78);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.rotate(-t * rotationSpeeds.shieldRing * 1.3);
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = colours.cyan;
  drawHexPath(ctx, r * 0.92);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
  ctx.stroke();

  drawEnergyCore(ctx, r, colours.shield, 0.5 + Math.sin(time * pulseSpeeds.slow) * 0.5);
  ctx.restore();
}

export function drawCoolingCore(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: CollectibleDefinition,
): void {
  const r = entity.radius;
  const rotor = time * rotationSpeeds.coolingRotor * 0.001;
  const pulse = Math.sin(time * pulseSpeeds.medium);

  ctx.save();
  drawGlow(ctx, 0, 0, r, def.glow, missionVisuals.glow.pickup, quality);

  ctx.fillStyle = colours.navyDeep;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colours.tealDeep;
  ctx.lineWidth = missionVisuals.lineWidths.medium;
  ctx.stroke();

  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const finLen = r * (0.35 + (i % 2 === 0 ? pulse * 0.04 : 0));
    ctx.fillStyle = colours.metal;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
    ctx.lineTo(Math.cos(a) * finLen, Math.sin(a) * finLen);
    ctx.lineWidth = 3;
    ctx.strokeStyle = colours.frost;
    ctx.stroke();
  }

  ctx.save();
  ctx.rotate(rotor);
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2;
    ctx.fillStyle = "rgba(110, 231, 216, 0.7)";
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.28, Math.sin(a) * r * 0.28, r * 0.12, r * 0.05, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawEnergyCore(ctx, r * 0.6, colours.frost, 0.55);

  if (quality !== "reduced") {
    ctx.fillStyle = "rgba(200, 240, 255, 0.15)";
    for (let i = 0; i < 3; i += 1) {
      const vy = r * 0.5 + ((time * 0.04 + i * 12) % 20);
      ctx.beginPath();
      ctx.arc((i - 1) * 4, vy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawSignalBeacon(
  { ctx, time, quality }: EntityDrawContext,
  entity: EntityDrawEntity,
  def: CollectibleDefinition,
): void {
  const r = entity.radius;
  const bob = Math.sin(time * pulseSpeeds.slow) * r * 0.06;
  const sweep = (time * rotationSpeeds.beaconRadar * 0.001) % (Math.PI * 2);

  ctx.save();
  ctx.translate(0, bob);
  drawGlow(ctx, 0, 0, r, def.glow, missionVisuals.glow.pickupHigh, quality);

  drawMetalPanel(ctx, r * 0.5, r * 1.2, 2);
  ctx.fillStyle = colours.navyDeep;
  ctx.beginPath();
  ctx.arc(0, -r * 0.15, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  drawEnergyCore(ctx, r * 0.35, colours.tealBright, 0.6);

  for (let i = 0; i < 4; i += 1) {
    const a = sweep + (i / 4) * Math.PI * 2;
    ctx.strokeStyle = "rgba(49, 209, 198, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.15);
    ctx.lineTo(Math.cos(a) * r * 0.85, -r * 0.15 + Math.sin(a) * r * 0.5);
    ctx.stroke();
  }

  if (quality !== "reduced") {
    const ringPulse = 0.4 + Math.sin(time * pulseSpeeds.medium) * 0.3;
    ctx.strokeStyle = colours.teal;
    ctx.globalAlpha = ringPulse;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * (0.55 + ringPulse * 0.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawCollectibleEntity(
  drawCtx: EntityDrawContext,
  entity: EntityDrawEntity,
  def: CollectibleDefinition,
): void {
  const { ctx } = drawCtx;
  ctx.save();
  ctx.translate(entity.x, entity.y);
  ctx.rotate(entity.rotation);

  switch (entity.type) {
    case "research":
      drawDataShard(drawCtx, entity, def);
      break;
    case "data-cube":
      drawDataCluster(drawCtx, entity, def);
      break;
    case "fuel":
      drawFuelCell(drawCtx, entity, def);
      break;
    case "shield":
      drawShieldCore(drawCtx, entity, def);
      break;
    case "cooling":
      drawCoolingCore(drawCtx, entity, def);
      break;
    case "signal-beacon":
      drawSignalBeacon(drawCtx, entity, def);
      break;
    default:
      drawDataShard(drawCtx, entity, def);
  }

  ctx.restore();
}
