"use client"

import { UsuarioForm } from "@/components/forms/usuario-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export default function NuevoUsuarioPage() {
  const router = useRouter()

  const handleSuccess = useCallback(() => {
    router.push("/usuarios")
  }, [router])

  return (
    <FormPageLayout
      title="Nuevo Usuario"
      description="Crear un nuevo usuario en el sistema"
      backUrl="/usuarios"
    >
      <UsuarioForm onSuccess={handleSuccess} />
    </FormPageLayout>
  )
}

