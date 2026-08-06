import { HeadingWithAccent } from "@/components/ui/ColorfulAccent";
import { cn } from "@/lib/utils/cn";

type MobileSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  className?: string;
  id?: string;
};

export function MobileSectionHeader({
  eyebrow,
  title,
  accent,
  description,
  className,
  id,
}: MobileSectionHeaderProps) {
  return (
    <header className={cn("mb-5 md:mb-8", className)}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand md:text-xs md:tracking-[0.2em]">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="mt-1.5 font-heading text-[1.75rem] font-bold leading-[1.12] text-text-primary md:mt-2 md:text-4xl md:leading-tight"
      >
        {accent ? <HeadingWithAccent title={title} accent={accent} /> : title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-[36rem] text-[15px] leading-[1.6] text-text-secondary md:mt-3 md:text-base md:leading-relaxed">
          {description}
        </p>
      ) : null}
    </header>
  );
}
