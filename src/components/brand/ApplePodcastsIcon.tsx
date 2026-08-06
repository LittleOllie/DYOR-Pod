import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export const APPLE_PODCASTS_LOGO_SRC = "/brand/applepodcastlogo.png";

type ApplePodcastsIconProps = {
  size?: number;
  className?: string;
};

/** Apple Podcasts logo — clipped to a circle so the square white canvas stays tidy. */
export function ApplePodcastsIcon({ size = 22, className }: ApplePodcastsIconProps) {
  return (
    <span
      className={cn("inline-flex shrink-0 overflow-hidden rounded-full bg-white", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={APPLE_PODCASTS_LOGO_SRC}
        alt=""
        width={size}
        height={size}
        className="size-full object-cover"
        aria-hidden="true"
      />
    </span>
  );
}
