"use client"

import { useRouter } from "next/navigation"
import { ClienteForm } from "@/components/forms/cliente-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { useToast } from "@/hooks/use-toast"

export default function NuevoClientePage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Cliente creado",
      description: "El cliente se ha creado exitosamente.",
    })
    router.push("/clientes")
  }

  const handleCancel = () => {
    router.push("/clientes")
  }

  return (
    <FormPageLayout
      title="Nuevo Cliente"
      description="Completa los datos del nuevo cliente"
      backUrl="/clientes"
    >
      <ClienteForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

