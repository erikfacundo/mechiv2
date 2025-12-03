"use client"

import { useUsuario } from "@/hooks/use-usuarios"
import { UsuarioForm } from "@/components/forms/usuario-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export default function UsuarioDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { usuario, loading } = useUsuario(params.id)

  const handleSuccess = useCallback(() => {
    router.push("/usuarios")
  }, [router])

  const handleCancel = useCallback(() => {
    router.push("/usuarios")
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Cargando usuario...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Usuario no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>Modificar información del usuario</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <UsuarioForm usuario={usuario} onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}



