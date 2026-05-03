"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, children: _children, style, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-bone rounded-lg overflow-hidden", className)}
      style={style}
      {...props}
      aria-hidden="true"
    />
  );
}

export { Skeleton };
