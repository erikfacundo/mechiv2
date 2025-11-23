"use client"

import { useState, useEffect, useMemo } from "react"
import { TareaChecklist, PlantillaTarea } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePlantillasTareas } from "@/hooks/use-plantillas-tareas"
import { useToast } from "@/hooks/use-toast"

interface ChecklistManagerProps {
  checklist?: TareaChecklist[] // Hacer opcional para evitar errores
  onChecklistChange: (checklist: TareaChecklist[]) => void
  ordenId?: string
}

export function ChecklistManager({ checklist, onChecklistChange, ordenId }: ChecklistManagerProps) {
  const { plantillas, refetch: refetchPlantillas } = usePlantillasTareas()
  const { toast } = useToast()
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [selectedTareaPadre, setSelectedTareaPadre] = useState<string>("")
  const [expandedPadres, setExpandedPadres] = useState<Set<string>>(new Set())

  // Asegurar que checklist siempre sea un array usando useMemo para evitar recálculos
  const safeChecklist = useMemo(() => {
    if (!checklist || !Array.isArray(checklist)) {
      return []
    }
    return checklist
  }, [checklist])

  // Obtener tareas padre únicas del checklist
  const tareasPadre = useMemo(() => {
    return Array.from(new Set(safeChecklist.filter(t => !t.tareaPadre).map(t => t.tarea)))
  }, [safeChecklist])

  // Agrupar tareas por padre
  const tareasAgrupadas = useMemo(() => {
    return tareasPadre.map(padre => ({
      padre,
      tareas: safeChecklist.filter(t => t.tareaPadre === padre || (t.tarea === padre && !t.tareaPadre)),
    }))
  }, [tareasPadre, safeChecklist])

  const updateTarea = (index: number, field: keyof TareaChecklist, value: any) => {
    const updated = [...safeChecklist]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    
    // Si se marca como completado, agregar fecha
    if (field === 'completado' && value === true) {
      updated[index].fechaCompletitud = new Date()
    } else if (field === 'completado' && value === false) {
      updated[index].fechaCompletitud = undefined
    }
    
    onChecklistChange(updated)
  }

  const addTarea = () => {
    const nuevaTarea: TareaChecklist = {
      id: Date.now().toString(),
      tarea: "",
      completado: false,
      notas: "",
    }
    onChecklistChange([...safeChecklist, nuevaTarea])
  }

  const addTareaPadre = async () => {
    if (!selectedTareaPadre) {
      toast({
        title: "Error",
        description: "Debes seleccionar una tarea padre",
        variant: "destructive",
      })
      return
    }

    // Buscar o crear la plantilla padre
    const response = await fetch("/api/plantillas-tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        findOrCreate: true,
        nombre: selectedTareaPadre,
        esTareaPadre: true,
      }),
    })

    if (!response.ok) {
      toast({
        title: "Error",
        description: "Error al crear tarea padre",
        variant: "destructive",
      })
      return
    }

    const plantillaPadre = await response.json()

    // Crear la tarea padre en el checklist
    const nuevaTareaPadre: TareaChecklist = {
      id: Date.now().toString(),
      tarea: selectedTareaPadre,
      completado: false,
      notas: "",
    }

    onChecklistChange([...safeChecklist, nuevaTareaPadre])
    setSelectedTareaPadre("")
    setShowTaskSelector(false)
    await refetchPlantillas()
    
    toast({
      title: "Tarea padre agregada",
      description: "Ahora puedes agregar subtareas",
    })
  }

  const addSubtarea = async (tareaPadre: string, nombreSubtarea: string) => {
    if (!nombreSubtarea.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la subtarea es requerido",
        variant: "destructive",
      })
      return
    }

    // Buscar la plantilla padre
    const plantillaPadre = plantillas.find(p => p.nombre === tareaPadre && p.esTareaPadre)
    
    if (!plantillaPadre) {
      toast({
        title: "Error",
        description: "No se encontró la tarea padre",
        variant: "destructive",
      })
      return
    }

    // Buscar o crear la subtarea (sistema retroactivo)
    const response = await fetch("/api/plantillas-tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        findOrCreate: true,
        nombre: nombreSubtarea,
        tareaPadre: plantillaPadre.id,
        categoria: plantillaPadre.categoria,
      }),
    })

    if (!response.ok) {
      toast({
        title: "Error",
        description: "Error al crear subtarea",
        variant: "destructive",
      })
      return
    }

    const plantillaSubtarea = await response.json()

    // Crear la subtarea en el checklist
    const nuevaSubtarea: TareaChecklist = {
      id: Date.now().toString(),
      tarea: nombreSubtarea,
      tareaPadre: tareaPadre,
      completado: false,
      notas: "",
    }

    onChecklistChange([...safeChecklist, nuevaSubtarea])
    await refetchPlantillas()
    
    toast({
      title: "Subtarea creada",
      description: "La subtarea se guardó para futuros checklists",
    })
  }

  const removeTarea = (index: number) => {
    const updated = safeChecklist.filter((_, i) => i !== index)
    onChecklistChange(updated)
  }

  const toggleExpandPadre = (padre: string) => {
    const newExpanded = new Set(expandedPadres)
    if (newExpanded.has(padre)) {
      newExpanded.delete(padre)
    } else {
      newExpanded.add(padre)
    }
    setExpandedPadres(newExpanded)
  }

  // Obtener plantillas padre disponibles
  const plantillasPadre = plantillas.filter(p => p.esTareaPadre)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Checklist de Trabajo</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTaskSelector(!showTaskSelector)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Tarea Padre
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTarea}
          >
            <Plus className="h-4 w-4 mr-1" />
            Tarea Simple
          </Button>
        </div>
      </div>

      {showTaskSelector && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar o crear tarea padre</Label>
              <Select value={selectedTareaPadre} onValueChange={setSelectedTareaPadre}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tarea padre" />
                </SelectTrigger>
                <SelectContent>
                  {plantillasPadre.map((plantilla) => (
                    <SelectItem key={plantilla.id} value={plantilla.nombre}>
                      {plantilla.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = prompt("Nombre de la nueva tarea padre:")
                  if (input) {
                    setSelectedTareaPadre(input)
                  }
                }}
              >
                Crear Nueva
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={addTareaPadre}
                disabled={!selectedTareaPadre}
              >
                Agregar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTaskSelector(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {tareasAgrupadas.length > 0 ? (
          tareasAgrupadas.map((grupo) => {
            const tareaPadre = grupo.tareas.find(t => t.tarea === grupo.padre && !t.tareaPadre)
            const subtareas = grupo.tareas.filter(t => t.tareaPadre === grupo.padre)
            const isExpanded = expandedPadres.has(grupo.padre)
            const padreIndex = safeChecklist.findIndex(t => t.id === tareaPadre?.id)

            return (
              <Card key={grupo.padre}>
                <CardContent className="p-4 space-y-3">
                  {/* Tarea Padre */}
                  {tareaPadre && (
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpandPadre(grupo.padre)}
                        className="mt-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTarea(padreIndex, 'completado', !tareaPadre.completado)}
                        className="mt-1"
                      >
                        {tareaPadre.completado ? (
                          <CheckSquare className="h-5 w-5 text-green-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={tareaPadre.tarea}
                            onChange={(e) => updateTarea(padreIndex, 'tarea', e.target.value)}
                            className={tareaPadre.completado ? 'line-through text-gray-500' : ''}
                            placeholder="Tarea padre"
                          />
                          <Badge variant="outline">Padre</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTarea(padreIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <Textarea
                          value={tareaPadre.notas || ""}
                          onChange={(e) => updateTarea(padreIndex, 'notas', e.target.value)}
                          placeholder="Notas (opcional)"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {/* Subtareas */}
                  {isExpanded && (
                    <div className="ml-8 space-y-2 border-l-2 pl-4">
                      {subtareas.map((subtarea, subIndex) => {
                        const globalIndex = safeChecklist.findIndex(t => t.id === subtarea.id)
                        return (
                          <div key={subtarea.id} className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => updateTarea(globalIndex, 'completado', !subtarea.completado)}
                              className="mt-1"
                            >
                              {subtarea.completado ? (
                                <CheckSquare className="h-5 w-5 text-green-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Input
                                  value={subtarea.tarea}
                                  onChange={(e) => updateTarea(globalIndex, 'tarea', e.target.value)}
                                  className={subtarea.completado ? 'line-through text-gray-500' : ''}
                                  placeholder="Subtarea"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTarea(globalIndex)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                              <Textarea
                                value={subtarea.notas || ""}
                                onChange={(e) => updateTarea(globalIndex, 'notas', e.target.value)}
                                placeholder="Notas (opcional)"
                                rows={2}
                              />
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Botón para agregar subtarea */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nueva subtarea..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              addSubtarea(grupo.padre, e.currentTarget.value)
                              e.currentTarget.value = ""
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            if (input?.value) {
                              addSubtarea(grupo.padre, input.value)
                              input.value = ""
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay tareas en el checklist</p>
            <p className="text-sm">Agrega una tarea padre o una tarea simple</p>
          </div>
        )}

        {/* Tareas simples (sin padre) */}
        {safeChecklist
          .filter(t => !t.tareaPadre && !tareasPadre.includes(t.tarea))
          .map((tarea, index) => {
            const globalIndex = safeChecklist.findIndex(t => t.id === tarea.id)
            return (
              <Card key={tarea.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => updateTarea(globalIndex, 'completado', !tarea.completado)}
                      className="mt-1"
                    >
                      {tarea.completado ? (
                        <CheckSquare className="h-5 w-5 text-green-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={tarea.tarea}
                          onChange={(e) => updateTarea(globalIndex, 'tarea', e.target.value)}
                          className={tarea.completado ? 'line-through text-gray-500' : ''}
                          placeholder="Descripción de la tarea"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTarea(globalIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                      <Textarea
                        value={tarea.notas || ""}
                        onChange={(e) => updateTarea(globalIndex, 'notas', e.target.value)}
                        placeholder="Notas (opcional)"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}

