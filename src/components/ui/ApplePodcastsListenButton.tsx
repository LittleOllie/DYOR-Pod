import { ApplePodcastsIcon } from "@/components/brand/ApplePodcastsIcon";
import { cn } from "@/lib/utils/cn";

export const APPLE_PODCASTS_PURPLE = "#9933FF";
export const APPLE_PODCASTS_PURPLE_HOVER = "#a855f7";

type ApplePodcastsListenButtonProps = {
  href: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "min-h-[44px] px-4 text-sm gap-2",
  md: "min-h-[48px] px-5 text-base gap-2.5",
  lg: "min-h-[52px] px-6 text-base gap-2.5",
};

const iconSizes = { sm: 20, md: 22, lg: 24 };

export function ApplePodcastsListenButton({
  href,
  className,
  size = "md",
}: ApplePodcastsListenButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-medium)] font-semibold",
        "bg-[#9933FF] text-white transition-colors hover:bg-[#a855f7] focus-ring no-underline",
        sizes[size],
        "w-full sm:w-auto",
        className,
      )}
    >
      <ApplePodcastsIcon size={iconSizes[size]} />
      <span>Apple Podcasts</span>
    </a>
  );
}
