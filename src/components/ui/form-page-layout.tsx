"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FormPageLayoutProps {
  title: string
  description?: string
  backUrl: string
  children: ReactNode
  className?: string
}

export function FormPageLayout({ 
  title, 
  description, 
  backUrl, 
  children, 
  className 
}: FormPageLayoutProps) {
  const router = useRouter()

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push(backUrl)}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-900 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

