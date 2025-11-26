"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Car, Wrench, Eye, Phone, Mail, MapPin, Calendar } from "lucide-react"
import { useCliente } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { useState, useEffect } from "react"
import { OrdenTrabajo, Vehiculo } from "@/types"

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

export default function ClienteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { cliente, loading } = useCliente(id)
  const { vehiculos } = useVehiculos()
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [loadingOrdenes, setLoadingOrdenes] = useState(true)

  // Obtener vehículos del cliente
  const vehiculosCliente = vehiculos.filter(v => v.clienteId === id)

  // Obtener órdenes del cliente
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch(`/api/ordenes`)
        if (response.ok) {
          const allOrdenes = await response.json()
          const ordenesCliente = allOrdenes.filter((o: OrdenTrabajo) => o.clienteId === id)
          setOrdenes(ordenesCliente)
        }
      } catch (error) {
        console.error('Error obteniendo órdenes:', error)
      } finally {
        setLoadingOrdenes(false)
      }
    }
    if (id) {
      fetchOrdenes()
    }
  }, [id])

  // Calcular estadísticas
  const totalOrdenes = ordenes.length
  const ordenesPendientes = ordenes.filter(o => o.estado === "Pendiente").length
  const ordenesEnProceso = ordenes.filter(o => o.estado === "En Proceso").length
  const totalFacturado = ordenes
    .filter(o => o.estado === "Entregado" || o.estado === "Completado")
    .reduce((sum, o) => sum + (o.costoTotal || 0), 0)
  const gananciaManoObra = ordenes
    .filter(o => o.estado === "Entregado" || o.estado === "Completado")
    .reduce((sum, o) => sum + (o.manoObra || 0), 0)

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">Cargando cliente...</div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
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
    <div className="container mx-auto py-4 sm:py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/clientes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {cliente.nombre} {cliente.apellido}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Detalle del cliente</p>
          </div>
          <Button onClick={() => router.push(`/clientes/${cliente.id}/editar`)} className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Editar Cliente
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalOrdenes}</div>
            <p className="text-xs text-muted-foreground">Total Órdenes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{vehiculosCliente.length}</div>
            <p className="text-xs text-muted-foreground">Vehículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              ${gananciaManoObra.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">Ganancia (Mano Obra)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              ${totalFacturado.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">Total Facturado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono:</span>
                </div>
                <div className="font-medium break-words text-right">{cliente.telefono}</div>
                
                <div className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email:</span>
                </div>
                <div className="font-medium break-words text-right">{cliente.email}</div>
                
                {cliente.direccion && (
                  <>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Dirección:</span>
                    </div>
                    <div className="font-medium break-words text-right">{cliente.direccion}</div>
                  </>
                )}
                
                <div className="text-muted-foreground">DNI:</div>
                <div className="font-medium text-right">{cliente.dni}</div>
                
                <div className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Registrado:</span>
                </div>
                <div className="font-medium text-right">
                  {new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehículos y Órdenes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehículos del Cliente */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehículos ({vehiculosCliente.length})
                </CardTitle>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/vehiculos/nuevo?clienteId=${id}`)}
                    className="w-full sm:w-auto"
                  >
                    Agregar Vehículo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {vehiculosCliente.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay vehículos registrados</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/vehiculos/nuevo?clienteId=${id}`)}
                  >
                    Agregar Primer Vehículo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehiculosCliente.map((vehiculo) => (
                    <div
                      key={vehiculo.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/vehiculos/${vehiculo.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {vehiculo.marca} {vehiculo.modelo}
                          </p>
                          <Badge variant="outline">{vehiculo.patente}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {vehiculo.año} • {vehiculo.kilometraje.toLocaleString("es-AR")} km
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/vehiculos/${vehiculo.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Órdenes del Cliente */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Historial de Órdenes ({totalOrdenes})
                </CardTitle>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/ordenes/nuevo?clienteId=${id}`)}
                    className="w-full sm:w-auto"
                  >
                    Nueva Orden
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingOrdenes ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando órdenes...
                </div>
              ) : ordenes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay órdenes registradas</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/ordenes/nuevo?clienteId=${id}`)}
                  >
                    Crear Primera Orden
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordenes.map((orden) => (
                    <div
                      key={orden.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/ordenes/${orden.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">Orden #{orden.numeroOrden}</p>
                          <Badge variant={getEstadoBadgeVariant(orden.estado)}>
                            {orden.estado}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {orden.descripcion}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {new Date(orden.fechaIngreso).toLocaleDateString("es-AR")}
                          </span>
                          <span className="font-semibold text-foreground">
                            ${(orden.costoTotal || 0).toLocaleString("es-AR")}
                          </span>
                          {orden.manoObra && (
                            <span className="text-green-600">
                              Mano obra: ${orden.manoObra.toLocaleString("es-AR")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/ordenes/${orden.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

