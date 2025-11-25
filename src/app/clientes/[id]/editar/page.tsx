"use client"

import { useRouter, useParams } from "next/navigation"
import { ClienteForm } from "@/components/forms/cliente-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">Cargando cliente...</div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Cliente no encontrado</p>
          <Button onClick={() => router.push("/clientes")}>
            Volver a Clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/clientes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Editar Cliente</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Modifica los datos del cliente</p>
      </div>

      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <ClienteForm cliente={cliente} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

