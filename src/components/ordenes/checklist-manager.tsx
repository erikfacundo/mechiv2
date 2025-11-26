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
import { useCategorias } from "@/hooks/use-categorias"
import { useToast } from "@/hooks/use-toast"
import { Categoria } from "@/types"

interface ChecklistManagerProps {
  checklist?: TareaChecklist[] // Hacer opcional para evitar errores
  onChecklistChange: (checklist: TareaChecklist[]) => void
  ordenId?: string
}

export function ChecklistManager({ checklist, onChecklistChange, ordenId }: ChecklistManagerProps) {
  const { plantillas, refetch: refetchPlantillas } = usePlantillasTareas()
  const { categorias } = useCategorias()
  const { toast } = useToast()
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [showCategoriaSelector, setShowCategoriaSelector] = useState(false)
  const [selectedTareaPadre, setSelectedTareaPadre] = useState<string>("")
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("")
  const [selectedSubcategorias, setSelectedSubcategorias] = useState<Set<string>>(new Set())
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
    const tareaActual = updated[index]
    
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    
    if (field === 'completado') {
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
    
    refetchPlantillas().catch(() => {})
    
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
    
    refetchPlantillas().catch(() => {})
    
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
  
  // Obtener categorías activas
  const categoriasActivas = categorias.filter(c => c.activa)

  // Agregar categoría con subcategorías seleccionadas
  const addCategoria = () => {
    if (!selectedCategoriaId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una categoría",
        variant: "destructive",
      })
      return
    }

    const categoria = categoriasActivas.find(c => c.id === selectedCategoriaId)
    if (!categoria) return

    // Verificar si la categoría ya está en el checklist
    const categoriaExiste = safeChecklist.some(t => t.tarea === categoria.nombre && !t.tareaPadre)
    if (categoriaExiste) {
      toast({
        title: "Error",
        description: "Esta categoría ya está en el checklist",
        variant: "destructive",
      })
      return
    }

    // Crear la tarea padre (categoría)
    const tareaPadre: TareaChecklist = {
      id: `categoria-${categoria.id}-${Date.now()}`,
      tarea: categoria.nombre,
      completado: false,
      notas: categoria.descripcion || '',
    }

    // Crear las subtareas (subcategorías seleccionadas)
    const subcategoriasSeleccionadas = categoria.subcategorias?.filter(sub => selectedSubcategorias.has(sub)) || []
    const subtareas: TareaChecklist[] = subcategoriasSeleccionadas.map((subcategoria, index) => ({
      id: `subcategoria-${categoria.id}-${index}-${Date.now()}`,
      tarea: subcategoria,
      tareaPadre: categoria.nombre,
      completado: false,
      notas: '',
    }))

    // Agregar al checklist
    const nuevoChecklist = [...safeChecklist, tareaPadre, ...subtareas]
    onChecklistChange(nuevoChecklist)

    // Limpiar selección
    setSelectedCategoriaId("")
    setSelectedSubcategorias(new Set())
    setShowCategoriaSelector(false)

    toast({
      title: "Categoría agregada",
      description: `Se agregó "${categoria.nombre}" con ${subcategoriasSeleccionadas.length} subcategoría${subcategoriasSeleccionadas.length !== 1 ? 's' : ''}`,
    })
  }

  const toggleSubcategoria = (subcategoria: string) => {
    const newSet = new Set(selectedSubcategorias)
    if (newSet.has(subcategoria)) {
      newSet.delete(subcategoria)
    } else {
      newSet.add(subcategoria)
    }
    setSelectedSubcategorias(newSet)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Label className="text-base font-semibold">Checklist de Trabajo</Label>
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowCategoriaSelector(!showCategoriaSelector)
              setShowTaskSelector(false)
            }}
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
            onClick={() => {
              setShowTaskSelector(!showTaskSelector)
              setShowCategoriaSelector(false)
            }}
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
            onClick={addTarea}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Tarea Simple</span>
            <span className="sm:hidden">Simple</span>
          </Button>
        </div>
      </div>

      {showCategoriaSelector && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Categoría</Label>
              <Select value={selectedCategoriaId} onValueChange={(value) => {
                setSelectedCategoriaId(value)
                setSelectedSubcategorias(new Set())
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {categoriasActivas.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{categoria.nombre}</span>
                        {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {categoria.subcategorias.length} subcat.
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategoriaId && (() => {
              const categoria = categoriasActivas.find(c => c.id === selectedCategoriaId)
              if (!categoria || !categoria.subcategorias || categoria.subcategorias.length === 0) {
                return null
              }

              return (
                <div className="space-y-2">
                  <Label>Seleccionar Subcategorías (opcional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Selecciona las subcategorías que deseas incluir. Puedes seleccionar todas, algunas o ninguna.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                    {categoria.subcategorias.map((subcategoria, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubcategorias.has(subcategoria)}
                          onChange={() => toggleSubcategoria(subcategoria)}
                          className="rounded"
                        />
                        <span className="text-sm">{subcategoria}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const todas = new Set(categoria.subcategorias || [])
                        setSelectedSubcategorias(todas)
                      }}
                    >
                      Seleccionar todas
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSubcategorias(new Set())}
                    >
                      Deseleccionar todas
                    </Button>
                  </div>
                </div>
              )
            })()}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                size="sm"
                onClick={addCategoria}
                disabled={!selectedCategoriaId}
                className="flex-1 sm:flex-initial"
              >
                Agregar Categoría
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCategoriaSelector(false)
                  setSelectedCategoriaId("")
                  setSelectedSubcategorias(new Set())
                }}
                className="flex-1 sm:flex-initial"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="flex flex-col sm:flex-row gap-2">
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
                className="flex-1 sm:flex-initial"
              >
                Crear Nueva
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={addTareaPadre}
                disabled={!selectedTareaPadre}
                className="flex-1 sm:flex-initial"
              >
                Agregar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTaskSelector(false)}
                className="flex-1 sm:flex-initial"
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
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                          <Input
                            value={tareaPadre.tarea}
                            onChange={(e) => updateTarea(padreIndex, 'tarea', e.target.value)}
                            className={`flex-1 ${tareaPadre.completado ? 'line-through text-gray-500' : ''}`}
                            placeholder="Tarea padre"
                          />
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="whitespace-nowrap">Padre</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTarea(padreIndex)}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
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
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                                <Input
                                  value={subtarea.tarea}
                                  onChange={(e) => updateTarea(globalIndex, 'tarea', e.target.value)}
                                  className={`flex-1 ${subtarea.completado ? 'line-through text-gray-500' : ''}`}
                                  placeholder="Subtarea"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTarea(globalIndex)}
                                  className="flex-shrink-0"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                        <Input
                          value={tarea.tarea}
                          onChange={(e) => updateTarea(globalIndex, 'tarea', e.target.value)}
                          className={`flex-1 ${tarea.completado ? 'line-through text-gray-500' : ''}`}
                          placeholder="Descripción de la tarea"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTarea(globalIndex)}
                          className="flex-shrink-0"
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

