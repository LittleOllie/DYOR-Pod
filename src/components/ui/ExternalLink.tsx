import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

export function ExternalLink({
  children,
  className,
  href,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-brand-bright underline-offset-4 hover:underline focus-ring rounded-sm",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
