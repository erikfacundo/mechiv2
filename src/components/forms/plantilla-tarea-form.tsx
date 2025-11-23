"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlantillaTarea } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, X } from "lucide-react"

interface PlantillaTareaFormProps {
  plantilla?: PlantillaTarea
  onSuccess?: () => void
  onCancel?: () => void
}

export function PlantillaTareaForm({ plantilla, onSuccess, onCancel }: PlantillaTareaFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  interface PlantillaFormValues {
    nombre: string
    descripcion: string
    categoria?: string
    tiempoEstimado?: number
    costoEstimado?: number
    pasos: string[]
    activa: boolean
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<PlantillaFormValues>({
    defaultValues: plantilla || {
      nombre: "",
      descripcion: "",
      categoria: "",
      tiempoEstimado: 0,
      costoEstimado: 0,
      pasos: [""],
      activa: true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-ignore - React Hook Form type inference issue
    name: "pasos",
  })

  const onSubmit = async (data: Omit<PlantillaTarea, 'id' | 'fechaCreacion'>) => {
    setLoading(true)
    try {
      const url = plantilla ? `/api/plantillas-tareas/${plantilla.id}` : "/api/plantillas-tareas"
      const method = plantilla ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al guardar plantilla")
      }

      toast({
        title: plantilla ? "Plantilla actualizada" : "Plantilla creada",
        description: plantilla
          ? "La plantilla se actualizó correctamente"
          : "La plantilla se creó correctamente",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
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
          placeholder="Ej: Service Básico"
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
          placeholder="Descripción de la plantilla"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoría</Label>
        <Input
          id="categoria"
          {...register("categoria")}
          placeholder="Categoría de la plantilla"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tiempoEstimado">Tiempo Estimado (minutos)</Label>
          <Input
            id="tiempoEstimado"
            type="number"
            {...register("tiempoEstimado", { min: 0 })}
            placeholder="120"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costoEstimado">Costo Estimado</Label>
          <Input
            id="costoEstimado"
            type="number"
            step="0.01"
            {...register("costoEstimado", { min: 0 })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pasos *</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`pasos.${index}` as const, {
                required: "El paso no puede estar vacío",
              })}
              placeholder={`Paso ${index + 1}`}
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => append("")}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Paso
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="activa"
          {...register("activa")}
          className="rounded"
        />
        <Label htmlFor="activa">Plantilla activa</Label>
      </div>

      <div className="flex justify-end gap-2">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : plantilla ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}

