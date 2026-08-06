import {
  getLetterSourceCrop,
  LOGO_COMPONENT_ASSETS,
  LOGO_LETTER_SLOTS,
} from "@/features/mission-ascent/config/missionAssembly";
import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import type { LogoComponentDefinition } from "@/features/mission-ascent/config/entityDefinitions";
import {
  drawAngularFrame,
  drawCircuitLine,
  drawEnergyCore,
  drawGlow,
  drawMetalPanel,
} from "@/features/mission-ascent/rendering/shared/primitives";
import type { EntityDrawContext, EntityDrawEntity } from "@/features/mission-ascent/rendering/types";
import type { LogoComponentType } from "@/features/mission-ascent/types/mission.types";
import { getActiveLetterStyle } from "@/features/mission-ascent/rendering/activeSectorVisuals";

const logoSprites = new Map<string, HTMLImageElement>();

export function getLogoSprite(type: LogoComponentType): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  const path = LOGO_COMPONENT_ASSETS[type];
  const cached = logoSprites.get(path);
  if (cached?.complete && cached.naturalWidth > 0) return cached;
  if (!cached) {
    const img = new Image();
    img.src = path;
    img.onload = () => logoSprites.set(path, img);
    logoSprites.set(path, img);
  }
  const sprite = logoSprites.get(path);
  return sprite?.complete && sprite.naturalWidth > 0 ? sprite : null;
}

export function drawLogoComponentEntity(
  drawCtx: EntityDrawContext,
  entity: EntityDrawEntity,
  def: LogoComponentDefinition,
): void {
  const { ctx, time, quality, reducedEffects } = drawCtx;
  const type = entity.type as LogoComponentType;
  const sprite = getLogoSprite(type);
  const slot = LOGO_LETTER_SLOTS[type];
  const letterStyle = getActiveLetterStyle();
  const glowColor = letterStyle?.glowColor ?? def.glow;
  const coreColor = letterStyle?.coreColor ?? missionVisuals.colours.tealBright;
  const particleColor = letterStyle?.particleColor ?? missionVisuals.colours.teal;
  const pulseSpeed = letterStyle?.pulseSpeed ?? missionVisuals.pulseSpeeds.logo;
  const pulse = 1 + Math.sin(time * pulseSpeed) * 0.07;
  const r = entity.radius;
  const frameW = r * 2.1 * pulse;
  const frameH = r * 2.35 * pulse;
  const tilt = Math.sin(time * 0.0025) * 0.06;

  ctx.save();
  ctx.translate(entity.x, entity.y);
  ctx.rotate(tilt);

  if (entity.telegraphed && quality !== "reduced") {
    ctx.strokeStyle = letterStyle?.outlineColor
      ? `${letterStyle.outlineColor}99`
      : "rgba(49, 209, 198, 0.45)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    const pad = r + 10;
    ctx.strokeRect(-pad, -pad, pad * 2, pad * 2);
    ctx.setLineDash([]);
    const bracket = 8;
    ctx.lineWidth = 2;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      ctx.beginPath();
      ctx.moveTo(pad * sx, (pad - bracket) * sy);
      ctx.lineTo(pad * sx, pad * sy);
      ctx.lineTo((pad - bracket) * sx, pad * sy);
      ctx.stroke();
    }
  }

  drawGlow(
    ctx,
    0,
    0,
    r,
    glowColor,
    reducedEffects ? missionVisuals.glow.logoReduced : missionVisuals.glow.logo,
    quality,
  );

  if (!reducedEffects && quality !== "reduced") {
    ctx.globalAlpha = 0.18;
    ctx.filter = "brightness(0) invert(1)";
    if (sprite) {
      const crop = getLetterSourceCrop(sprite.naturalWidth, sprite.naturalHeight, slot);
      const ghostH = frameH * 0.72;
      const ghostW = ghostH * (crop.sw / crop.sh);
      ctx.drawImage(
        sprite,
        crop.sx,
        crop.sy,
        crop.sw,
        crop.sh,
        -ghostW / 2 + 3,
        -ghostH / 2 + 2,
        ghostW,
        ghostH,
      );
    }
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }

  drawMetalPanel(ctx, frameW, frameH, 5);
  drawAngularFrame(ctx, frameW, frameH, 4);

  drawCircuitLine(ctx, -frameW * 0.35, -frameH * 0.2, frameW * 0.35, -frameH * 0.2);
  drawCircuitLine(ctx, -frameW * 0.35, frameH * 0.2, frameW * 0.35, frameH * 0.2);

  const destH = frameH * 0.62;
  if (sprite) {
    const crop = getLetterSourceCrop(sprite.naturalWidth, sprite.naturalHeight, slot);
    const destW = destH * (crop.sw / crop.sh);

    if (quality !== "reduced" && !reducedEffects) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20 * pulse;
    }
    ctx.drawImage(
      sprite,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      -destW / 2,
      -destH / 2,
      destW,
      destH,
    );
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = missionVisuals.colours.teal;
    ctx.font = `bold ${r * 0.9}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(type.toUpperCase(), 0, 0);
  }

  drawEnergyCore(ctx, r * 0.35, coreColor, 0.5 + Math.sin(time * (letterStyle?.pulseSpeed ?? 0.004)) * 0.5);

  if (!reducedEffects && quality !== "reduced") {
    const trailCount = missionVisuals.particleCounts.logoTrail;
    ctx.fillStyle = particleColor;
    for (let i = 0; i < trailCount; i += 1) {
      const ty = frameH * 0.55 + ((time * 0.05 + i * 7) % 18);
      ctx.globalAlpha = 0.25 - i * 0.04;
      ctx.beginPath();
      ctx.arc((i - trailCount / 2) * 3, ty, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
