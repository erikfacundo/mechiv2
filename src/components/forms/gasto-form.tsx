"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gasto } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useProveedores } from "@/hooks/use-proveedores"
import { useCategorias } from "@/hooks/use-categorias"

interface GastoFormProps {
  gasto?: Gasto
  proveedorId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function GastoForm({ gasto, proveedorId, onSuccess, onCancel }: GastoFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { proveedores } = useProveedores()
  const { categorias } = useCategorias()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Omit<Gasto, 'id'>>({
    defaultValues: gasto || {
      proveedorId: proveedorId || "",
      categoria: "",
      descripcion: "",
      monto: 0,
      fecha: new Date(),
      metodoPago: "Efectivo",
      numeroComprobante: "",
      observaciones: "",
    },
  })

  useEffect(() => {
    if (proveedorId) setValue("proveedorId", proveedorId)
  }, [proveedorId, setValue])

  const onSubmit = async (data: Omit<Gasto, 'id'>) => {
    setLoading(true)
    try {
      const url = gasto ? `/api/gastos/${gasto.id}` : "/api/gastos"
      const method = gasto ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          proveedorId: data.proveedorId || undefined,
          fecha: data.fecha instanceof Date ? data.fecha.toISOString() : data.fecha,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar gasto")
      }

      toast({
        title: gasto ? "Gasto actualizado" : "Gasto creado",
        description: gasto
          ? "El gasto se actualizó correctamente"
          : "El gasto se creó correctamente",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="proveedorId">Proveedor</Label>
        <Select
          value={watch("proveedorId") || "none"}
          onValueChange={(value) => setValue("proveedorId", value === "none" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar proveedor (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin proveedor</SelectItem>
            {proveedores.map((prov) => (
              <SelectItem key={prov.id} value={prov.id}>
                {prov.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoría *</Label>
        <Input
          id="categoria"
          {...register("categoria", { required: "La categoría es requerida" })}
          placeholder="Ej: Repuestos, Servicios, Insumos"
        />
        {errors.categoria && (
          <p className="text-sm text-destructive">{errors.categoria.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Input
          id="descripcion"
          {...register("descripcion", { required: "La descripción es requerida" })}
          placeholder="Descripción del gasto"
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="monto">Monto *</Label>
        <Input
          id="monto"
          type="number"
          step="0.01"
          {...register("monto", {
            required: "El monto es requerido",
            min: { value: 0, message: "El monto debe ser mayor a 0" },
          })}
          placeholder="0.00"
        />
        {errors.monto && (
          <p className="text-sm text-destructive">{errors.monto.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha *</Label>
        <Input
          id="fecha"
          type="datetime-local"
          {...register("fecha", { 
            required: "La fecha es requerida",
            valueAsDate: false,
          })}
          defaultValue={gasto ? new Date(gasto.fecha).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
        />
        {errors.fecha && (
          <p className="text-sm text-destructive">{errors.fecha.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="metodoPago">Método de Pago *</Label>
        <Select
          value={watch("metodoPago")}
          onValueChange={(value) => setValue("metodoPago", value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Efectivo">Efectivo</SelectItem>
            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
            <SelectItem value="Transferencia">Transferencia</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numeroComprobante">Número de Comprobante</Label>
        <Input
          id="numeroComprobante"
          {...register("numeroComprobante")}
          placeholder="Número de comprobante"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Input
          id="observaciones"
          {...register("observaciones")}
          placeholder="Observaciones adicionales"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Guardando..." : gasto ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

