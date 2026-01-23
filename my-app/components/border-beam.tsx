"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BorderBeamProps {
  className?: string
  delay?: number
}

export function BorderBeam({
  className,
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -inset-[2px] rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm",
        className
      )}
      style={{
        background: `conic-gradient(from ${delay * 90}deg, transparent, oklch(0.6 0.2 140 / 0.3), oklch(0.5 0.18 140 / 0.3), transparent)`,
        animation: `border-beam 4s linear infinite`,
        animationDelay: `${delay}s`,
      } as React.CSSProperties}
    />
  )
}
