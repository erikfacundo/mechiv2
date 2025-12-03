"use client"

import { memo } from "react"
import { TareaChecklist } from "@/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckSquare, Square, Trash2 } from "lucide-react"

interface TareaItemProps {
  tarea: TareaChecklist
  onUpdate: (field: keyof TareaChecklist, value: any) => void
  onDelete: () => void
  showNotas?: boolean
  indent?: boolean
}

export const TareaItem = memo(function TareaItem({
  tarea,
  onUpdate,
  onDelete,
  showNotas = false,
  indent = false,
}: TareaItemProps) {
  return (
    <div className="space-y-1">
      <div className={`flex items-center gap-1.5 ${indent ? "pl-6" : ""}`}>
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
          placeholder="Descripción de la tarea"
        />
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
      {(showNotas || tarea.notas) && (
        <Textarea
          value={tarea.notas || ""}
          onChange={(e) => onUpdate("notas", e.target.value)}
          placeholder="Notas (opcional)"
          rows={1}
          className="text-sm resize-none ml-6"
        />
      )}
    </div>
  )
})

