"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader } from "@/components/ui/loader"

interface LoginFormData {
  username: string
  password: string
}

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [showLoader, setShowLoader] = useState(false)
  const [loaderResult, setLoaderResult] = useState<"success" | "error" | undefined>(undefined)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setShowLoader(true)
    setLoaderResult(undefined)
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al iniciar sesión")
      }

      // Guardar en localStorage (en producción usar cookies/httpOnly)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("username", data.username)

      // Mostrar loader con éxito
      setLoaderResult("success")

      // El loader manejará la redirección después de mostrar el resultado
    } catch (error) {
      // Mostrar loader con error
      setLoaderResult("error")
      
      // El toast se mostrará después de que termine el loader
      setTimeout(() => {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al iniciar sesión",
          variant: "destructive",
        })
      }, 100)
    }
  }

  const handleLoaderFinish = () => {
    setShowLoader(false)
    
    if (loaderResult === "success") {
      toast({
        title: "Login exitoso",
        description: "Bienvenido al sistema.",
      })
      router.push("/dashboard")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            {...register("username", { required: "El usuario es requerido" })}
            placeholder="admteam"
            disabled={showLoader}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            {...register("password", { required: "La contraseña es requerida" })}
            placeholder="••••••••"
            disabled={showLoader}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={showLoader}>
          Iniciar Sesión
        </Button>
      </form>

      {showLoader && (
        <Loader
          result={loaderResult}
          duration={2000}
          message={
            loaderResult === "success"
              ? "Sesión iniciada correctamente"
              : loaderResult === "error"
              ? "Error al iniciar sesión"
              : "Iniciando sesión..."
          }
          onFinish={handleLoaderFinish}
        />
      )}
    </>
  )
}

