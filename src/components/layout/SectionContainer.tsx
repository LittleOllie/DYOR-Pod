import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionContainerProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  as?: "section" | "div";
  ariaLabelledby?: string;
  /** Desktop section band treatment — mobile unaffected */
  band?: "none" | "subtle" | "elevated" | "newsletter";
  /** When full, inner container spans the band without max-width cap */
  width?: "default" | "full";
};

const bandClasses: Record<NonNullable<SectionContainerProps["band"]>, string> = {
  none: "",
  subtle: "desktop-section-band desktop-section-band--subtle",
  elevated: "desktop-section-band desktop-section-band--elevated",
  newsletter: "desktop-section-band desktop-section-band--newsletter",
};

export function SectionContainer({
  id,
  children,
  className,
  innerClassName,
  as: Tag = "section",
  ariaLabelledby,
  band = "none",
  width = "default",
}: SectionContainerProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn(
        "relative z-10 py-[var(--section-py-mobile)] md:px-0 md:py-[clamp(4.5rem,8vw,8rem)]",
        bandClasses[band],
        className,
      )}
    >
      <div
        className={cn(
          "mobile-page-container desktop-container min-w-0 md:px-0",
          width === "full" && "md:max-w-none",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
