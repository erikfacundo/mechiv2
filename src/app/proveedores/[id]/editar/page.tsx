"use client"

import { useRouter, useParams } from "next/navigation"
import { ProveedorForm } from "@/components/forms/proveedor-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Proveedor } from "@/types"

export default function EditarProveedorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        const response = await fetch(`/api/proveedores/${id}`)
        if (!response.ok) throw new Error("Error al obtener proveedor")
        const data = await response.json()
        setProveedor(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el proveedor",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProveedor()
  }, [id, toast])

  const handleSuccess = () => {
    toast({
      title: "Proveedor actualizado",
      description: "El proveedor se ha actualizado exitosamente.",
    })
    router.push("/proveedores")
  }

  const handleCancel = () => {
    router.push("/proveedores")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando proveedor...</p>
        </div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Proveedor no encontrado</p>
          <Button onClick={() => router.push("/proveedores")}>
            Volver a Proveedores
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Proveedor"
      description="Modifica los datos del proveedor"
      backUrl="/proveedores"
    >
      <ProveedorForm proveedor={proveedor} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

