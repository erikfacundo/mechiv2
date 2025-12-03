"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TailAdminCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function TailAdminCard({ children, className, hover, onClick }: TailAdminCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-900",
        "shadow-sm transition-all",
        hover && "hover:shadow-md hover:border-primary/50 cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface TailAdminCardHeaderProps {
  children: ReactNode
  className?: string
}

export function TailAdminCardHeader({ children, className }: TailAdminCardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200 dark:border-gray-900", className)}>
      {children}
    </div>
  )
}

interface TailAdminCardContentProps {
  children: ReactNode
  className?: string
}

export function TailAdminCardContent({ children, className }: TailAdminCardContentProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  )
}

