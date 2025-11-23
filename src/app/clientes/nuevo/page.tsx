"use client"

import { useRouter } from "next/navigation"
import { ClienteForm } from "@/components/forms/cliente-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/clientes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
        <p className="text-muted-foreground">Completa los datos del nuevo cliente</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <ClienteForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

