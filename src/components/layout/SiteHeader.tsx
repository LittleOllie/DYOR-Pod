"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LinkButton } from "@/components/ui/Button";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { mainNav } from "@/content/navigation";
import { isNavItemActive, useActiveNavSection } from "@/lib/navigation/useActiveNavSection";
import { cn } from "@/lib/utils/cn";

type SiteHeaderProps = {
  isLive: boolean;
  ctaHref: string;
  nextEventLabel?: string;
};

export function SiteHeader({ isLive, ctaHref, nextEventLabel }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const activeSection = useActiveNavSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ctaLabel = isLive ? "Join Live" : "Next Space";
  const ctaVariant = isLive ? "live" : "primary";

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-50 w-full max-w-full transition-[background-color,border-color,backdrop-filter] duration-[var(--motion-base)] motion-reduce:transition-none",
        "pt-[env(safe-area-inset-top)]",
        scrolled
          ? "border-b border-border/80 bg-bg-primary/92 backdrop-blur-[14px] md:border-border md:bg-bg-primary/95 md:backdrop-blur-md"
          : "border-b border-transparent bg-transparent md:bg-transparent",
      )}
    >
      <div className="mobile-page-container desktop-container site-header__inner flex h-[3.75rem] min-w-0 items-center justify-between gap-2 md:h-[var(--header-height)] md:gap-4">
        <BrandLogo variant="header" size="sm" className="site-logo shrink-0 [&_img]:max-h-9 md:[&_img]:max-h-14" />

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex">
          {nextEventLabel && (
            <p
              className={cn(
                "hidden min-w-0 max-w-[14rem] truncate text-xs font-medium lg:block",
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

          <nav className="min-w-0 shrink" aria-label="Main">
            <ul className="flex items-center gap-0.5">
              {mainNav.map((item) => {
                const isActive = isNavItemActive(item.href, activeSection, pathname);

                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-[var(--motion-fast)] focus-ring",
                        isActive
                          ? "bg-brand/20 font-semibold text-brand-bright shadow-[inset_0_-2px_0_0_var(--color-brand-bright)]"
                          : "text-text-secondary hover:bg-brand/10 hover:text-brand-bright",
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
          <LinkButton
            href={ctaHref}
            variant={ctaVariant}
            size="sm"
            className="hidden min-h-[44px] md:inline-flex"
            external={ctaHref.startsWith("http")}
          >
            {ctaLabel}
          </LinkButton>
          <MobileNavigation activeSection={activeSection} />
        </div>
      </div>
    </header>
  );
}
