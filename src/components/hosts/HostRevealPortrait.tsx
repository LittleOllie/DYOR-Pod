"use client";

import { useCallback, useState } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { Host } from "@/types/content";
import { cn } from "@/lib/utils/cn";

/** Retina-safe sizes — display is ~144px circle / ~200px full art at 1x. */
const HOST_AVATAR_SIZES = "(max-width: 767px) 288px, 288px";
const HOST_FULL_PORTRAIT_SIZES = "(max-width: 767px) 360px, 400px";
const HOST_PORTRAIT_QUALITY = 92;

type HostRevealPortraitProps = {
  host: Host;
};

function getFullPortraitClass(hostId: string, revealed: boolean): string {
  const motionSafe = "motion-reduce:translate-y-0 motion-reduce:group-hover:translate-y-0";

  if (hostId === "petey-k") {
    return cn(
      "top-[-1rem] w-[12.25rem] -translate-x-[calc(50%+0.35rem)]",
      revealed ? "-translate-y-[6.2rem] md:-translate-y-[3.75rem]" : "translate-y-0",
      "group-hover:-translate-y-[6.2rem] md:group-hover:-translate-y-[3.75rem]",
      motionSafe,
    );
  }

  if (hostId === "janner") {
    return cn(
      "top-[-0.42rem] w-[12.62rem] -translate-x-1/2",
      revealed ? "-translate-y-[6.95rem] md:-translate-y-[4rem]" : "translate-y-0",
      "group-hover:-translate-y-[6.95rem] md:group-hover:-translate-y-[4rem]",
      motionSafe,
    );
  }

  return cn(
    "top-[-0.35rem] w-[10.5rem] -translate-x-1/2",
    revealed ? "-translate-y-[5.8rem] md:-translate-y-[3.5rem]" : "translate-y-0",
    "group-hover:-translate-y-[5.8rem] md:group-hover:-translate-y-[3.5rem]",
    motionSafe,
  );
}

/**
 * Fixed-size portrait slot. Mobile: webp PFP at rest, full character pops up on tap.
 * Desktop: full character cropped in circle at rest, slides up on hover.
 */
export function HostRevealPortrait({ host }: HostRevealPortraitProps) {
  const [revealed, setRevealed] = useState(false);
  const background = host.portraitBackground ?? "#189e97";
  const fullSrc = host.fullImage ?? host.image;

  const toggleReveal = useCallback(() => {
    setRevealed((current) => !current);
  }, []);

  return (
    <div
      className={cn(
        "relative h-36 w-36 shrink-0 overflow-visible",
        "max-md:pt-[5.75rem] max-md:-mt-[5.75rem]",
        revealed && "z-30",
        "group-hover:z-30",
      )}
    >
      {/* Fixed circle + glow — stays put while the character rises in front */}
      <div
        className="host-portrait-glow pointer-events-none absolute inset-0 z-0 rounded-full border-2 border-brand ring-4 ring-brand/10"
        style={{ backgroundColor: background }}
        aria-hidden="true"
      />

      {/* Mobile: crisp webp avatar at rest */}
      <div
        className={cn(
          "absolute inset-0 z-10 overflow-hidden rounded-full md:hidden",
          revealed && "pointer-events-none opacity-0",
        )}
        aria-hidden={revealed}
      >
        <ImageWithFallback
          src={host.image}
          alt=""
          width={512}
          height={512}
          className="h-full w-full object-cover"
          sizes={HOST_AVATAR_SIZES}
          quality={HOST_PORTRAIT_QUALITY}
        />
      </div>

      {/* Full character — desktop always; mobile when tapped */}
      <div
        className={cn(
          "host-reveal-portrait__clip absolute inset-0 z-20 overflow-hidden rounded-full",
          revealed && "is-revealed",
          !revealed && "max-md:invisible max-md:opacity-0",
        )}
      >
        <ImageWithFallback
          src={fullSrc}
          alt={`${host.name} character portrait`}
          width={1024}
          height={1536}
          objectFit="contain"
          className={cn(
            "host-reveal-portrait__image pointer-events-none absolute left-1/2 h-auto max-w-none",
            "transition-transform duration-500 ease-[var(--ease-out)]",
            getFullPortraitClass(host.id, revealed),
          )}
          sizes={HOST_FULL_PORTRAIT_SIZES}
          quality={HOST_PORTRAIT_QUALITY}
        />
      </div>

      <button
        type="button"
        className={cn(
          "absolute inset-0 z-30 rounded-full md:hidden",
          "cursor-pointer touch-manipulation bg-transparent focus-ring",
        )}
        aria-pressed={revealed}
        aria-label={
          revealed
            ? `${host.name} — tap to hide full character`
            : `${host.name} — tap to reveal full character`
        }
        onClick={toggleReveal}
      />

      <p className="sr-only">
        {host.name} — tap or hover the card to reveal full character
      </p>
    </div>
  );
}
