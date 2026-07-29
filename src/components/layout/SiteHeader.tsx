"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LinkButton } from "@/components/ui/Button";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { mainNav } from "@/content/navigation";
import { cn } from "@/lib/utils/cn";

type SiteHeaderProps = {
  isLive: boolean;
  ctaHref: string;
  nextEventLabel?: string;
};

export function SiteHeader({ isLive, ctaHref, nextEventLabel }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ctaLabel = isLive ? "Join Live" : "Next Space";
  const ctaVariant = isLive ? "live" : "primary";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-[var(--motion-base)]",
        "pt-[env(safe-area-inset-top)]",
        scrolled
          ? "border-b border-border bg-bg-primary/95 backdrop-blur-md"
          : "bg-bg-primary/80 backdrop-blur-sm md:bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[var(--content-width)] items-center justify-between gap-2 px-3 md:h-[var(--header-height)] md:gap-4 md:px-6">
        <BrandLogo variant="header" size="sm" className="shrink-0 [&_img]:max-h-9 md:[&_img]:max-h-14" />

        {nextEventLabel && (
          <p
            className={cn(
              "hidden min-w-0 truncate text-xs font-medium lg:block",
              isLive ? "text-live" : "text-text-secondary",
            )}
            aria-live="polite"
          >
            {isLive ? (
              <>
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-live align-middle animate-pulse-live" />
                Live Now
              </>
            ) : (
              <>Next: {nextEventLabel}</>
            )}
          </p>
        )}

        <nav className="hidden md:block" aria-label="Main">
          <ul className="flex items-center gap-0.5">
            {mainNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-brand-bright focus-ring"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 md:gap-3">
          <LinkButton
            href={ctaHref}
            variant={ctaVariant}
            size="sm"
            className="hidden min-h-[44px] md:inline-flex"
            external={ctaHref.startsWith("http")}
          >
            {ctaLabel}
          </LinkButton>
          <MobileNavigation
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
            ctaVariant={ctaVariant}
          />
        </div>
      </div>
    </header>
  );
}
