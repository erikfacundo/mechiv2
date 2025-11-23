"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import { useCliente } from "@/hooks/use-clientes"

export default function ClienteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { cliente, loading } = useCliente(id)

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">Cargando cliente...</div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Cliente no encontrado</p>
          <Button onClick={() => router.push("/clientes")}>
            Volver a Clientes
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
          onClick={() => router.push("/clientes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {cliente.nombre} {cliente.apellido}
            </h1>
            <p className="text-muted-foreground">Detalle del cliente</p>
          </div>
          <Button onClick={() => router.push(`/clientes/${cliente.id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Nombre Completo
            </p>
            <p className="text-sm">
              {cliente.nombre} {cliente.apellido}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">DNI</p>
            <p className="text-sm">{cliente.dni}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Teléfono
            </p>
            <p className="text-sm">{cliente.telefono}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{cliente.email}</p>
          </div>
          {cliente.direccion && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Dirección
              </p>
              <p className="text-sm">{cliente.direccion}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Fecha de Registro
            </p>
            <p className="text-sm">
              {new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

