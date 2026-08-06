import { ApplePodcastsIcon } from "@/components/brand/ApplePodcastsIcon";
import { SpotifyIcon } from "@/components/brand/SpotifyIcon";
import { cn } from "@/lib/utils/cn";

type PodcastPlatformButtonsProps = {
  spotifyUrl: string;
  appleUrl?: string;
  className?: string;
};

/** Paired Spotify + Apple Podcasts CTAs — matched sizing, brand colors, shared with hero button scale. */
export function PodcastPlatformButtons({
  spotifyUrl,
  appleUrl,
  className,
}: PodcastPlatformButtonsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 md:gap-4", className)}>
      <a
        href={spotifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-[var(--radius-medium)] px-6 font-semibold transition-colors focus-ring no-underline",
          "bg-[#1DB954] text-[#121212] hover:bg-[#1ed760]",
          "md:min-h-[54px] md:px-8 md:text-base",
        )}
      >
        <SpotifyIcon size={22} className="text-[#121212]" />
        <span>Spotify</span>
      </a>
      {appleUrl && (
        <a
          href={appleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-[var(--radius-medium)] px-6 font-semibold transition-colors focus-ring no-underline",
            "bg-[#9933FF] text-white hover:bg-[#a855f7]",
            "md:min-h-[54px] md:px-8 md:text-base",
          )}
        >
          <ApplePodcastsIcon size={22} />
          <span>Apple Podcasts</span>
        </a>
      )}
    </div>
  );
}
