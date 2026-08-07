"use client";

import { useCallback, useState } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { Host } from "@/types/content";
import { cn } from "@/lib/utils/cn";

const HOST_AVATAR_SIZES = "(max-width: 767px) 288px, 320px";
const HOST_FULL_PORTRAIT_SIZES = "(max-width: 767px) 360px, 400px";
const HOST_PORTRAIT_QUALITY = 92;

type HostRevealPortraitProps = {
  host: Host;
};

function getPopUpPortraitClass(hostId: string, expanded: boolean): string {
  const motionSafe = "motion-reduce:translate-y-0 motion-reduce:group-hover:translate-y-0";

  if (hostId === "petey-k") {
    return cn(
      "top-0 w-[12.5rem] -translate-x-1/2",
      expanded
        ? "-translate-y-[6.75rem] md:-translate-y-[5rem]"
        : "translate-y-3 md:translate-y-3 md:group-hover:-translate-y-[5rem]",
      motionSafe,
    );
  }

  if (hostId === "janner") {
    return cn(
      "top-0 w-[13rem] -translate-x-1/2",
      expanded
        ? "-translate-y-[7.25rem] md:-translate-y-[5.25rem]"
        : "translate-y-3 md:translate-y-3 md:group-hover:-translate-y-[5.25rem]",
      motionSafe,
    );
  }

  return cn(
    "top-0 w-[11.5rem] -translate-x-1/2",
    expanded
      ? "-translate-y-[6.25rem] md:-translate-y-[4.75rem]"
      : "translate-y-3 md:translate-y-3 md:group-hover:-translate-y-[4.75rem]",
    motionSafe,
  );
}

/**
 * NFT-style PFP at rest; full character pops up on hover (desktop) or tap (mobile).
 */
export function HostRevealPortrait({ host }: HostRevealPortraitProps) {
  const [revealed, setRevealed] = useState(false);
  const background = host.portraitBackground ?? "#189e97";
  const fullSrc = host.fullImage ?? host.image;
  const expanded = revealed;

  const toggleReveal = useCallback(() => {
    setRevealed((current) => !current);
  }, []);

  return (
    <div
      className={cn(
        "relative h-[var(--host-pfp-size,10rem)] w-[var(--host-pfp-size,10rem)] shrink-0 overflow-visible",
        expanded && "z-30",
        "group-hover:z-30",
      )}
    >
      <div
        className="host-portrait-glow pointer-events-none absolute inset-0 z-0 rounded-full border-2 border-brand ring-4 ring-brand/10"
        style={{ backgroundColor: background }}
        aria-hidden="true"
      />

      {/* Square PFP — fills the circle like an NFT avatar at rest */}
      <div
        className={cn(
          "absolute inset-0 z-10 overflow-hidden rounded-full transition-opacity duration-300",
          expanded && "pointer-events-none opacity-0",
          "md:group-hover:pointer-events-none md:group-hover:opacity-0",
        )}
        aria-hidden={expanded}
      >
        <ImageWithFallback
          src={host.image}
          alt=""
          width={512}
          height={512}
          className="h-full w-full scale-[1.14] object-cover object-center"
          sizes={HOST_AVATAR_SIZES}
          quality={HOST_PORTRAIT_QUALITY}
        />
      </div>

      {/* Full character — hidden at rest, revealed on hover or tap */}
      <div
        className={cn(
          "host-reveal-portrait__clip pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-full opacity-0",
          expanded && "is-revealed pointer-events-auto opacity-100",
          "md:group-hover:pointer-events-auto md:group-hover:opacity-100",
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
            getPopUpPortraitClass(host.id, expanded),
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
