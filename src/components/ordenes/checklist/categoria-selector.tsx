"use client"

import { useState, useMemo, useCallback } from "react"
import { TareaChecklist } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategorias } from "@/hooks/use-categorias"
import { useToast } from "@/hooks/use-toast"

interface CategoriaSelectorProps {
  onClose: () => void
  onAdd: (checklist: TareaChecklist[]) => void
  existingChecklist: TareaChecklist[]
}

export function CategoriaSelector({ onClose, onAdd, existingChecklist }: CategoriaSelectorProps) {
  const { categorias } = useCategorias()
  const { toast } = useToast()
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>("")
  const [selectedSubcategorias, setSelectedSubcategorias] = useState<Set<string>>(new Set())

  const categoriasActivas = useMemo(
    () => categorias.filter((c) => c.activa),
    [categorias]
  )

  const categoriaSeleccionada = useMemo(
    () => categoriasActivas.find((c) => c.id === selectedCategoriaId),
    [categoriasActivas, selectedCategoriaId]
  )

  const toggleSubcategoria = useCallback((subcategoria: string) => {
    setSelectedSubcategorias((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subcategoria)) {
        newSet.delete(subcategoria)
      } else {
        newSet.add(subcategoria)
      }
      return newSet
    })
  }, [])

  const handleAdd = useCallback(() => {
    if (!selectedCategoriaId || !categoriaSeleccionada) {
      toast({
        title: "Error",
        description: "Debes seleccionar una categoría",
        variant: "destructive",
      })
      return
    }

    const categoriaExiste = existingChecklist.some(
      (t) => t.tarea === categoriaSeleccionada.nombre && !t.tareaPadre
    )
    if (categoriaExiste) {
      toast({
        title: "Error",
        description: "Esta categoría ya está en el checklist",
        variant: "destructive",
      })
      return
    }

    const tareaPadre: TareaChecklist = {
      id: `categoria-${categoriaSeleccionada.id}-${Date.now()}`,
      tarea: categoriaSeleccionada.nombre,
      completado: false,
      notas: categoriaSeleccionada.descripcion || "",
    }

    const subcategoriasSeleccionadas =
      categoriaSeleccionada.subcategorias?.filter((sub) => selectedSubcategorias.has(sub)) || []
    const subtareas: TareaChecklist[] = subcategoriasSeleccionadas.map((subcategoria, index) => ({
      id: `subcategoria-${categoriaSeleccionada.id}-${index}-${Date.now()}`,
      tarea: subcategoria,
      tareaPadre: categoriaSeleccionada.nombre,
      completado: false,
      notas: "",
    }))

    onAdd([...existingChecklist, tareaPadre, ...subtareas])

    setSelectedCategoriaId("")
    setSelectedSubcategorias(new Set())
    onClose()

    toast({
      title: "Categoría agregada",
      description: `Se agregó "${categoriaSeleccionada.nombre}" con ${subcategoriasSeleccionadas.length} subcategoría${subcategoriasSeleccionadas.length !== 1 ? "s" : ""}`,
    })
  }, [selectedCategoriaId, categoriaSeleccionada, selectedSubcategorias, existingChecklist, onAdd, onClose, toast])

  return (
    <Card>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <Label>Seleccionar Categoría</Label>
          <Select
            value={selectedCategoriaId}
            onValueChange={(value) => {
              setSelectedCategoriaId(value)
              setSelectedSubcategorias(new Set())
            }}
          >
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

        {categoriaSeleccionada?.subcategorias && categoriaSeleccionada.subcategorias.length > 0 && (
          <div className="space-y-2">
            <Label>Seleccionar Subcategorías (opcional)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
              {categoriaSeleccionada.subcategorias.map((subcategoria, index) => (
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
                  const todas = new Set(categoriaSeleccionada.subcategorias || [])
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
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedCategoriaId}
            className="flex-1 sm:flex-initial"
          >
            Agregar Categoría
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 sm:flex-initial"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

