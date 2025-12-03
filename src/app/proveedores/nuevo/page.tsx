"use client"

import { useRouter } from "next/navigation"
import { ProveedorForm } from "@/components/forms/proveedor-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
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
    <FormPageLayout
      title="Nuevo Proveedor"
      description="Completa los datos del nuevo proveedor"
      backUrl="/proveedores"
    >
      <ProveedorForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

