"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Homepage sections linked from main nav, in scroll order. */
const HOME_SECTIONS = ["schedule", "podcast", "library", "hosts", "game", "about", "newsletter"] as const;

const HEADER_OFFSET = 88;

function getSectionInView(): string {
  let current: string = HOME_SECTIONS[0];

  for (const id of HOME_SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;

    const top = el.getBoundingClientRect().top;
    if (top <= HEADER_OFFSET + 48) {
      current = id;
    }
  }

  return current;
}

export function useActiveNavSection(): string | null {
  const pathname = usePathname();
  const [scrollSection, setScrollSection] = useState<string>(HOME_SECTIONS[0]);

  useEffect(() => {
    if (pathname !== "/") return;

    const updateActiveSection = () => {
      setScrollSection(getSectionInView());
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
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
