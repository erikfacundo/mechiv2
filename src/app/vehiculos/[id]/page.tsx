"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, User, Wrench, Eye, Car, Calendar, Gauge, Image as ImageIcon } from "lucide-react"
import { useVehiculo } from "@/hooks/use-vehiculos"
import { useClientes } from "@/hooks/use-clientes"
import { useState, useEffect } from "react"
import { OrdenTrabajo } from "@/types"
import { ImageCarousel } from "@/components/ui/image-carousel"
import Image from "next/image"

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

export default function VehiculoDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { vehiculo, loading } = useVehiculo(id)
  const { clientes } = useClientes()
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [loadingOrdenes, setLoadingOrdenes] = useState(true)
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Obtener cliente propietario
  const cliente = vehiculo ? clientes.find(c => c.id === vehiculo.clienteId) : null

  // Obtener órdenes del vehículo
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch(`/api/ordenes`)
        if (response.ok) {
          const allOrdenes = await response.json()
          const ordenesVehiculo = allOrdenes.filter((o: OrdenTrabajo) => o.vehiculoId === id)
          setOrdenes(ordenesVehiculo)
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
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center py-8">Cargando vehículo...</div>
      </div>
    )
  }

  if (!vehiculo) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Vehículo no encontrado</p>
          <Button onClick={() => router.push("/vehiculos")}>
            Volver a Vehículos
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
          onClick={() => router.push("/vehiculos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Vehículos
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {vehiculo.marca} {vehiculo.modelo}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {vehiculo.patente} • {vehiculo.año}
            </p>
          </div>
          <Button onClick={() => router.push(`/vehiculos/${vehiculo.id}/editar`)} className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Editar Vehículo
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
            <div className="text-2xl font-bold">{vehiculo.kilometraje.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">Kilometraje</p>
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
        {/* Información del Vehículo */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información del Vehículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Marca/Modelo:</span>
                  <span className="font-medium">{vehiculo.marca} {vehiculo.modelo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Patente:</span>
                  <Badge variant="outline">{vehiculo.patente}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Año:</span>
                  <span className="font-medium">{vehiculo.año}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Kilometraje:</span>
                  <span className="font-medium">{vehiculo.kilometraje.toLocaleString("es-AR")} km</span>
                </div>
                {vehiculo.color && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{vehiculo.color}</span>
                  </div>
                )}
                {vehiculo.tipoCombustible && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Combustible:</span>
                    <span className="font-medium">{vehiculo.tipoCombustible}</span>
                  </div>
                )}
              </div>

              {/* Cliente Propietario */}
              {cliente && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cliente Propietario</span>
                  </div>
                  <div className="pl-6">
                    <p className="font-semibold">{cliente.nombre} {cliente.apellido}</p>
                    <p className="text-xs text-muted-foreground">{cliente.telefono}</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-1"
                      onClick={() => router.push(`/clientes/${cliente.id}`)}
                    >
                      Ver detalle del cliente →
                    </Button>
                  </div>
                </div>
              )}

              {/* Galería de fotos */}
              {vehiculo.fotos && vehiculo.fotos.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Fotos del Vehículo</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCarouselIndex(0)
                        setCarouselOpen(true)
                      }}
                    >
                      Ver todas ({vehiculo.fotos.length})
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {vehiculo.fotos.slice(0, 6).map((foto, index) => (
                      <button
                        key={foto.id}
                        onClick={() => {
                          setCarouselIndex(index)
                          setCarouselOpen(true)
                        }}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                      >
                        <Image
                          src={foto.dataUrl}
                          alt={`Foto ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 150px"
                        />
                        {index === 5 && vehiculo.fotos && vehiculo.fotos.length > 6 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                            +{vehiculo.fotos.length - 6}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historial de Órdenes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Historial de Servicios ({totalOrdenes})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/ordenes/nuevo?vehiculoId=${id}`)}
                >
                  Nueva Orden
                </Button>
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
                  <p>No hay órdenes registradas para este vehículo</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/ordenes/nuevo?vehiculoId=${id}`)}
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

      {/* Modal carrusel de fotos */}
      {vehiculo.fotos && vehiculo.fotos.length > 0 && (
        <ImageCarousel
          fotos={vehiculo.fotos}
          isOpen={carouselOpen}
          onClose={() => setCarouselOpen(false)}
          initialIndex={carouselIndex}
          title={`Fotos del vehículo - ${vehiculo.marca} ${vehiculo.modelo}`}
        />
      )}
    </div>
  )
}

