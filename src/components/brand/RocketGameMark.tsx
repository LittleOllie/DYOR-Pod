import { cn } from "@/lib/utils/cn";

type RocketGameMarkProps = {
  className?: string;
  size?: number;
  showFlame?: boolean;
};

/** Launcher / marketing rocket — rocket-game.png with exhaust flame */
export function RocketGameMark({
  className,
  size = 56,
  showFlame = true,
}: RocketGameMarkProps) {
  const height = Math.round(size * 1.15);
  const flameW = Math.round(size * 0.38);
  const flameH = Math.round(size * 0.42);
  const ringSize = Math.round(size * 1.55);
  const lift = Math.round(size * 0.1);

  return (
    <div
      className={cn("relative inline-flex animate-float items-center justify-center", className)}
      style={{ width: ringSize, height: ringSize }}
      aria-hidden="true"
    >
      <div
        className="orbital-ring absolute inset-0 m-auto motion-reduce:animate-none"
        style={{ width: ringSize, height: ringSize }}
      />

      <div
        className="relative z-10 flex flex-col items-center"
        style={{ width: size, transform: `translateY(-${lift}px)` }}
      >
        <img
          src="/brand/rocket-game.png"
          alt=""
          draggable={false}
          className="w-full object-contain drop-shadow-[0_0_12px_rgba(49,209,198,0.35)]"
          style={{ height }}
        />

        {showFlame && (
          <div
            className="pointer-events-none relative z-0 motion-reduce:animate-none"
            style={{ width: flameW, height: flameH, marginTop: -Math.round(flameH * 0.2) }}
          >
            <div
              className="absolute inset-x-0 bottom-0 animate-pulse rounded-full bg-brand-bright/50 blur-[2px] motion-reduce:animate-none"
              style={{ height: "88%" }}
            />
            <div
              className="absolute bottom-0 left-1/2 w-[55%] -translate-x-1/2 animate-pulse rounded-b-full bg-[#e5cf59]/65 blur-[1px] motion-reduce:animate-none"
              style={{ height: "72%", animationDelay: "0.12s" }}
            />
            <div
              className="absolute bottom-0 left-1/2 w-[30%] -translate-x-1/2 animate-pulse rounded-b-full bg-white/35 blur-[1px] motion-reduce:animate-none"
              style={{ height: "48%", animationDelay: "0.22s" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
