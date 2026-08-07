import { HeadingWithAccent } from "@/components/ui/ColorfulAccent";
import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  /** Substring of title to render in per-letter teal/blue accent colors */
  accent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 md:mb-10",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand md:text-sm">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="font-heading text-2xl font-bold tracking-tight text-text-primary md:text-4xl md:leading-[1.08] lg:text-[2.75rem] xl:text-5xl"
      >
        <HeadingWithAccent title={title} accent={accent} />
      </h2>
      {description && (
        <p
          className={cn(
            "prose-width mt-3 text-sm leading-relaxed text-text-secondary md:mt-3 md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
