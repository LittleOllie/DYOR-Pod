import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import { GAME_ROCKET_SPRITE } from "@/features/mission-ascent/config/missionAssembly";
import {
  blendBackgroundConfig,
  renderSectorBackground,
  renderSectorGrid,
} from "@/features/mission-ascent/rendering/SectorBackgroundRenderer";
import { blendZones } from "@/features/mission-ascent/config/zones";
import { drawWorldEntity } from "@/features/mission-ascent/rendering/dispatchEntity";
import { drawTransientEffects } from "@/features/mission-ascent/rendering/effects/drawTransientEffects";
import type { MissionVisualQuality } from "@/features/mission-ascent/config/visualConfig";
import type { EntityDrawContext } from "@/features/mission-ascent/rendering/types";
import type { MissionEngine } from "@/features/mission-ascent/engine/MissionEngine";
import { lerpColor } from "@/features/mission-ascent/utils/math";

const ROCKET_SPRITE_SRC = GAME_ROCKET_SPRITE;
const ROCKET_SPRITE_HEIGHT = Math.round(72 * missionConfig.entityScale.rocket);

let rocketSprite: HTMLImageElement | null = null;
let rocketSpriteLoading = false;

function loadSprite(
  src: string,
  cache: { img: HTMLImageElement | null; loading: boolean },
  onReady: (img: HTMLImageElement) => void,
): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  if (cache.img?.complete && cache.img.naturalWidth > 0) return cache.img;
  if (!cache.loading) {
    cache.loading = true;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      cache.img = img;
      onReady(img);
    };
    img.onerror = () => {
      cache.loading = false;
    };
  }
  return cache.img?.complete && cache.img.naturalWidth > 0 ? cache.img : null;
}

const rocketCache = { img: rocketSprite, loading: rocketSpriteLoading };

function getRocketSprite(): HTMLImageElement | null {
  const sprite = loadSprite(ROCKET_SPRITE_SRC, rocketCache, (img) => {
    rocketSprite = img;
  });
  rocketSprite = rocketCache.img;
  rocketSpriteLoading = rocketCache.loading;
  return sprite;
}

export function renderMissionFrame(
  ctx: CanvasRenderingContext2D,
  engine: MissionEngine,
  shakeX = 0,
  shakeY = 0,
  quality: MissionVisualQuality = "standard",
): void {
  const state = engine.getRenderState();
  const { width, height, playfield } = state;
  const time = performance.now();

  ctx.save();
  ctx.translate(shakeX, shakeY);

  if (state.sectorBackground?.current) {
    renderSectorBackground(ctx, width, height, {
      current: state.sectorBackground.current,
      previous: state.sectorBackground.previous,
      blend: state.sectorBackground.blend,
      altitudeKm: state.altitudeKm,
      signalBoostActive: false,
      quality,
    });
  } else {
    const zoneBlend = blendZones(state.altitudeKm);
    const top = zoneBlend.next
      ? lerpColor(zoneBlend.current.bgTop, zoneBlend.next.bgTop, zoneBlend.blend)
      : zoneBlend.current.bgTop;
    const bottom = zoneBlend.next
      ? lerpColor(zoneBlend.current.bgBottom, zoneBlend.next.bgBottom, zoneBlend.blend)
      : zoneBlend.current.bgBottom;
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  drawPlayfieldMargins(ctx, playfield, height, quality);

  ctx.save();
  ctx.translate(playfield.offsetX, 0);

  if (state.sectorGrid && quality !== "reduced") {
    const gridConfig =
      state.sectorBackground?.previous && state.sectorBackground.blend < 1
        ? blendBackgroundConfig(
            state.sectorBackground.previous,
            state.sectorBackground.current,
            state.sectorBackground.blend,
          )
        : state.sectorGrid;
    renderSectorGrid(
      ctx,
      playfield.activeWidth,
      height,
      playfield.activeWidth,
      state.altitudeKm,
      gridConfig,
      false,
      quality,
    );
  } else if (quality !== "reduced") {
    ctx.strokeStyle = "rgba(49, 209, 198, 0.06)";
    ctx.lineWidth = 1;
    const gridSize = 48;
    const offset = ((state.altitudeKm * 100) % gridSize);
    for (let x = 0; x < playfield.activeWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = -gridSize + offset; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(playfield.activeWidth, y);
      ctx.stroke();
    }
  }

  const drawCtx: EntityDrawContext = {
    ctx,
    time,
    quality,
    reducedEffects: state.reducedEffects,
  };

  for (const entity of state.entities) {
    if (!entity.active) continue;
    drawWorldEntity(drawCtx, entity, entity.kind);
  }

  drawTransientEffects(drawCtx, state.transientEffects);

  for (const p of state.particles) {
    if (!p.active) continue;
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (state.shield) drawShield(ctx, state.playerX, state.playerY);
  drawRocket(
    ctx,
    state.playerX,
    state.playerY,
    state.bankAngle,
    state.throttle,
    state.invulnerable,
    playfield.rocketRenderScale,
    quality,
    state.reducedEffects,
  );

  for (const ident of state.entityIdentifications) {
    drawEntityIdentification(ctx, ident);
  }

  if (state.assemblyCompleteFlash && !state.reducedEffects) {
    ctx.fillStyle = "rgba(49, 209, 198, 0.08)";
    ctx.fillRect(0, 0, playfield.activeWidth, height);
  }

  if (state.signalBoostActive && quality !== "reduced" && !state.reducedEffects) {
    ctx.strokeStyle = "rgba(49, 209, 198, 0.15)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const lx = (playfield.activeWidth / 5) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx - 8, height);
      ctx.stroke();
    }
  }

  ctx.restore();
  ctx.restore();
}

function drawPlayfieldMargins(
  ctx: CanvasRenderingContext2D,
  playfield: { offsetX: number; activeWidth: number; viewportWidth: number },
  height: number,
  quality: string,
): void {
  if (playfield.offsetX < 8) return;
  const fade = ctx.createLinearGradient(playfield.offsetX - 40, 0, playfield.offsetX, 0);
  fade.addColorStop(0, "rgba(6, 24, 33, 0.2)");
  fade.addColorStop(1, "rgba(6, 24, 33, 0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, playfield.offsetX, height);
  ctx.fillStyle = fade;
  ctx.save();
  ctx.translate(playfield.viewportWidth, 0);
  ctx.scale(-1, 1);
  ctx.fillRect(0, 0, playfield.offsetX, height);
  ctx.restore();

  if (quality === "reduced") return;
  ctx.strokeStyle = "rgba(49, 209, 198, 0.08)";
  ctx.lineWidth = 1;
  for (const x of [playfield.offsetX, playfield.offsetX + playfield.activeWidth]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawEntityIdentification(
  ctx: CanvasRenderingContext2D,
  ident: { title: string; hint: string; x: number; y: number },
): void {
  const labelX = ident.x + 20;
  const labelY = ident.y - 24;
  ctx.strokeStyle = "rgba(49, 209, 198, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ident.x + 8, ident.y - 4);
  ctx.lineTo(labelX - 4, labelY + 8);
  ctx.stroke();

  ctx.fillStyle = "rgba(6, 24, 33, 0.88)";
  ctx.strokeStyle = "rgba(49, 209, 198, 0.35)";
  const w = Math.max(90, ident.title.length * 6.5);
  ctx.fillRect(labelX, labelY - 10, w, 28);
  ctx.strokeRect(labelX, labelY - 10, w, 28);
  ctx.fillStyle = "#31d1c6";
  ctx.font = "bold 9px monospace";
  ctx.fillText(ident.title, labelX + 4, labelY + 2);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "8px monospace";
  ctx.fillText(ident.hint, labelX + 4, labelY + 12);
}

function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = "rgba(49, 209, 198, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 34, 0, Math.PI * 2);
  ctx.stroke();
}

function drawExhaustFlames(
  ctx: CanvasRenderingContext2D,
  throttle: number,
  exhaustY: number,
): void {
  if (throttle <= 0.05) return;

  const flicker = 0.82 + Math.sin(performance.now() / 45) * 0.18;
  const flameH = (10 + throttle * 30) * flicker;
  const flameW = 7 + throttle * 5;

  ctx.save();
  ctx.fillStyle = throttle > 0.85 ? "#E85D4C" : throttle > 0.6 ? "#E5CF59" : "#31D1C6";
  ctx.globalAlpha = 0.35 + throttle * 0.45;
  ctx.beginPath();
  ctx.moveTo(-flameW, exhaustY);
  ctx.quadraticCurveTo(-flameW * 0.45, exhaustY + flameH * 0.55, 0, exhaustY + flameH);
  ctx.quadraticCurveTo(flameW * 0.45, exhaustY + flameH * 0.55, flameW, exhaustY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.18 + throttle * 0.22;
  ctx.beginPath();
  ctx.moveTo(-flameW * 0.35, exhaustY);
  ctx.lineTo(0, exhaustY + flameH * 0.72);
  ctx.lineTo(flameW * 0.35, exhaustY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bank: number,
  throttle: number,
  invulnerable: boolean,
  renderScale = 1,
  quality: MissionVisualQuality = "standard",
  reducedEffects = false,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(renderScale, renderScale);
  ctx.rotate(bank);
  if (invulnerable) ctx.globalAlpha = 0.55 + Math.sin(performance.now() / 90) * 0.25;

  const rocket = getRocketSprite();
  const rocketH = ROCKET_SPRITE_HEIGHT;
  const showGlow = !reducedEffects && quality !== "reduced";

  if (rocket) {
    const rocketW = rocketH * (rocket.naturalWidth / rocket.naturalHeight);

    if (throttle > 0.05) {
      drawExhaustFlames(ctx, throttle, rocketH * 0.46);
    }

    if (showGlow) {
      ctx.shadowColor = "rgba(49, 209, 198, 0.5)";
      ctx.shadowBlur = 12 + throttle * 8;
    }

    ctx.drawImage(rocket, -rocketW / 2, -rocketH / 2, rocketW, rocketH);
    ctx.shadowBlur = 0;
  } else {
    drawExhaustFlames(ctx, throttle, ROCKET_SPRITE_HEIGHT * 0.46);
    if (showGlow) {
      ctx.shadowColor = missionVisuals.colours.teal;
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = "#31D1C6";
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(10, 24);
    ctx.lineTo(-10, 24);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
