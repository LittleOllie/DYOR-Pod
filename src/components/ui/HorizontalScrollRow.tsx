import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type HorizontalScrollRowProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  listClassName?: string;
  showHint?: boolean;
};

export function HorizontalScrollRow({
  children,
  ariaLabel,
  className,
  listClassName,
  showHint = true,
}: HorizontalScrollRowProps) {
  return (
    <div className={className}>
      <div
        className={cn("mobile-scroll-row", listClassName)}
        role="list"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {children}
      </div>
      {showHint && (
        <p className="mt-2 text-xs text-text-secondary/60 md:hidden">Swipe to explore</p>
      )}
    </div>
  );
}

export function HorizontalScrollItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="listitem" className={cn("mobile-scroll-item", className)}>
      {children}
    </div>
  );
}
