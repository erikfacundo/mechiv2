"use client"

import { useRouter, useParams } from "next/navigation"
import { ProveedorForm } from "@/components/forms/proveedor-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">Cargando proveedor...</div>
      </div>
    )
  }

  if (!proveedor) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Proveedor no encontrado</p>
          <Button onClick={() => router.push("/proveedores")}>
            Volver a Proveedores
          </Button>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold">Editar Proveedor</h1>
        <p className="text-muted-foreground">Modifica los datos del proveedor</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <ProveedorForm proveedor={proveedor} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

