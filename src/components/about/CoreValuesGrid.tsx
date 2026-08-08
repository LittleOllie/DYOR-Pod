import Image from "next/image";
import { coreValues } from "@/content/about";
import {
  COUNTDOWN_LETTER_CANVAS,
  gameLetterAssets,
  type GameLetterId,
} from "@/content/brandLogo";
import { cn } from "@/lib/utils/cn";

type CoreValuesGridProps = {
  className?: string;
  /** Accessible label for the values list region */
  ariaLabel?: string;
};

function CoreValueCard({
  letterId,
  title,
  description,
}: {
  letterId: GameLetterId;
  title: string;
  description: string;
}) {
  return (
    <li className="group relative flex min-h-[11.5rem] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border/70 bg-gradient-to-br from-surface/90 via-surface/55 to-bg-elevated/35 p-6 shadow-[var(--shadow-soft)] transition-[transform,border-color,box-shadow] duration-[var(--motion-base)] hover:-translate-y-1 hover:border-brand/35 hover:shadow-[var(--shadow-brand)] lg:min-h-[12.5rem] lg:p-7">
      <div
        className="value-card-watermark pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <Image
          src={gameLetterAssets[letterId]}
          alt=""
          width={COUNTDOWN_LETTER_CANVAS.width}
          height={COUNTDOWN_LETTER_CANVAS.height}
          className="value-card-watermark__image logo-layer-blend"
          sizes="(max-width: 767px) 45vw, 280px"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent opacity-70 transition-opacity duration-[var(--motion-base)] group-hover:opacity-100"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 z-10 h-24 w-24 rounded-full bg-brand/10 blur-2xl transition-opacity duration-[var(--motion-base)] group-hover:bg-brand/15"
        aria-hidden="true"
      />

      <h3 className="relative z-10 font-heading text-xl font-bold leading-snug text-text-primary lg:text-[1.35rem]">
        {title}
      </h3>
      <p className="relative z-10 mt-3 flex-1 text-[15px] leading-relaxed text-text-secondary lg:text-base lg:leading-relaxed">
        {description}
      </p>
    </li>
  );
}

export function CoreValuesGrid({ className, ariaLabel = "Our values" }: CoreValuesGridProps) {
  return (
    <div role="region" aria-label={ariaLabel} className={className}>
      <ul
        className={cn(
          "grid gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6 xl:grid-cols-4",
        )}
      >
        {coreValues.map((value) => (
          <CoreValueCard
            key={value.title}
            letterId={value.letterId}
            title={value.title}
            description={value.description}
          />
        ))}
      </ul>
    </div>
  );
}
