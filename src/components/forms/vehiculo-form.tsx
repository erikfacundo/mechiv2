"use client"

import { useForm } from "react-hook-form"
import { Vehiculo, FotoVehiculo } from "@/types"
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
import { ImageUpload } from "@/components/ui/image-upload"

interface VehiculoFormProps {
  vehiculo?: Vehiculo
  clienteId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const marcas = [
  "Ford", "Chevrolet", "Volkswagen", "Toyota", "Fiat", "Peugeot",
  "Renault", "Citroën", "Nissan", "Honda", "Hyundai", "Kia",
  "Mazda", "Suzuki", "Jeep", "BMW", "Mercedes-Benz", "Audi"
]

const tiposCombustible = ["Nafta", "Diesel", "GNC", "Eléctrico", "Híbrido"]

export function VehiculoForm({ vehiculo, clienteId: propClienteId, onSuccess, onCancel }: VehiculoFormProps) {
  const { toast } = useToast()
  const { clientes } = useClientes()
  const [loading, setLoading] = useState(false)
  const [marca, setMarca] = useState(vehiculo?.marca || "")
  const [tipoCombustible, setTipoCombustible] = useState(vehiculo?.tipoCombustible || "")
  const [clienteId, setClienteId] = useState(vehiculo?.clienteId || propClienteId || "")
  const [fotos, setFotos] = useState<FotoVehiculo[]>(vehiculo?.fotos || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<Omit<Vehiculo, 'id'>>({
    defaultValues: vehiculo || undefined,
  })

  useEffect(() => {
    if (marca) setValue("marca", marca)
    if (tipoCombustible) setValue("tipoCombustible", tipoCombustible)
    if (clienteId) setValue("clienteId", clienteId)
  }, [marca, tipoCombustible, clienteId, setValue])

  useEffect(() => {
    if (propClienteId && !vehiculo) {
      setClienteId(propClienteId)
      setValue("clienteId", propClienteId)
    }
  }, [propClienteId, vehiculo, setValue])

  const onSubmit = async (data: Omit<Vehiculo, 'id' | 'fotos'>) => {
    setLoading(true)
    try {
      const url = vehiculo ? `/api/vehiculos/${vehiculo.id}` : "/api/vehiculos"
      const method = vehiculo ? "PUT" : "POST"

      // Incluir fotos en el body
      const bodyData = {
        ...data,
        fotos: fotos.length > 0 ? fotos : undefined,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) {
        throw new Error("Error al guardar vehículo")
      }

      toast({
        title: vehiculo ? "Vehículo actualizado" : "Vehículo creado",
        description: vehiculo
          ? "El vehículo se ha actualizado correctamente."
          : "El vehículo se ha creado correctamente.",
        variant: "success",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el vehículo. Intenta nuevamente.",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Select value={marca} onValueChange={setMarca}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una marca" />
            </SelectTrigger>
            <SelectContent>
              {marcas.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!marca && (
            <p className="text-sm text-destructive">La marca es requerida</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input
            id="modelo"
            {...register("modelo", { required: "El modelo es requerido" })}
            placeholder="Focus"
          />
          {errors.modelo && (
            <p className="text-sm text-destructive">{errors.modelo.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="año">Año *</Label>
          <Input
            id="año"
            type="number"
            {...register("año", {
              required: "El año es requerido",
              min: { value: 1900, message: "Año inválido" },
              max: { value: new Date().getFullYear() + 1, message: "Año inválido" },
              valueAsNumber: true,
            })}
            placeholder="2020"
          />
          {errors.año && (
            <p className="text-sm text-destructive">{errors.año.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patente">Patente *</Label>
          <Input
            id="patente"
            {...register("patente", {
              required: "La patente es requerida",
              pattern: {
                value: /^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/,
                message: "Formato de patente inválido (ABC123 o AB123CD)",
              },
            })}
            placeholder="ABC123"
            style={{ textTransform: "uppercase" }}
          />
          {errors.patente && (
            <p className="text-sm text-destructive">{errors.patente.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kilometraje">Kilometraje *</Label>
          <Input
            id="kilometraje"
            type="number"
            {...register("kilometraje", {
              required: "El kilometraje es requerido",
              min: { value: 0, message: "El kilometraje debe ser positivo" },
              valueAsNumber: true,
            })}
            placeholder="50000"
          />
          {errors.kilometraje && (
            <p className="text-sm text-destructive">{errors.kilometraje.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoCombustible">Tipo de Combustible</Label>
          <Select value={tipoCombustible} onValueChange={setTipoCombustible}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposCombustible.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          {...register("color")}
          placeholder="Blanco"
        />
      </div>

      {/* Subida de fotos */}
      <div className="space-y-2">
        <ImageUpload
          fotos={fotos}
          onFotosChange={setFotos}
          maxFotos={20}
          label="Fotos del vehículo (opcional)"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || !clienteId || !marca}>
          {loading ? "Guardando..." : vehiculo ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

