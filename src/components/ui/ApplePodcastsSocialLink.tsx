import { Apple } from "lucide-react";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { cn } from "@/lib/utils/cn";

export const APPLE_PODCASTS_PURPLE = "#9933CC";

type ApplePodcastsSocialLinkProps = {
  href: string;
  className?: string;
};

/** Hero / footer social circle with Apple Podcasts branding. */
export function ApplePodcastsSocialLink({ href, className }: ApplePodcastsSocialLinkProps) {
  return (
    <SocialIconLink
      href={href}
      label="Listen on Apple Podcasts"
      className={cn(
        "hover:border-[#9933CC] hover:bg-[#9933CC]/10 hover:text-[#9933CC]",
        className,
      )}
    >
      <Apple size={22} strokeWidth={2} aria-hidden="true" />
    </SocialIconLink>
  );
}
