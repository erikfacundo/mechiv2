"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Turno } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"

interface TurnoFormProps {
  turno?: Turno
  clienteId?: string
  vehiculoId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TurnoForm({ turno, clienteId, vehiculoId, onSuccess, onCancel }: TurnoFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { clientes } = useClientes()
  const { vehiculos } = useVehiculos()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Omit<Turno, 'id' | 'fechaCreacion'>>({
    defaultValues: turno || {
      clienteId: clienteId || "",
      vehiculoId: vehiculoId || "",
      fecha: new Date(),
      hora: "09:00",
      descripcion: "",
      estado: "Pendiente",
      observaciones: "",
    },
  })

  const clienteSeleccionado = watch("clienteId")
  const [vehiculosDelCliente, setVehiculosDelCliente] = useState<string[]>([])

  useEffect(() => {
    if (clienteId) setValue("clienteId", clienteId)
    if (vehiculoId) setValue("vehiculoId", vehiculoId)
  }, [clienteId, vehiculoId, setValue])

  useEffect(() => {
    if (clienteSeleccionado) {
      const vehiculosFiltrados = vehiculos
        .filter((v) => v.clienteId === clienteSeleccionado)
        .map((v) => v.id)
      setVehiculosDelCliente(vehiculosFiltrados)
      if (vehiculosFiltrados.length > 0 && !turno && !vehiculoId) {
        setValue("vehiculoId", vehiculosFiltrados[0])
      }
    }
  }, [clienteSeleccionado, vehiculos, setValue, turno, vehiculoId])

  const onSubmit = async (data: Omit<Turno, 'id' | 'fechaCreacion'>) => {
    setLoading(true)
    try {
      const url = turno ? `/api/turnos/${turno.id}` : "/api/turnos"
      const method = turno ? "PUT" : "POST"

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
        throw new Error("Error al guardar turno")
      }

      toast({
        title: turno ? "Turno actualizado" : "Turno creado",
        description: turno
          ? "El turno se actualizó correctamente"
          : "El turno se creó correctamente",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el turno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clienteId">Cliente *</Label>
        <Select
          value={watch("clienteId")}
          onValueChange={(value) => setValue("clienteId", value)}
          disabled={!!clienteId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.clienteId && (
          <p className="text-sm text-destructive">{errors.clienteId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehiculoId">Vehículo *</Label>
        <Select
          value={watch("vehiculoId")}
          onValueChange={(value) => setValue("vehiculoId", value)}
          disabled={!!vehiculoId || vehiculosDelCliente.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar vehículo" />
          </SelectTrigger>
          <SelectContent>
            {vehiculos
              .filter((v) => vehiculosDelCliente.length === 0 || vehiculosDelCliente.includes(v.id))
              .map((vehiculo) => (
                <SelectItem key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.marca} {vehiculo.modelo} - {vehiculo.patente}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.vehiculoId && (
          <p className="text-sm text-destructive">{errors.vehiculoId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha *</Label>
          <Input
            id="fecha"
            type="date"
            {...register("fecha", { required: "La fecha es requerida" })}
          />
          {errors.fecha && (
            <p className="text-sm text-destructive">{errors.fecha.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hora">Hora *</Label>
          <Input
            id="hora"
            type="time"
            {...register("hora", { required: "La hora es requerida" })}
          />
          {errors.hora && (
            <p className="text-sm text-destructive">{errors.hora.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Input
          id="descripcion"
          {...register("descripcion", { required: "La descripción es requerida" })}
          placeholder="Descripción del turno"
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion.message}</p>
        )}
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
            <SelectItem value="Confirmado">Confirmado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
            <SelectItem value="Completado">Completado</SelectItem>
          </SelectContent>
        </Select>
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
            {loading ? "Guardando..." : turno ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </form>
  )
}

