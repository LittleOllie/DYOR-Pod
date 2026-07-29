import { SpotifyIcon } from "@/components/brand/SpotifyIcon";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { cn } from "@/lib/utils/cn";

type SpotifySocialLinkProps = {
  href: string;
  className?: string;
};

/** Footer / hero social circle with full Spotify logo in brand green. */
export function SpotifySocialLink({ href, className }: SpotifySocialLinkProps) {
  return (
    <SocialIconLink
      href={href}
      label="Listen on Spotify"
      className={cn(
        "hover:border-[#1DB954] hover:bg-[#1DB954]/10",
        className,
      )}
    >
      <SpotifyIcon size={22} className="text-[#1DB954]" />
    </SocialIconLink>
  );
}
