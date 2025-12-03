"use client"

import { useForm } from "react-hook-form"
import { Usuario } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

type UsuarioSinPassword = Omit<Usuario, 'id' | 'passwordHash'>

interface UsuarioFormProps {
  usuario?: UsuarioSinPassword
  onSuccess?: () => void
  onCancel?: () => void
}

interface UsuarioFormData {
  username: string
  password: string
  confirmPassword?: string
  nombre?: string
  apellido?: string
  email?: string
  activo: boolean
}

export function UsuarioForm({ usuario, onSuccess, onCancel }: UsuarioFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UsuarioFormData>({
    defaultValues: usuario
      ? {
          username: usuario.username,
          password: "",
          confirmPassword: "",
          nombre: usuario.nombre || "",
          apellido: usuario.apellido || "",
          email: usuario.email || "",
          activo: usuario.activo ?? true,
        }
      : {
          activo: true,
        },
  })

  const password = watch("password")
  const activo = watch("activo")

  const onSubmit = async (data: UsuarioFormData) => {
    if (!usuario && !data.password) {
      toast({
        title: "Error",
        description: "La contraseña es requerida para nuevos usuarios.",
        variant: "destructive",
      })
      return
    }

    if (data.password && data.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    if (data.password && data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = usuario ? `/api/usuarios/${usuario.id}` : "/api/usuarios"
      const method = usuario ? "PUT" : "POST"

      const payload: any = {
        username: data.username,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        activo: data.activo,
      }

      if (data.password) {
        payload.password = data.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar usuario")
      }

      toast({
        title: usuario ? "Usuario actualizado" : "Usuario creado",
        description: usuario
          ? "El usuario se ha actualizado correctamente."
          : "El usuario se ha creado correctamente.",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el usuario. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nombre de Usuario *</Label>
        <Input
          id="username"
          {...register("username", { required: "El nombre de usuario es requerido" })}
          placeholder="usuario123"
          disabled={!!usuario}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      {!usuario && (
        <>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
              placeholder="••••••"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                required: "Debes confirmar la contraseña",
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              })}
              placeholder="••••••"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </>
      )}

      {usuario && (
        <div className="space-y-2">
          <Label htmlFor="password">Nueva Contraseña (dejar vacío para mantener la actual)</Label>
          <Input
            id="password"
            type="password"
            {...register("password", {
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres",
              },
            })}
            placeholder="••••••"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            {...register("nombre")}
            placeholder="Juan"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido</Label>
          <Input
            id="apellido"
            {...register("apellido")}
            placeholder="Pérez"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email", {
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

      <div className="flex items-center space-x-2">
        <Switch
          id="activo"
          checked={activo}
          onCheckedChange={(checked) => setValue("activo", checked)}
        />
        <Label htmlFor="activo" className="cursor-pointer">
          Usuario activo
        </Label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 w-full">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Guardando..." : usuario ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}



