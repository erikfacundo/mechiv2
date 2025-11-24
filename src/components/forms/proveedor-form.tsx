"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Proveedor } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ProveedorFormProps {
  proveedor?: Proveedor
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProveedorForm({ proveedor, onSuccess, onCancel }: ProveedorFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Omit<Proveedor, 'id' | 'fechaRegistro'>>({
    defaultValues: proveedor || {
      nombre: "",
      razonSocial: "",
      cuit: "",
      telefono: "",
      email: "",
      direccion: "",
      tipo: "Repuestos",
      activo: true,
    },
  })

  const onSubmit = async (data: Omit<Proveedor, 'id' | 'fechaRegistro'>) => {
    setLoading(true)
    try {
      const url = proveedor ? `/api/proveedores/${proveedor.id}` : "/api/proveedores"
      const method = proveedor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al guardar proveedor")
      }

      toast({
        title: proveedor ? "Proveedor actualizado" : "Proveedor creado",
        description: proveedor
          ? "El proveedor se actualizó correctamente"
          : "El proveedor se creó correctamente",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el proveedor",
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
          placeholder="Nombre del proveedor"
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="razonSocial">Razón Social</Label>
        <Input
          id="razonSocial"
          {...register("razonSocial")}
          placeholder="Razón social"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cuit">CUIT</Label>
        <Input
          id="cuit"
          {...register("cuit")}
          placeholder="20-12345678-9"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          {...register("telefono", { required: "El teléfono es requerido" })}
          placeholder="+54 11 1234-5678"
        />
        {errors.telefono && (
          <p className="text-sm text-destructive">{errors.telefono.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="proveedor@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          {...register("direccion")}
          placeholder="Dirección del proveedor"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo *</Label>
        <Select
          value={watch("tipo")}
          onValueChange={(value) => setValue("tipo", value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Repuestos">Repuestos</SelectItem>
            <SelectItem value="Servicios">Servicios</SelectItem>
            <SelectItem value="Insumos">Insumos</SelectItem>
            <SelectItem value="Otros">Otros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="activo"
          {...register("activo")}
          className="rounded"
        />
        <Label htmlFor="activo">Proveedor activo</Label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Guardando..." : proveedor ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

