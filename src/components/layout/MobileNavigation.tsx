"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { mobileNav } from "@/content/navigation";
import { footerNav } from "@/content/navigation";
import { site } from "@/content/site";
import { isNavItemActive } from "@/lib/navigation/useActiveNavSection";
import { ApplePodcastsSocialLink } from "@/components/ui/ApplePodcastsSocialLink";
import { SpotifySocialLink } from "@/components/ui/SpotifySocialLink";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type MobileNavigationProps = {
  activeSection: string | null;
};

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function MobileNavigation({ activeSection }: MobileNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text-primary focus-ring"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-bg-primary/92 backdrop-blur-sm motion-reduce:backdrop-blur-none"
            aria-hidden="true"
            onClick={close}
          />
          <div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className={cn(
              "fixed inset-0 z-50 flex flex-col bg-bg-secondary/98 backdrop-blur-xl motion-reduce:backdrop-blur-none",
              "px-[var(--mobile-page-padding)] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]",
            )}
          >
            <div className="flex items-center justify-end py-2">
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-text-primary focus-ring"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
              <ul className="space-y-1">
                {mobileNav.map((item) => {
                  const isActive = isNavItemActive(item.href, activeSection, pathname);

                  return (
                    <li key={`${item.href}-${item.label}`}>
                      <a
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-[52px] items-center rounded-lg px-3 text-xl font-medium transition-colors focus-ring",
                          isActive
                            ? "bg-brand/15 font-semibold text-brand-bright"
                            : "text-text-primary active:text-brand-bright",
                        )}
                        onClick={close}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6 border-t border-border/70 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary/70">
                Follow DYOR
              </p>
              <div className="mt-3 flex gap-2">
                {site.social.x && (
                  <SocialIconLink href={site.social.x} label="Follow DYOR on X">
                    <XIcon />
                  </SocialIconLink>
                )}
                {site.social.spotify && <SpotifySocialLink href={site.social.spotify} />}
                {site.social.applePodcasts && (
                  <ApplePodcastsSocialLink href={site.social.applePodcasts} />
                )}
              </div>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary/80">
                {footerNav.slice(-3).map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="hover:text-brand-bright focus-ring" onClick={close}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
