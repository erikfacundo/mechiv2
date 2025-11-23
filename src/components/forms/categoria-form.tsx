"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Categoria } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, X } from "lucide-react"

interface CategoriaFormProps {
  categoria?: Categoria
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoriaForm({ categoria, onSuccess, onCancel }: CategoriaFormProps) {
  const [loading, setLoading] = useState(false)
  const [subcategorias, setSubcategorias] = useState<string[]>(
    categoria?.subcategorias || ['']
  )
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<Categoria, 'id' | 'fechaCreacion' | 'subcategorias'>>({
    defaultValues: categoria || {
      nombre: "",
      descripcion: "",
      color: "#3b82f6",
      activa: true,
    },
  })

  const addSubcategoria = () => {
    setSubcategorias([...subcategorias, ''])
  }

  const updateSubcategoria = (index: number, value: string) => {
    const updated = [...subcategorias]
    updated[index] = value
    setSubcategorias(updated)
  }

  const removeSubcategoria = (index: number) => {
    if (subcategorias.length > 1) {
      const updated = subcategorias.filter((_, i) => i !== index)
      setSubcategorias(updated)
    }
  }

  const onSubmit = async (data: Omit<Categoria, 'id' | 'fechaCreacion' | 'subcategorias'>) => {
    // Filtrar subcategorías vacías
    const subcategoriasFiltradas = subcategorias.filter(sub => sub.trim())
    
    if (subcategoriasFiltradas.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una subcategoría",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = categoria ? `/api/categorias/${categoria.id}` : "/api/categorias"
      const method = categoria ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          subcategorias: subcategoriasFiltradas,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar categoría")
      }

      toast({
        title: categoria ? "Categoría actualizada" : "Categoría creada",
        description: categoria
          ? "La categoría se actualizó correctamente"
          : "La categoría se creó correctamente",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la Tarea Principal *</Label>
        <p className="text-sm text-muted-foreground">
          Este será el nombre de la tarea principal (categoría) que aparecerá en el checklist
        </p>
        <Input
          id="nombre"
          {...register("nombre", { required: "El nombre es requerido" })}
          placeholder="Ej: Diagnóstico Electrónico y Reparación de Fallas"
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          {...register("descripcion")}
          placeholder="Descripción de la categoría"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            {...register("color")}
            className="w-20 h-10"
          />
          <Input
            {...register("color")}
            placeholder="#3b82f6"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Subtareas *</Label>
        <p className="text-sm text-muted-foreground">
          Esta categoría será la <strong>Tarea Principal</strong>. Las subtareas se convertirán automáticamente en subtareas del checklist cuando se seleccione esta categoría al crear una orden.
        </p>
        <div className="space-y-2">
          {subcategorias.map((sub, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={sub}
                onChange={(e) => updateSubcategoria(index, e.target.value)}
                placeholder="Ej: Cambio de aceite"
                className="flex-1"
              />
              {subcategorias.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeSubcategoria(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addSubcategoria}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Subcategoría
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="activa"
          {...register("activa")}
          className="rounded"
        />
        <Label htmlFor="activa">Categoría activa</Label>
      </div>

      <div className="flex justify-end gap-2">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : categoria ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}

