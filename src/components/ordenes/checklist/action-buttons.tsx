"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface ChecklistActionButtonsProps {
  onShowCategoria: () => void
  onShowTareaPadre: () => void
  onAddTarea: () => void
}

export const ChecklistActionButtons = memo(function ChecklistActionButtons({
  onShowCategoria,
  onShowTareaPadre,
  onAddTarea,
}: ChecklistActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onShowCategoria}
        className="flex-1 sm:flex-initial"
      >
        <Plus className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Categoría</span>
        <span className="sm:hidden">Cat.</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onShowTareaPadre}
        className="flex-1 sm:flex-initial"
      >
        <Plus className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Tarea Padre</span>
        <span className="sm:hidden">Padre</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddTarea}
        className="flex-1 sm:flex-initial"
      >
        <Plus className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Tarea Simple</span>
        <span className="sm:hidden">Simple</span>
      </Button>
    </div>
  )
})

