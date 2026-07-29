import { SpotifyIcon } from "@/components/brand/SpotifyIcon";
import { cn } from "@/lib/utils/cn";

type SpotifyListenButtonProps = {
  href: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Icon-only for compact mobile bars */
  iconOnly?: boolean;
  onClick?: () => void;
};

const sizes = {
  sm: "min-h-[44px] px-4 text-sm gap-2",
  md: "min-h-[48px] px-5 text-base gap-2.5",
  lg: "min-h-[52px] px-6 text-base gap-2.5",
};

const iconSizes = { sm: 20, md: 22, lg: 24 };

export function SpotifyListenButton({
  href,
  className,
  size = "md",
  iconOnly = false,
  onClick,
}: SpotifyListenButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={iconOnly ? "Listen on Spotify" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-medium)] font-semibold",
        "bg-[#1DB954] text-[#121212] transition-colors hover:bg-[#1ed760] focus-ring no-underline",
        iconOnly ? "min-h-[52px] w-[52px] shrink-0 px-0" : sizes[size],
        !iconOnly && "w-full sm:w-auto",
        className,
      )}
    >
      <SpotifyIcon size={iconSizes[size]} className="text-[#121212]" />
      {!iconOnly && <span>Listen on Spotify</span>}
    </a>
  );
}
