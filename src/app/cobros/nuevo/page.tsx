"use client"

import { useRouter } from "next/navigation"
import { CobroForm } from "@/components/forms/cobro-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevoCobroPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Cobro creado",
      description: "El cobro se ha creado exitosamente.",
    })
    router.push("/cobros")
  }

  const handleCancel = () => {
    router.push("/cobros")
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/cobros")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Cobros
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Nuevo Cobro</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Completa los datos del nuevo cobro</p>
      </div>

      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <CobroForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

