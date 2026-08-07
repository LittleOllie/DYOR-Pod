"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Homepage sections linked from main nav, in page order (deepest anchors last). */
export const HOME_SECTIONS = [
  "schedule",
  "podcast",
  "library",
  "hosts",
  "game",
  "about",
  "newsletter",
] as const;

const HEADER_OFFSET = 96;

function getSectionTop(element: HTMLElement): number {
  return element.getBoundingClientRect().top + window.scrollY;
}

function getSectionInView(): string | null {
  const scrollPosition = window.scrollY + HEADER_OFFSET + 12;
  let active: string | null = null;

  for (const id of HOME_SECTIONS) {
    const element = document.getElementById(id);
    if (!element) continue;

    if (scrollPosition >= getSectionTop(element)) {
      active = id;
    }
  }

  return active;
}

export function useActiveNavSection(): string | null {
  const pathname = usePathname();
  const [scrollSection, setScrollSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;

    let frame = 0;

    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setScrollSection(getSectionInView());
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    window.addEventListener("hashchange", updateActiveSection);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [pathname]);

  if (pathname === "/contact") return "contact";
  if (pathname !== "/") return null;
  return scrollSection;
}

export function isNavItemActive(
  href: string,
  activeSection: string | null,
  pathname: string,
): boolean {
  if (href.startsWith("/#")) {
    const sectionId = href.slice(2);
    return pathname === "/" && activeSection === sectionId;
  }

  if (href === "/contact") {
    return pathname === "/contact";
  }

  return pathname === href;
}
