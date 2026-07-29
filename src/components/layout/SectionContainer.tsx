import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionContainerProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  ariaLabelledby?: string;
};

export function SectionContainer({
  id,
  children,
  className,
  as: Tag = "section",
  ariaLabelledby,
}: SectionContainerProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn(
        "relative z-10 px-4 py-[var(--section-py)] md:px-6 md:py-[var(--section-py-lg)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[var(--content-width)]">{children}</div>
    </Tag>
  );
}
