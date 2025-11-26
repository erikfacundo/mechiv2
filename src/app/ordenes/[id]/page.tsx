"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, CheckSquare, DollarSign, TrendingUp, Calendar, Image as ImageIcon, Camera } from "lucide-react"
import { useOrden } from "@/hooks/use-ordenes"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChecklistManager } from "@/components/ordenes/checklist-manager"
import { GastosManager } from "@/components/ordenes/gastos-manager"
import { TareaChecklist, GastoOrden, FotoOrden, FotoVehiculo } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { ImageCarousel } from "@/components/ui/image-carousel"
import { ImageUpload } from "@/components/ui/image-upload"
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

export default function OrdenDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { orden, loading, refetch } = useOrden(id)
  const { clientes } = useClientes()
  const { vehiculos } = useVehiculos()
  const { toast } = useToast()
  const [checklist, setChecklist] = useState<TareaChecklist[]>(orden?.checklist || [])
  const [gastos, setGastos] = useState<GastoOrden[]>(orden?.gastos || [])
  const [fotosIniciales, setFotosIniciales] = useState<FotoOrden[]>([])
  const [fotosFinales, setFotosFinales] = useState<FotoOrden[]>([])
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [carouselFotos, setCarouselFotos] = useState<FotoOrden[]>([])
  const [porcentajeCompletitud, setPorcentajeCompletitud] = useState(orden?.porcentajeCompletitud || 0)

  // Actualizar checklist, gastos y fotos cuando cambie la orden
  useEffect(() => {
    if (orden) {
      setChecklist(orden.checklist || [])
      setGastos(orden.gastos || [])
      setPorcentajeCompletitud(orden.porcentajeCompletitud || 0)
      const fotos = orden.fotos || []
      setFotosIniciales(fotos.filter(f => f.tipo === 'inicial'))
      setFotosFinales(fotos.filter(f => f.tipo === 'final'))
    }
  }, [orden])

  const handleChecklistChange = async (newChecklist: TareaChecklist[]) => {
    const nuevoPorcentaje = newChecklist.length > 0
      ? Math.round((newChecklist.filter(t => t.completado).length / newChecklist.length) * 100)
      : 0

    setChecklist(newChecklist)
    setPorcentajeCompletitud(nuevoPorcentaje)
    
    try {
      const response = await fetch(`/api/ordenes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist: newChecklist,
          porcentajeCompletitud: nuevoPorcentaje,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar checklist")
      }

      toast({
        title: "Checklist actualizado",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      setChecklist(orden?.checklist || [])
      setPorcentajeCompletitud(orden?.porcentajeCompletitud || 0)
      toast({
        title: "Error",
        description: "No se pudo actualizar el checklist",
        variant: "destructive",
      })
    }
  }

  const handleGastosChange = async (newGastos: GastoOrden[]) => {
    setGastos(newGastos)
    
    try {
      const totalGastos = newGastos.reduce((sum, g) => sum + g.monto, 0)
      const costoTotal = (orden?.manoObra || 0) + totalGastos

      const response = await fetch(`/api/ordenes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gastos: newGastos,
          costoTotal,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar gastos")
      }

      toast({
        title: "Gastos actualizados",
        description: "Los gastos se han guardado correctamente",
      })
    } catch (error) {
      setGastos(orden?.gastos || [])
      toast({
        title: "Error",
        description: "No se pudo actualizar los gastos",
        variant: "destructive",
      })
    }
  }

  const handleFotosFinalesChange = async (newFotos: (FotoOrden | FotoVehiculo)[]) => {
    const fotosFinales: FotoOrden[] = newFotos.map(foto => {
      if ('tipo' in foto) {
        return {
          ...foto,
          tipo: 'final' as const,
        }
      } else {
        return {
          id: foto.id,
          dataUrl: foto.dataUrl,
          fechaHora: foto.fechaHora,
          tipo: 'final' as const,
          descripcion: foto.descripcion,
        }
      }
    })
    
    setFotosFinales(fotosFinales)
    
    try {
      const todasLasFotos = [...fotosIniciales, ...fotosFinales]
      
      const response = await fetch(`/api/ordenes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fotos: todasLasFotos,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar fotos")
      }

      toast({
        title: "Fotos actualizadas",
        description: "Las fotos del estado final se han guardado correctamente",
      })
    } catch (error) {
      setFotosFinales(orden?.fotos?.filter(f => f.tipo === 'final') || [])
      toast({
        title: "Error",
        description: "No se pudo actualizar las fotos",
        variant: "destructive",
      })
    }
  }

  const openCarousel = (fotos: FotoOrden[], index: number) => {
    setCarouselFotos(fotos)
    setCarouselIndex(index)
    setCarouselOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">Cargando orden...</div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
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
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
  const costoTotalConGastos = (orden.manoObra || orden.costoTotal || 0) + totalGastos

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
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
            <h1 className="text-2xl sm:text-3xl font-bold">Orden #{orden.numeroOrden}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Detalle de la orden de trabajo</p>
          </div>
          <Button onClick={() => router.push(`/ordenes/${orden.id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">N° Orden:</div>
                <div className="font-semibold text-right break-words">{orden.numeroOrden}</div>
                
                <div className="text-muted-foreground">Estado:</div>
                <div className="text-right">
                  <Badge variant={getEstadoBadgeVariant(orden.estado)}>
                    {orden.estado}
                  </Badge>
                </div>
                
                <div className="text-muted-foreground">Cliente:</div>
                <div className="text-right break-words">
                  {cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A"}
                </div>
                
                <div className="text-muted-foreground">Vehículo:</div>
                <div className="text-right break-words">
                  {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}` : "N/A"}
                </div>
                
                <div className="text-muted-foreground">Fecha Ingreso:</div>
                <div className="text-right">
                  {new Date(orden.fechaIngreso).toLocaleDateString("es-AR")}
                </div>
                
                {orden.fechaEntrega && (
                  <>
                    <div className="text-muted-foreground">Fecha Entrega:</div>
                    <div className="text-right">
                      {new Date(orden.fechaEntrega).toLocaleDateString("es-AR")}
                    </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm pt-2 border-t">
                <div className="text-muted-foreground">Descripción:</div>
                <div className="text-right">{orden.descripcion}</div>
              </div>
              {orden.servicios && orden.servicios.length > 0 && (
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm pt-2 border-t">
                  <div className="text-muted-foreground">Servicios:</div>
                  <div className="text-right">
                    <ul className="list-disc list-inside text-sm">
                      {orden.servicios.map((servicio, index) => (
                        <li key={index}>{servicio}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {orden.observaciones && (
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm pt-2 border-t">
                  <div className="text-muted-foreground">Observaciones:</div>
                  <div className="text-right">{orden.observaciones}</div>
                </div>
              )}
              {orden.esMantenimiento && orden.fechaRecordatorioMantenimiento && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Recordatorio de Mantenimiento</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(orden.fechaRecordatorioMantenimiento).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Checklist de Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ChecklistManager
                checklist={checklist}
                onChecklistChange={handleChecklistChange}
                ordenId={id}
              />
            </CardContent>
          </Card>

          {/* Gastos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gastos de la Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <GastosManager
                gastos={gastos}
                onGastosChange={handleGastosChange}
              />
            </CardContent>
          </Card>

          {/* Fotos Estado Inicial */}
          {fotosIniciales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Fotos Estado Inicial
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {fotosIniciales.map((foto, index) => (
                    <button
                      key={foto.id}
                      onClick={() => openCarousel(fotosIniciales, index)}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <Image
                        src={foto.dataUrl}
                        alt={`Foto inicial ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 150px"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fotos Estado Final */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Fotos Estado Final
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {fotosFinales.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                  {fotosFinales.map((foto, index) => (
                    <button
                      key={foto.id}
                      onClick={() => openCarousel(fotosFinales, index)}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <Image
                        src={foto.dataUrl}
                        alt={`Foto final ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 150px"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Documenta el estado del vehículo al finalizar el trabajo
                </p>
                <ImageUpload
                  fotos={fotosFinales}
                  onFotosChange={handleFotosFinalesChange}
                  maxFotos={10}
                  label=""
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progreso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progreso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completitud</span>
                  <span className="text-sm font-semibold">{porcentajeCompletitud}%</span>
                </div>
                <Progress value={porcentajeCompletitud} className="h-2" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Tareas completadas</p>
                <p className="text-lg font-semibold">
                  {checklist.filter(t => t.completado).length} / {checklist.length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Costos */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Costos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mano de Obra</span>
                <span className="font-medium">${(orden.manoObra || orden.costoTotal || 0).toLocaleString("es-AR")}</span>
              </div>
              {totalGastos > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gastos Internos</span>
                  <span className="font-medium">${totalGastos.toLocaleString("es-AR")}</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="font-semibold">Total a Facturar</span>
                  <span className="text-lg font-bold text-green-600">
                    ${(orden.manoObra || orden.costoTotal || 0).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal carrusel de fotos */}
      {carouselFotos.length > 0 && (
        <ImageCarousel
          fotos={carouselFotos}
          isOpen={carouselOpen}
          onClose={() => setCarouselOpen(false)}
          initialIndex={carouselIndex}
          title={`Fotos de la orden ${orden.numeroOrden}`}
        />
      )}
    </div>
  )
}

