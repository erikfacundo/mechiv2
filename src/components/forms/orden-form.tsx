"use client"

import { useCallback } from "react"
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
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClienteForm } from "./cliente-form"
import { VehiculoForm } from "./vehiculo-form"

interface OrdenFormProps {
  orden?: OrdenTrabajo
  onSuccess?: () => void
  onCancel?: () => void
}

const estados: EstadoOrden[] = ["Pendiente", "En Proceso", "Completado", "Entregado"]

export function OrdenForm({ orden, onSuccess, onCancel }: OrdenFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { clientes, refetch: refetchClientes } = useClientes()
  const { vehiculos, refetch: refetchVehiculos } = useVehiculos()
  const [loading, setLoading] = useState(false)
  const [clienteId, setClienteId] = useState(orden?.clienteId || "")
  const [vehiculosDelCliente, setVehiculosDelCliente] = useState<string[]>([])
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
  const [isVehiculoDialogOpen, setIsVehiculoDialogOpen] = useState(false)

  interface OrdenFormValues {
    clienteId: string
    vehiculoId: string
    numeroOrden: string
    estado: EstadoOrden
    descripcion: string
    servicios: string[]
    manoObra: number
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
          manoObra: orden.manoObra || orden.costoTotal || 0,
          costoTotal: orden.costoTotal || 0,
          observaciones: orden.observaciones || "",
        }
      : {
          servicios: [""],
          manoObra: 0,
          costoTotal: 0,
          estado: "Pendiente",
          clienteId: "",
          vehiculoId: "",
          numeroOrden: "", // Se generará automáticamente en el servidor
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
  const manoObraValue = watch("manoObra")

  // Calcular costoTotal automáticamente cuando cambia manoObra
  useEffect(() => {
    if (manoObraValue) {
      setValue("costoTotal", manoObraValue)
    }
  }, [manoObraValue, setValue])


  const onSubmit = async (data: Omit<OrdenTrabajo, 'id' | 'fechaIngreso' | 'fechaEntrega'>) => {
    setLoading(true)
    try {
      const url = orden ? `/api/ordenes/${orden.id}` : "/api/ordenes"
      const method = orden ? "PUT" : "POST"

      // Para nuevas órdenes, no enviar numeroOrden (se generará automáticamente)
      // Asegurar que costoTotal = manoObra si no hay gastos
      const bodyData = orden 
        ? { 
            ...data, 
            servicios: data.servicios.filter((s) => s.trim()),
            costoTotal: data.manoObra || data.costoTotal || 0,
            manoObra: data.manoObra || data.costoTotal || 0,
          }
        : { 
            ...data, 
            numeroOrden: undefined, // No enviar para que se genere automáticamente
            servicios: data.servicios.filter((s) => s.trim()),
            costoTotal: data.manoObra || data.costoTotal || 0,
            manoObra: data.manoObra || data.costoTotal || 0,
          }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
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
        <div className="flex items-center justify-between">
          <Label htmlFor="clienteId">Cliente *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsClienteDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Cliente
          </Button>
        </div>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="vehiculoId">Vehículo *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsVehiculoDialogOpen(true)}
            disabled={!clienteId}
            title={!clienteId ? "Primero selecciona un cliente" : ""}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo Vehículo
          </Button>
        </div>
        <Select
          value={watch("vehiculoId") || ""}
          onValueChange={(value) => setValue("vehiculoId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un vehículo" />
          </SelectTrigger>
          <SelectContent>
            {vehiculosDelCliente.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {clienteId ? "No hay vehículos para este cliente" : "Selecciona un cliente primero"}
              </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numeroOrden">N° Orden {orden ? "*" : ""}</Label>
          {orden ? (
            <Input
              id="numeroOrden"
              {...register("numeroOrden", { required: "El número de orden es requerido" })}
              placeholder="OT-2024-001"
            />
          ) : (
            <Input
              id="numeroOrden"
              value="Se generará automáticamente"
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
          )}
          {errors.numeroOrden && (
            <p className="text-sm text-destructive">{errors.numeroOrden.message}</p>
          )}
          {!orden && (
            <p className="text-xs text-muted-foreground">
              El número de orden se asignará automáticamente al guardar
            </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manoObra">Mano de Obra (Ganancia) *</Label>
          <p className="text-xs text-muted-foreground">
            Lo que cobras por el trabajo
          </p>
          <Input
            id="manoObra"
            type="number"
            {...register("manoObra", {
              required: "La mano de obra es requerida",
              min: { value: 0, message: "Debe ser un valor positivo" },
              valueAsNumber: true,
            })}
            placeholder="15000"
            defaultValue={orden?.manoObra || orden?.costoTotal || 0}
          />
          {errors.manoObra && (
            <p className="text-sm text-destructive">{errors.manoObra.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="costoTotal">Costo Total</Label>
          <p className="text-xs text-muted-foreground">
            Total a facturar (igual a mano de obra)
          </p>
          <Input
            id="costoTotal"
            type="number"
            {...register("costoTotal", {
              min: { value: 0, message: "El costo debe ser positivo" },
              valueAsNumber: true,
            })}
            placeholder="15000"
            readOnly
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Los gastos internos se agregan después
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Input
          id="observaciones"
          {...register("observaciones")}
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 w-full">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || !clienteId} className="w-full sm:w-auto">
          {loading ? "Guardando..." : orden ? "Actualizar" : "Crear"}
        </Button>
      </div>

      {/* Dialog para crear cliente */}
      <Dialog open={isClienteDialogOpen} onOpenChange={setIsClienteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <ClienteForm
            onSuccess={async () => {
              await refetchClientes()
              setIsClienteDialogOpen(false)
              // Esperar un momento para que se actualice la lista
              setTimeout(async () => {
                const response = await fetch("/api/clientes")
                if (response.ok) {
                  const clientesData = await response.json()
                  if (clientesData.length > 0) {
                    // Seleccionar el último cliente (asumiendo que es el más reciente)
                    const nuevoCliente = clientesData[clientesData.length - 1]
                    setClienteId(nuevoCliente.id)
                  }
                }
              }, 500)
              toast({
                title: "Cliente creado",
                description: "El cliente ha sido seleccionado automáticamente.",
              })
            }}
            onCancel={() => setIsClienteDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para crear vehículo */}
      <Dialog open={isVehiculoDialogOpen} onOpenChange={setIsVehiculoDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Vehículo</DialogTitle>
          </DialogHeader>
          <VehiculoForm
            clienteId={clienteId}
            onSuccess={async () => {
              await refetchVehiculos()
              setIsVehiculoDialogOpen(false)
              // Esperar un momento para que se actualice la lista
              setTimeout(async () => {
                const response = await fetch("/api/vehiculos")
                if (response.ok) {
                  const vehiculosData = await response.json()
                  const vehiculosDelCliente = vehiculosData.filter((v: any) => v.clienteId === clienteId)
                  if (vehiculosDelCliente.length > 0) {
                    // Seleccionar el último vehículo creado para este cliente
                    const nuevoVehiculo = vehiculosDelCliente[vehiculosDelCliente.length - 1]
                    setValue("vehiculoId", nuevoVehiculo.id)
                  }
                }
              }, 500)
              toast({
                title: "Vehículo creado",
                description: "El vehículo ha sido seleccionado automáticamente.",
              })
            }}
            onCancel={() => setIsVehiculoDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </form>
  )
}

