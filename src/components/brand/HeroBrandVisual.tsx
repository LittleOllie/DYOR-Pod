import { RocketMark } from "@/components/brand/RocketMark";
import { cn } from "@/lib/utils/cn";

type HeroBrandVisualProps = {
  isLive?: boolean;
  className?: string;
};

/** Static brand visual — architecture ready for future animated logo state. */
export function HeroBrandVisual({ isLive = false, className }: HeroBrandVisualProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      aria-hidden="true"
    >
      <div
        className="orbital-ring absolute h-28 w-28 md:h-36 md:w-36"
        style={{ opacity: 0.35 }}
      />
      <div
        className="orbital-ring absolute h-40 w-40 border-gold/20 md:h-48 md:w-48"
        style={{ opacity: 0.25 }}
      />
      <div className="animate-float relative z-10">
        <RocketMark isLive={isLive} size={56} className="md:hidden" />
        <RocketMark isLive={isLive} size={80} className="hidden md:block" />
      </div>
    </div>
  );
}
