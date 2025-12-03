import { useCallback, useMemo } from "react"
import { TareaChecklist } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface UseChecklistOperationsProps {
  checklist: TareaChecklist[]
  onChecklistChange: (checklist: TareaChecklist[]) => void
}

export function useChecklistOperations({
  checklist,
  onChecklistChange,
}: UseChecklistOperationsProps) {
  const { toast } = useToast()

  const safeChecklist = useMemo(() => {
    return Array.isArray(checklist) ? checklist : []
  }, [checklist])

  const updateTarea = useCallback(
    (index: number, field: keyof TareaChecklist, value: any) => {
      const updated = [...safeChecklist]
      const tareaActual = updated[index]

      updated[index] = {
        ...updated[index],
        [field]: value,
      }

      if (field === "completado") {
        if (value === true) {
          updated[index].fechaCompletitud = new Date()

          if (!tareaActual.tareaPadre) {
            const nombreTareaPadre = tareaActual.tarea
            updated.forEach((tarea, idx) => {
              if (tarea.tareaPadre === nombreTareaPadre && !tarea.completado) {
                updated[idx] = {
                  ...tarea,
                  completado: true,
                  fechaCompletitud: new Date(),
                }
              }
            })
          }
        } else {
          updated[index].fechaCompletitud = undefined

          if (!tareaActual.tareaPadre) {
            const nombreTareaPadre = tareaActual.tarea
            updated.forEach((tarea, idx) => {
              if (tarea.tareaPadre === nombreTareaPadre && tarea.completado) {
                updated[idx] = {
                  ...tarea,
                  completado: false,
                  fechaCompletitud: undefined,
                }
              }
            })
          }
        }
      }

      onChecklistChange(updated)
    },
    [safeChecklist, onChecklistChange]
  )

  const removeTarea = useCallback(
    (index: number) => {
      const updated = safeChecklist.filter((_, i) => i !== index)
      onChecklistChange(updated)
    },
    [safeChecklist, onChecklistChange]
  )

  const addTarea = useCallback(() => {
    const nuevaTarea: TareaChecklist = {
      id: Date.now().toString(),
      tarea: "",
      completado: false,
      notas: "",
    }
    onChecklistChange([...safeChecklist, nuevaTarea])
  }, [safeChecklist, onChecklistChange])

  const tareasPadre = useMemo(() => {
    return Array.from(new Set(safeChecklist.filter((t) => !t.tareaPadre).map((t) => t.tarea)))
  }, [safeChecklist])

  const tareasAgrupadas = useMemo(() => {
    return tareasPadre.map((padre) => ({
      padre,
      tareas: safeChecklist.filter(
        (t) => t.tareaPadre === padre || (t.tarea === padre && !t.tareaPadre)
      ),
    }))
  }, [tareasPadre, safeChecklist])

  return {
    safeChecklist,
    tareasPadre,
    tareasAgrupadas,
    updateTarea,
    removeTarea,
    addTarea,
    toast,
  }
}

