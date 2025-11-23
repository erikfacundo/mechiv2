"use client"

import { useRouter } from "next/navigation"
import { TurnoForm } from "@/components/forms/turno-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevoTurnoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Turno creado",
      description: "El turno se ha creado exitosamente.",
    })
    router.push("/turnos")
  }

  const handleCancel = () => {
    router.push("/turnos")
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/turnos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Turnos
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Turno</h1>
        <p className="text-muted-foreground">Completa los datos del nuevo turno</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <TurnoForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

