"use client"

import { useForm } from "react-hook-form"
import { Cliente } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

interface ClienteFormProps {
  cliente?: Cliente
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm<Omit<Cliente, 'id' | 'fechaRegistro'>>({
    defaultValues: cliente
      ? {
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          dni: cliente.dni,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion || "",
        }
      : undefined,
  })

  const dniValue = watch("dni")

  // Validar DNI único en tiempo real
  useEffect(() => {
    const validateDni = async () => {
      if (!dniValue || dniValue.length < 7) return

      try {
        const response = await fetch(
          `/api/validations/dni?dni=${dniValue}${cliente ? `&excludeId=${cliente.id}` : ""}`
        )
        const { exists } = await response.json()

        if (exists) {
          setError("dni", {
            type: "manual",
            message: "Este DNI ya está registrado",
          })
        } else {
          clearErrors("dni")
        }
      } catch (error) {
        // Silenciar errores de validación
      }
    }

    const timeoutId = setTimeout(validateDni, 500)
    return () => clearTimeout(timeoutId)
  }, [dniValue, cliente, setError, clearErrors])

  const onSubmit = async (data: Omit<Cliente, 'id' | 'fechaRegistro'>) => {
    setLoading(true)
    try {
      const url = cliente ? `/api/clientes/${cliente.id}` : "/api/clientes"
      const method = cliente ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al guardar cliente")
      }

      toast({
        title: cliente ? "Cliente actualizado" : "Cliente creado",
        description: cliente
          ? "El cliente se ha actualizado correctamente."
          : "El cliente se ha creado correctamente.",
        variant: "success",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            {...register("nombre", { required: "El nombre es requerido" })}
            placeholder="Juan"
          />
          {errors.nombre && (
            <p className="text-sm text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input
            id="apellido"
            {...register("apellido", { required: "El apellido es requerido" })}
            placeholder="Pérez"
          />
          {errors.apellido && (
            <p className="text-sm text-destructive">{errors.apellido.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dni">DNI *</Label>
        <Input
          id="dni"
          {...register("dni", {
            required: "El DNI es requerido",
            pattern: {
              value: /^\d{7,8}$/,
              message: "El DNI debe tener 7 u 8 dígitos",
            },
          })}
          placeholder="12345678"
        />
        {errors.dni && (
          <p className="text-sm text-destructive">{errors.dni.message}</p>
        )}
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
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email", {
            required: "El email es requerido",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido",
            },
          })}
          placeholder="juan.perez@email.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          {...register("direccion")}
          placeholder="Av. Corrientes 1234, CABA"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : cliente ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

