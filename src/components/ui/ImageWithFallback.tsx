"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain";
};

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
  objectFit = "cover",
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-raised text-brand",
          className,
        )}
        style={{ aspectRatio: `${width}/${height}` }}
        role="img"
        aria-label={alt}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <path
            d="M24 14 L24 28 M24 28 L18 34 M24 28 L30 34"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(objectFit === "contain" ? "object-contain" : "object-cover", className)}
      priority={priority}
      sizes={sizes}
      onError={() => setError(true)}
    />
  );
}
