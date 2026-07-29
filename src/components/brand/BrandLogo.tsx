import Image from "next/image";
import Link from "next/link";
import { headerLogoSrc, logoFinalSrc } from "@/content/brandLogo";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  /** Header uses the compact owner logo; footer/default uses the full mark. */
  variant?: "header" | "default";
};

const sizes = {
  sm: { width: 96, height: 64 },
  md: { width: 120, height: 80 },
  lg: { width: 168, height: 112 },
};

export function BrandLogo({
  className,
  showText = false,
  size = "md",
  variant = "default",
}: BrandLogoProps) {
  const s = sizes[size];
  const src = variant === "header" ? headerLogoSrc : logoFinalSrc;

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 focus-ring rounded-md", className)}
      aria-label="DYOR — Do Your Own Research, home"
    >
      <Image
        src={src}
        alt="DYOR"
        width={s.width}
        height={s.height}
        className="h-auto w-auto object-contain logo-layer-blend"
        style={{ maxHeight: s.height, maxWidth: s.width }}
        priority={variant === "header"}
      />
      {showText && (
        <span className="font-heading text-xl font-bold tracking-tight text-text-primary">
          DYOR
        </span>
      )}
    </Link>
  );
}
