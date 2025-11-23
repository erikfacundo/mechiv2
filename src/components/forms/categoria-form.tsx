"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Categoria } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface CategoriaFormProps {
  categoria?: Categoria
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoriaForm({ categoria, onSuccess, onCancel }: CategoriaFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<Categoria, 'id' | 'fechaCreacion'>>({
    defaultValues: categoria || {
      nombre: "",
      descripcion: "",
      color: "#3b82f6",
      activa: true,
    },
  })

  const onSubmit = async (data: Omit<Categoria, 'id' | 'fechaCreacion'>) => {
    setLoading(true)
    try {
      const url = categoria ? `/api/categorias/${categoria.id}` : "/api/categorias"
      const method = categoria ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          {...register("nombre", { required: "El nombre es requerido" })}
          placeholder="Ej: Service"
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

