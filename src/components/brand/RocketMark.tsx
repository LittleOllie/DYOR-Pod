import { cn } from "@/lib/utils/cn";

type RocketMarkProps = {
  className?: string;
  isLive?: boolean;
  size?: number;
};

export function RocketMark({ className, isLive = false, size = 120 }: RocketMarkProps) {
  return (
    <div
      className={cn("relative inline-flex animate-float", className)}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 120 144"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="60"
          cy="130"
          rx="24"
          ry="6"
          fill="#13A9A6"
          opacity={isLive ? 0.5 : 0.2}
          className={isLive ? "animate-pulse-live" : undefined}
        />
        <path
          d="M60 20 C45 50 40 80 42 100 L50 110 L60 105 L70 110 L78 100 C80 80 75 50 60 20Z"
          fill="#31D1C6"
          stroke="#13A9A6"
          strokeWidth="1.5"
        />
        <circle cx="60" cy="55" r="8" fill="#061821" stroke="#E5CF59" strokeWidth="2" />
        <path
          d="M42 100 L30 120 L42 112 M78 100 L90 120 L78 112"
          fill="#13A9A6"
          stroke="#13A9A6"
          strokeWidth="1"
        />
        <path
          d="M54 110 L60 130 L66 110"
          fill={isLive ? "#E85D4C" : "#E5CF59"}
          opacity={isLive ? 0.9 : 0.7}
          className={isLive ? "animate-pulse-live" : undefined}
        />
      </svg>
      <div
        className="orbital-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 1.6, height: size * 1.6 }}
      />
    </div>
  );
}
