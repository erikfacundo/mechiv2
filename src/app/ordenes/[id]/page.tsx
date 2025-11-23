"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import { useOrden } from "@/hooks/use-ordenes"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { Badge } from "@/components/ui/badge"

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case "Entregado":
      return "default"
    case "Completado":
      return "secondary"
    case "En Proceso":
      return "outline"
    case "Pendiente":
      return "destructive"
    default:
      return "outline"
  }
}

export default function OrdenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { orden, loading } = useOrden(id)
  const { clientes } = useClientes()
  const { vehiculos } = useVehiculos()

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">Cargando orden...</div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Orden no encontrada</p>
          <Button onClick={() => router.push("/ordenes")}>
            Volver a Órdenes
          </Button>
        </div>
      </div>
    )
  }

  const cliente = clientes.find((c) => c.id === orden.clienteId)
  const vehiculo = vehiculos.find((v) => v.id === orden.vehiculoId)

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/ordenes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Órdenes
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orden #{orden.numeroOrden}</h1>
            <p className="text-muted-foreground">Detalle de la orden de trabajo</p>
          </div>
          <Button onClick={() => router.push(`/ordenes/${orden.id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">N° Orden</p>
            <p className="text-sm font-semibold">{orden.numeroOrden}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Estado</p>
            <Badge variant={getEstadoBadgeVariant(orden.estado)}>
              {orden.estado}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cliente</p>
            <p className="text-sm">
              {cliente
                ? `${cliente.nombre} ${cliente.apellido}`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
            <p className="text-sm">
              {vehiculo
                ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fecha Ingreso</p>
            <p className="text-sm">
              {new Date(orden.fechaIngreso).toLocaleDateString("es-AR")}
            </p>
          </div>
          {orden.fechaEntrega && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha Entrega</p>
              <p className="text-sm">
                {new Date(orden.fechaEntrega).toLocaleDateString("es-AR")}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Costo Total</p>
            <p className="text-sm font-semibold">
              ${orden.costoTotal.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Descripción</p>
          <p className="text-sm">{orden.descripcion}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Servicios</p>
          <ul className="list-disc list-inside text-sm mt-2">
            {orden.servicios.map((servicio, index) => (
              <li key={index}>{servicio}</li>
            ))}
          </ul>
        </div>
        {orden.observaciones && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
            <p className="text-sm">{orden.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  )
}

