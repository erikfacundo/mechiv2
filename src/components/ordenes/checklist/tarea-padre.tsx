"use client"

import { memo } from "react"
import { TareaChecklist } from "@/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react"

interface TareaPadreProps {
  tarea: TareaChecklist
  subtareas: TareaChecklist[]
  isExpanded: boolean
  onToggleExpand: () => void
  onUpdate: (field: keyof TareaChecklist, value: any) => void
  onDelete: () => void
  onAddSubtarea: (nombre: string) => void
  renderSubtarea: (subtarea: TareaChecklist, index: number) => React.ReactNode
}

export const TareaPadre = memo(function TareaPadre({
  tarea,
  subtareas,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onAddSubtarea,
  renderSubtarea,
}: TareaPadreProps) {
  const handleAddSubtarea = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    const input = e.currentTarget.previousElementSibling as HTMLInputElement
    if (input?.value) {
      onAddSubtarea(input.value)
      input.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleExpand}
          className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0"
          aria-label={isExpanded ? "Contraer" : "Expandir"}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => onUpdate("completado", !tarea.completado)}
          className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0"
          aria-label={tarea.completado ? "Marcar como pendiente" : "Marcar como completada"}
        >
          {tarea.completado ? (
            <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-500" />
          ) : (
            <Square className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </button>
        <Input
          value={tarea.tarea}
          onChange={(e) => onUpdate("tarea", e.target.value)}
          className={`flex-1 text-sm ${tarea.completado ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
          placeholder="Tarea padre"
        />
        <Badge variant="outline" className="whitespace-nowrap text-xs flex-shrink-0">
          Padre
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="flex-shrink-0 p-1 h-8 w-8"
          aria-label="Eliminar tarea"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
        </Button>
      </div>
      {tarea.notas && (
        <Textarea
          value={tarea.notas || ""}
          onChange={(e) => onUpdate("notas", e.target.value)}
          placeholder="Notas (opcional)"
          rows={1}
          className="text-sm resize-none ml-6"
        />
      )}
      {isExpanded && (
        <div className="space-y-1.5">
          {subtareas.map((subtarea, index) => renderSubtarea(subtarea, index))}
          <div className="flex gap-1.5 pt-1 pl-6">
            <Input
              placeholder="Nueva subtarea..."
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  handleAddSubtarea(e)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubtarea}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

