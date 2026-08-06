import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import type { EntityDrawContext, TransientEffect } from "@/features/mission-ascent/rendering/types";

export function drawTransientEffects(
  drawCtx: EntityDrawContext,
  effects: readonly TransientEffect[],
): void {
  const { ctx, time, quality, reducedEffects } = drawCtx;
  const now = time;

  for (const effect of effects) {
    if (!effect.active) continue;
    const elapsed = now - effect.startTime;
    const t = Math.min(1, elapsed / effect.durationMs);
    if (t >= 1) continue;

    ctx.save();
    ctx.translate(effect.x, effect.y);

    switch (effect.kind) {
      case "pickup": {
        const expand = effect.radius * (0.6 + t * 1.4);
        ctx.strokeStyle = effect.color;
        ctx.globalAlpha = (1 - t) * 0.7;
        ctx.lineWidth = missionVisuals.lineWidths.medium;
        ctx.beginPath();
        ctx.arc(0, 0, expand, 0, Math.PI * 2);
        ctx.stroke();
        if (!reducedEffects && quality !== "reduced") {
          ctx.fillStyle = effect.color;
          ctx.globalAlpha = (1 - t) * 0.25;
          ctx.beginPath();
          ctx.arc(0, 0, expand * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "impact": {
        ctx.globalAlpha = (1 - t) * 0.85;
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * (0.3 + t * 0.8), 0, Math.PI * 2);
        ctx.fill();
        if (!reducedEffects && quality !== "reduced") {
          const fragments = reducedEffects
            ? missionVisuals.reducedEffectsParticleCounts.impactFragments
            : missionVisuals.particleCounts.impactFragments;
          for (let i = 0; i < fragments; i += 1) {
            const a = (i / fragments) * Math.PI * 2;
            const dist = effect.radius * t * 1.2;
            ctx.fillStyle = i % 2 === 0 ? effect.color : missionVisuals.colours.warning;
            ctx.globalAlpha = (1 - t) * 0.6;
            ctx.fillRect(Math.cos(a) * dist - 1, Math.sin(a) * dist - 1, 2.5, 2.5);
          }
        }
        break;
      }
      case "damage-spark": {
        const sparkCount =
          quality === "reduced" || reducedEffects ? 6 : 12;
        for (let i = 0; i < sparkCount; i += 1) {
          const a = (i / sparkCount) * Math.PI * 2 + t * 2.4;
          const dist = effect.radius * (0.35 + t * 1.35);
          const len = 3 + (1 - t) * 5;
          ctx.strokeStyle = i % 3 === 0 ? "#ff6b4a" : i % 3 === 1 ? "#ff3b30" : "#ffb347";
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = (1 - t) * 0.85;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * dist, Math.sin(a) * dist);
          ctx.lineTo(Math.cos(a) * (dist + len), Math.sin(a) * (dist + len));
          ctx.stroke();
        }
        ctx.fillStyle = "#ff3b30";
        ctx.globalAlpha = (1 - t) * 0.35;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * (0.25 + t * 0.55), 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "near-miss": {
        ctx.strokeStyle = missionVisuals.colours.teal;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = (1 - t) * 0.55;
        ctx.beginPath();
        ctx.moveTo(-effect.radius, -effect.radius * 0.3);
        ctx.lineTo(-effect.radius * 0.5, 0);
        ctx.lineTo(-effect.radius, effect.radius * 0.3);
        ctx.stroke();
        break;
      }
      case "target-lock": {
        const pulse = 0.85 + Math.sin(now * missionVisuals.pulseSpeeds.medium) * 0.15;
        ctx.strokeStyle = missionVisuals.colours.tealBright;
        ctx.lineWidth = 2;
        ctx.globalAlpha = (1 - t * 0.5) * 0.65;
        const s = effect.radius * pulse;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        break;
      }
    }

    ctx.restore();
  }
}
