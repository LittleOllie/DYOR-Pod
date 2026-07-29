"use client";

import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { podcast } from "@/content/podcast";
import { cn } from "@/lib/utils/cn";

type MobileActionBarProps = {
  isLive: boolean;
  ctaHref: string;
};

export function MobileActionBar({ isLive, ctaHref }: MobileActionBarProps) {
  const primaryLabel = isLive ? "Join Live" : "Next Space";
  const primaryVariant = isLive ? "live" : "primary";

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-primary/95 backdrop-blur-md md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 px-4",
      )}
      role="region"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <LinkButton
          href={ctaHref}
          variant={primaryVariant}
          size="lg"
          className="min-h-[52px] flex-1 text-base"
          external={ctaHref.startsWith("http")}
        >
          {primaryLabel}
        </LinkButton>
        <SpotifyListenButton
          href={podcast.spotifyShowUrl}
          size="lg"
          iconOnly
        />
      </div>
    </div>
  );
}
