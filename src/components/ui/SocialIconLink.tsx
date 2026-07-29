import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SocialIconLinkProps = {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function SocialIconLink({
  href,
  label,
  children,
  className,
  onClick,
}: SocialIconLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring",
        className,
      )}
    >
      {children}
    </a>
  );
}
