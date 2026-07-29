"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { mainNav } from "@/content/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type MobileNavigationProps = {
  ctaLabel: string;
  ctaHref: string;
  ctaVariant: "primary" | "live";
};

export function MobileNavigation({ ctaLabel, ctaHref, ctaVariant }: MobileNavigationProps) {
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
            className="fixed inset-0 z-40 bg-bg-primary/90 backdrop-blur-sm"
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
              "fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl",
              "border-t border-border bg-bg-secondary px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-soft",
            )}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="flex min-h-[52px] items-center rounded-lg px-4 text-lg font-medium text-text-primary active:bg-surface focus-ring"
                      onClick={close}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4 border-t border-border pt-4">
              <LinkButton
                href={ctaHref}
                variant={ctaVariant}
                size="lg"
                className="min-h-[52px] w-full text-base"
                external={ctaHref.startsWith("http")}
                onClick={close}
              >
                {ctaLabel}
              </LinkButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
