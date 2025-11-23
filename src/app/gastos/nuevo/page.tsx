"use client"

import { useRouter } from "next/navigation"
import { GastoForm } from "@/components/forms/gasto-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevoGastoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Gasto creado",
      description: "El gasto se ha creado exitosamente.",
    })
    router.push("/gastos")
  }

  const handleCancel = () => {
    router.push("/gastos")
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/gastos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Gastos
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Gasto</h1>
        <p className="text-muted-foreground">Completa los datos del nuevo gasto</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <GastoForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

