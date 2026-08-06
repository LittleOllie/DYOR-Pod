import { ApplePodcastsIcon } from "@/components/brand/ApplePodcastsIcon";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { cn } from "@/lib/utils/cn";

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
        "hover:border-brand hover:bg-brand/10",
        className,
      )}
    >
      <ApplePodcastsIcon size={22} />
    </SocialIconLink>
  );
}
