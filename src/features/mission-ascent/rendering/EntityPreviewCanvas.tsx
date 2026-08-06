"use client";

import { useEffect, useRef } from "react";
import type { MissionVisualQuality } from "@/features/mission-ascent/config/visualConfig";
import { getEntityRadius } from "@/features/mission-ascent/config/entityDefinitions";
import { drawEntityPreview } from "@/features/mission-ascent/rendering/dispatchEntity";
import { cn } from "@/lib/utils/cn";

type EntityPreviewCanvasProps = {
  kind: "collectible" | "hazard" | "logo-component";
  type: string;
  size?: number;
  quality?: MissionVisualQuality;
  reducedEffects?: boolean;
  seed?: number;
  className?: string;
  showBounds?: boolean;
};

export function EntityPreviewCanvas({
  kind,
  type,
  size = 48,
  quality = "standard",
  reducedEffects = false,
  className,
  showBounds = false,
}: EntityPreviewCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#061821";
      ctx.fillRect(0, 0, size, size);

      if (showBounds) {
        ctx.strokeStyle = "rgba(49, 209, 198, 0.15)";
        ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
      }

      ctx.save();
      ctx.translate(size / 2, size / 2 + 2);
      const radius = getEntityRadius(kind, type as never);
      const previewRadius = (radius / (radius + 8)) * (size * 0.38);

      drawEntityPreview(
        {
          ctx,
          time: performance.now() + frame * 16,
          quality,
          reducedEffects,
        },
        kind,
        type,
        previewRadius,
      );
      ctx.restore();
      frame += 1;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [kind, type, size, quality, reducedEffects, showBounds]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={cn("rounded border border-brand/20 bg-bg-primary/60", className)}
      aria-hidden="true"
    />
  );
}
