"use client"

import { useRouter } from "next/navigation"
import { ProveedorForm } from "@/components/forms/proveedor-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevoProveedorPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Proveedor creado",
      description: "El proveedor se ha creado exitosamente.",
    })
    router.push("/proveedores")
  }

  const handleCancel = () => {
    router.push("/proveedores")
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/proveedores")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Proveedores
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Proveedor</h1>
        <p className="text-muted-foreground">Completa los datos del nuevo proveedor</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <ProveedorForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

