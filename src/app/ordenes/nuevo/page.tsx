"use client"

import { useRouter } from "next/navigation"
import { OrdenMultiStepForm } from "@/components/forms/orden-multistep-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NuevaOrdenPage() {
  const router = useRouter()

  const handleSuccess = () => {
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
        <p className="text-muted-foreground">Crea una nueva orden paso a paso</p>
      </div>

      <OrdenMultiStepForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}

