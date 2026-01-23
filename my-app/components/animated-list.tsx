"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedListProps {
  className?: string
  children: React.ReactNode
  delay?: number
}

export function AnimatedList({ 
  className, 
  children, 
  delay = 0 
}: AnimatedListProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (listRef.current) {
      observer.observe(listRef.current)
    }

    return () => {
      if (listRef.current) {
        observer.unobserve(listRef.current)
      }
    }
  }, [delay])

  return (
    <div
      ref={listRef}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8",
        className
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            style: {
              ...child.props.style,
              transitionDelay: `${index * 100}ms`,
            },
          } as any)
        }
        return child
      })}
    </div>
  )
}
