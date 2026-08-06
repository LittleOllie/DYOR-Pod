import { cn } from "@/lib/utils/cn";

type ColorfulAccentProps = {
  children: string;
  className?: string;
};

/**
 * Smooth teal → cyan → sky gradient across accent words (not discrete per-letter colors).
 */
export function ColorfulAccent({ children, className }: ColorfulAccentProps) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent",
        "bg-[linear-gradient(100deg,#13a9a6_0%,#22c4bd_28%,#31d1c6_52%,#4ecde8_76%,#7dd3fc_100%)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

type HeadingWithAccentProps = {
  title: string;
  accent?: string;
};

/** Splits a heading so the accent substring renders in a blended teal/blue gradient. */
export function HeadingWithAccent({ title, accent }: HeadingWithAccentProps) {
  if (!accent) {
    return <>{title}</>;
  }

  const index = title.indexOf(accent);
  if (index === -1) {
    return <>{title}</>;
  }

  const before = title.slice(0, index);
  const after = title.slice(index + accent.length);

  return (
    <>
      {before}
      <ColorfulAccent>{accent}</ColorfulAccent>
      {after}
    </>
  );
}
