"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { OrdenTrabajo, EstadoOrden } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { Plus, X } from "lucide-react"

interface OrdenFormProps {
  orden?: OrdenTrabajo
  onSuccess?: () => void
  onCancel?: () => void
}

const estados: EstadoOrden[] = ["Pendiente", "En Proceso", "Completado", "Entregado"]

export function OrdenForm({ orden, onSuccess, onCancel }: OrdenFormProps) {
  const { toast } = useToast()
  const { clientes } = useClientes()
  const { vehiculos } = useVehiculos()
  const [loading, setLoading] = useState(false)
  const [clienteId, setClienteId] = useState(orden?.clienteId || "")
  const [vehiculosDelCliente, setVehiculosDelCliente] = useState<string[]>([])

  interface OrdenFormValues {
    clienteId: string
    vehiculoId: string
    numeroOrden: string
    estado: EstadoOrden
    descripcion: string
    servicios: string[]
    costoTotal: number
    observaciones?: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    setError,
    clearErrors,
  } = useForm<OrdenFormValues>({
    defaultValues: orden
      ? {
          clienteId: orden.clienteId,
          vehiculoId: orden.vehiculoId,
          numeroOrden: orden.numeroOrden,
          estado: orden.estado,
          descripcion: orden.descripcion,
          servicios: orden.servicios,
          costoTotal: orden.costoTotal,
          observaciones: orden.observaciones || "",
        }
      : {
          servicios: [""],
          costoTotal: 0,
          estado: "Pendiente",
          clienteId: "",
          vehiculoId: "",
          numeroOrden: "",
          descripcion: "",
        },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-ignore - React Hook Form type inference issue
    name: "servicios",
  })

  useEffect(() => {
    if (clienteId) {
      const vehiculosFiltrados = vehiculos
        .filter((v) => v.clienteId === clienteId)
        .map((v) => v.id)
      setVehiculosDelCliente(vehiculosFiltrados)
      if (vehiculosFiltrados.length > 0 && !orden) {
        setValue("vehiculoId", vehiculosFiltrados[0])
      }
    }
  }, [clienteId, vehiculos, setValue, orden])

  useEffect(() => {
    if (clienteId) setValue("clienteId", clienteId)
  }, [clienteId, setValue])

  const servicios = watch("servicios")
  const costoTotal = watch("costoTotal")
  const numeroOrdenValue = watch("numeroOrden")

  // Validar número de orden único en tiempo real
  useEffect(() => {
    const validateNumeroOrden = async () => {
      if (!numeroOrdenValue || numeroOrdenValue.length < 5) return

      try {
        const response = await fetch(
          `/api/validations/numero-orden?numeroOrden=${numeroOrdenValue}${orden ? `&excludeId=${orden.id}` : ""}`
        )
        const { exists } = await response.json()

        if (exists) {
          setError("numeroOrden", {
            type: "manual",
            message: "Este número de orden ya existe",
          })
        } else {
          clearErrors("numeroOrden")
        }
      } catch (error) {
        // Silenciar errores de validación
      }
    }

    const timeoutId = setTimeout(validateNumeroOrden, 500)
    return () => clearTimeout(timeoutId)
  }, [numeroOrdenValue, orden, setError, clearErrors])

  const calcularCosto = () => {
    // Lógica simple: cada servicio suma un costo base
    // En producción, esto podría venir de una base de datos de servicios
    const costoBase = 5000
    const total = servicios.filter(s => s.trim()).length * costoBase
    setValue("costoTotal", total)
  }

  useEffect(() => {
    if (servicios && servicios.length > 0) {
      calcularCosto()
    }
  }, [servicios])

  useEffect(() => {
    // El número de orden se generará automáticamente en el servidor si no se proporciona
    if (!orden && !watch("numeroOrden")) {
      // Dejar vacío para que el servidor lo genere
      setValue("numeroOrden", "")
    }
  }, [orden, setValue, watch])

  const onSubmit = async (data: Omit<OrdenTrabajo, 'id' | 'fechaIngreso' | 'fechaEntrega'>) => {
    setLoading(true)
    try {
      const url = orden ? `/api/ordenes/${orden.id}` : "/api/ordenes"
      const method = orden ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          servicios: data.servicios.filter((s) => s.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar orden")
      }

      toast({
        title: orden ? "Orden actualizada" : "Orden creada",
        description: orden
          ? "La orden se ha actualizado correctamente."
          : "La orden se ha creado correctamente.",
        variant: "success",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la orden. Intenta nuevamente.",
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
        <Select value={clienteId} onValueChange={setClienteId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!clienteId && (
          <p className="text-sm text-destructive">El cliente es requerido</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehiculoId">Vehículo *</Label>
        <Select
          value={watch("vehiculoId") || ""}
          onValueChange={(value) => setValue("vehiculoId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un vehículo" />
          </SelectTrigger>
          <SelectContent>
            {vehiculosDelCliente.length === 0 ? (
              <SelectItem value="" disabled>
                Selecciona un cliente primero
              </SelectItem>
            ) : (
              vehiculos
                .filter((v) => vehiculosDelCliente.includes(v.id))
                .map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.marca} {vehiculo.modelo} - {vehiculo.patente}
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
        {errors.vehiculoId && (
          <p className="text-sm text-destructive">{errors.vehiculoId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numeroOrden">N° Orden *</Label>
          <Input
            id="numeroOrden"
            {...register("numeroOrden", { required: "El número de orden es requerido" })}
            placeholder="OT-2024-001"
          />
          {errors.numeroOrden && (
            <p className="text-sm text-destructive">{errors.numeroOrden.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado *</Label>
          <Select
            value={watch("estado") || "Pendiente"}
            onValueChange={(value) => setValue("estado", value as EstadoOrden)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Input
          id="descripcion"
          {...register("descripcion", { required: "La descripción es requerida" })}
          placeholder="Reparación de frenos"
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Servicios *</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`servicios.${index}` as const, {
                required: index === 0 ? "Al menos un servicio es requerido" : false,
              })}
              placeholder="Ej: Cambio de aceite"
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
          size="sm"
          onClick={() => append("")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Servicio
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="costoTotal">Costo Total *</Label>
        <Input
          id="costoTotal"
          type="number"
          {...register("costoTotal", {
            required: "El costo total es requerido",
            min: { value: 0, message: "El costo debe ser positivo" },
            valueAsNumber: true,
          })}
          placeholder="15000"
        />
        {errors.costoTotal && (
          <p className="text-sm text-destructive">{errors.costoTotal.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Input
          id="observaciones"
          {...register("observaciones")}
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || !clienteId}>
          {loading ? "Guardando..." : orden ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

