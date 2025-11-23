"use client"

import { useRouter } from "next/navigation"
import { OrdenForm } from "@/components/forms/orden-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevaOrdenPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Orden creada",
      description: "La orden se ha creado exitosamente.",
    })
    router.push("/ordenes")
  }

  const handleCancel = () => {
    router.push("/ordenes")
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/ordenes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Órdenes
        </Button>
        <h1 className="text-3xl font-bold">Nueva Orden de Trabajo</h1>
        <p className="text-muted-foreground">Completa los datos de la nueva orden</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <OrdenForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

