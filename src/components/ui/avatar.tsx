"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  default: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

type AvatarSize = keyof typeof sizeClasses;

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: AvatarSize;
}

function Avatar({ src, alt, fallback, className, size = "default" }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const showImage = src && !imageError;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--muted)]",
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || ""}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-medium text-[var(--muted-foreground)]">
          {fallback || "?"}
        </span>
      )}
    </span>
  );
}

export { Avatar };
