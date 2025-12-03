"use client"

import { useRouter } from "next/navigation"
import { OrdenMultiStepForm } from "@/components/forms/orden-multistep-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"

export default function NuevaOrdenPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/ordenes")
  }

  const handleCancel = () => {
    router.push("/ordenes")
  }

  return (
    <FormPageLayout
      title="Nueva Orden de Trabajo"
      description="Crea una nueva orden paso a paso"
      backUrl="/ordenes"
      className="max-w-6xl"
    >
      <OrdenMultiStepForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

