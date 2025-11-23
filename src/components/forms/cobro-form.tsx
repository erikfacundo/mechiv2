"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cobro } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useOrdenes } from "@/hooks/use-ordenes"

interface CobroFormProps {
  cobro?: Cobro
  ordenId?: string
  clienteId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CobroForm({ cobro, ordenId, clienteId, onSuccess, onCancel }: CobroFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { ordenes } = useOrdenes()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Omit<Cobro, 'id'>>({
    defaultValues: cobro || {
      ordenId: ordenId || "",
      clienteId: clienteId || "",
      monto: 0,
      fecha: new Date(),
      metodoPago: "Efectivo",
      estado: "Pendiente",
      numeroComprobante: "",
      observaciones: "",
    },
  })

  useEffect(() => {
    if (ordenId) setValue("ordenId", ordenId)
    if (clienteId) setValue("clienteId", clienteId)
  }, [ordenId, clienteId, setValue])

  const ordenSeleccionada = watch("ordenId")
  useEffect(() => {
    if (ordenSeleccionada && !clienteId) {
      const orden = ordenes.find(o => o.id === ordenSeleccionada)
      if (orden) setValue("clienteId", orden.clienteId)
    }
  }, [ordenSeleccionada, ordenes, clienteId, setValue])

  const onSubmit = async (data: Omit<Cobro, 'id'>) => {
    setLoading(true)
    try {
      const url = cobro ? `/api/cobros/${cobro.id}` : "/api/cobros"
      const method = cobro ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          fecha: data.fecha instanceof Date ? data.fecha.toISOString() : data.fecha,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar cobro")
      }

      toast({
        title: cobro ? "Cobro actualizado" : "Cobro creado",
        description: cobro
          ? "El cobro se actualizó correctamente"
          : "El cobro se creó correctamente",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cobro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!ordenId && (
        <div className="space-y-2">
          <Label htmlFor="ordenId">Orden de Trabajo *</Label>
          <Select
            value={watch("ordenId")}
            onValueChange={(value) => setValue("ordenId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar orden" />
            </SelectTrigger>
            <SelectContent>
              {ordenes.map((orden) => (
                <SelectItem key={orden.id} value={orden.id}>
                  {orden.numeroOrden} - {orden.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ordenId && (
            <p className="text-sm text-destructive">{errors.ordenId.message}</p>
          )}
        </div>
      )}

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
          defaultValue={cobro ? new Date(cobro.fecha).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
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
        <Label htmlFor="estado">Estado *</Label>
        <Select
          value={watch("estado")}
          onValueChange={(value) => setValue("estado", value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Completado">Completado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
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

      <div className="flex justify-end gap-2">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : cobro ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}

