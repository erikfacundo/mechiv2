"use client"

import { useRouter, useParams } from "next/navigation"
import { ClienteForm } from "@/components/forms/cliente-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
import { useCliente } from "@/hooks/use-clientes"
import { useToast } from "@/hooks/use-toast"

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { cliente, loading } = useCliente(id)
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Cliente actualizado",
      description: "El cliente se ha actualizado exitosamente.",
    })
    router.push("/clientes")
  }

  const handleCancel = () => {
    router.push("/clientes")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Cliente no encontrado</p>
          <Button onClick={() => router.push("/clientes")}>
            Volver a Clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Cliente"
      description="Modifica los datos del cliente"
      backUrl="/clientes"
    >
      <ClienteForm cliente={cliente} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

