"use client"

import { useState, useCallback, useMemo } from "react"
import { TareaChecklist } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useChecklistOperations } from "@/hooks/use-checklist-operations"
import { ChecklistActionButtons } from "./checklist/action-buttons"
import { CategoriaSelector } from "./checklist/categoria-selector"
import { TareaPadreSelector } from "./checklist/tarea-padre-selector"
import { TareaPadre } from "./checklist/tarea-padre"
import { TareaItem } from "./checklist/tarea-item"

interface ChecklistManagerProps {
  checklist?: TareaChecklist[]
  onChecklistChange: (checklist: TareaChecklist[]) => void
  ordenId?: string
}

export function ChecklistManager({ checklist, onChecklistChange, ordenId }: ChecklistManagerProps) {
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [showCategoriaSelector, setShowCategoriaSelector] = useState(false)
  const [expandedPadres, setExpandedPadres] = useState<Set<string>>(new Set())

  const {
    safeChecklist,
    tareasPadre,
    tareasAgrupadas,
    updateTarea,
    removeTarea,
    addTarea,
    toast,
  } = useChecklistOperations({ checklist: checklist || [], onChecklistChange })

  const toggleExpandPadre = useCallback((padre: string) => {
    setExpandedPadres((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(padre)) {
        newSet.delete(padre)
      } else {
        newSet.add(padre)
      }
      return newSet
    })
  }, [])

  const tareasSimples = useMemo(
    () => safeChecklist.filter((t) => !t.tareaPadre && !tareasPadre.includes(t.tarea)),
    [safeChecklist, tareasPadre]
  )

  const hasTareas = tareasAgrupadas.length > 0 || tareasSimples.length > 0

  return (
    <div className="space-y-2">
      <ChecklistActionButtons
        onShowCategoria={() => {
          setShowCategoriaSelector(!showCategoriaSelector)
          setShowTaskSelector(false)
        }}
        onShowTareaPadre={() => {
          setShowTaskSelector(!showTaskSelector)
          setShowCategoriaSelector(false)
        }}
        onAddTarea={addTarea}
      />

      {showCategoriaSelector && (
        <CategoriaSelector
          onClose={() => {
            setShowCategoriaSelector(false)
          }}
          onAdd={(nuevoChecklist: TareaChecklist[]) => {
            onChecklistChange(nuevoChecklist)
            setShowCategoriaSelector(false)
          }}
          existingChecklist={safeChecklist}
        />
      )}

      {showTaskSelector && (
        <TareaPadreSelector
          onClose={() => setShowTaskSelector(false)}
          onAdd={(nuevaTarea: TareaChecklist) => {
            onChecklistChange([...safeChecklist, nuevaTarea])
            setShowTaskSelector(false)
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {tareasAgrupadas.map((grupo) => {
          const tareaPadre = grupo.tareas.find((t) => t.tarea === grupo.padre && !t.tareaPadre)
          const subtareas = grupo.tareas.filter((t) => t.tareaPadre === grupo.padre)
          const isExpanded = expandedPadres.has(grupo.padre)
          const padreIndex = safeChecklist.findIndex((t) => t.id === tareaPadre?.id)

          if (!tareaPadre) return null

          return (
            <Card key={grupo.padre}>
              <CardContent className="p-3 space-y-2">
                <TareaPadre
                  tarea={tareaPadre}
                  subtareas={subtareas}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleExpandPadre(grupo.padre)}
                  onUpdate={(field, value) => updateTarea(padreIndex, field, value)}
                  onDelete={() => removeTarea(padreIndex)}
                  onAddSubtarea={async (nombre) => {
                    const nuevaSubtarea: TareaChecklist = {
                      id: Date.now().toString(),
                      tarea: nombre,
                      tareaPadre: grupo.padre,
                      completado: false,
                      notas: "",
                    }
                    onChecklistChange([...safeChecklist, nuevaSubtarea])
                  }}
                  renderSubtarea={(subtarea, subIndex) => {
                    const globalIndex = safeChecklist.findIndex((t) => t.id === subtarea.id)
                    return (
                      <TareaItem
                        key={subtarea.id}
                        tarea={subtarea}
                        onUpdate={(field, value) => updateTarea(globalIndex, field, value)}
                        onDelete={() => removeTarea(globalIndex)}
                        indent
                      />
                    )
                  }}
                />
              </CardContent>
            </Card>
          )
        })}

        {tareasSimples.map((tarea) => {
          const globalIndex = safeChecklist.findIndex((t) => t.id === tarea.id)
          return (
            <Card key={tarea.id}>
              <CardContent className="p-3 space-y-1.5">
                <TareaItem
                  tarea={tarea}
                  onUpdate={(field, value) => updateTarea(globalIndex, field, value)}
                  onDelete={() => removeTarea(globalIndex)}
                  showNotas
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!hasTareas && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <p>No hay tareas en el checklist</p>
          <p className="text-xs mt-1">Agrega una tarea padre o una tarea simple</p>
        </div>
      )}
    </div>
  )
}
