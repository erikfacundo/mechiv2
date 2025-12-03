"use client"

import { useRouter } from "next/navigation"
import { CobroForm } from "@/components/forms/cobro-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
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
    <FormPageLayout
      title="Nuevo Cobro"
      description="Completa los datos del nuevo cobro"
      backUrl="/cobros"
    >
      <CobroForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

