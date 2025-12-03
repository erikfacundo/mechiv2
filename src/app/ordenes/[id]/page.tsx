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
import { isR2Url } from "@/lib/r2-storage"

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
          url: foto.url,
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando orden...</p>
        </div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Orden no encontrada</p>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile First */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/ordenes")}
          className="self-start sm:self-auto w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
              Orden #{orden.numeroOrden}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
              Detalle de la orden de trabajo
            </p>
          </div>
          <Button 
            onClick={() => router.push(`/ordenes/${orden.id}/editar`)} 
            className="w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Progreso y Resumen de Costos - 2 columnas en tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Progreso */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Progreso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium">Completitud</span>
                <span className="text-xs sm:text-sm font-semibold">{porcentajeCompletitud}%</span>
              </div>
              <Progress value={porcentajeCompletitud} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Tareas completadas</p>
              <p className="text-base sm:text-lg font-semibold">
                {checklist.filter(t => t.completado).length} / {checklist.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Costos */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Resumen de Costos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-muted-foreground">Mano de Obra</span>
              <span className="font-medium text-right">${(orden.manoObra || orden.costoTotal || 0).toLocaleString("es-AR")}</span>
            </div>
            {totalGastos > 0 && (
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground">Gastos Internos</span>
                <span className="font-medium text-right">${totalGastos.toLocaleString("es-AR")}</span>
              </div>
            )}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base font-semibold">Total a Facturar</span>
                <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-500">
                  ${(orden.manoObra || orden.costoTotal || 0).toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Mobile First Grid */}
      <div className="space-y-4 sm:space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Mobile: Stacked, Tablet+: Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">N° Orden</div>
                  <div className="font-semibold text-sm sm:text-base break-words">{orden.numeroOrden}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">Estado</div>
                  <div>
                    <Badge variant={getEstadoBadgeVariant(orden.estado)} className="text-xs">
                      {orden.estado}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">Cliente</div>
                  <div className="font-medium text-sm sm:text-base break-words">
                    {cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A"}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">Vehículo</div>
                  <div className="font-medium text-sm sm:text-base break-words">
                    {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}` : "N/A"}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-muted-foreground">Fecha Ingreso</div>
                  <div className="font-medium text-sm sm:text-base">
                    {new Date(orden.fechaIngreso).toLocaleDateString("es-AR")}
                  </div>
                </div>
                
                {orden.fechaEntrega && (
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">Fecha Entrega</div>
                    <div className="font-medium text-sm sm:text-base">
                      {new Date(orden.fechaEntrega).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-3 sm:pt-4 border-t space-y-2">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Descripción</div>
                <div className="text-sm sm:text-base">{orden.descripcion || "Sin descripción"}</div>
              </div>
              
              {orden.servicios && orden.servicios.length > 0 && (
                <div className="pt-3 sm:pt-4 border-t space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">Servicios</div>
                  <ul className="list-disc list-inside text-sm sm:text-base space-y-1">
                    {orden.servicios.map((servicio, index) => (
                      <li key={index}>{servicio}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {orden.observaciones && (
                <div className="pt-3 sm:pt-4 border-t space-y-2">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">Observaciones</div>
                  <div className="text-sm sm:text-base">{orden.observaciones}</div>
                </div>
              )}
              {orden.esMantenimiento && orden.fechaRecordatorioMantenimiento && (
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
                      Recordatorio de Mantenimiento
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      {new Date(orden.fechaRecordatorioMantenimiento).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  Fotos Estado Inicial
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {fotosIniciales.map((foto, index) => (
                    <button
                      key={foto.id}
                      onClick={() => openCarousel(fotosIniciales, index)}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <Image
                        src={foto.url || foto.dataUrl || ''}
                        alt={`Foto inicial ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 150px"
                        unoptimized={!!foto.url && isR2Url(foto.url)}
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fotos Estado Final */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                Fotos Estado Final
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {fotosFinales.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
                  {fotosFinales.map((foto, index) => (
                    <button
                      key={foto.id}
                      onClick={() => openCarousel(fotosFinales, index)}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <Image
                        src={foto.url || foto.dataUrl || ''}
                        alt={`Foto final ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 150px"
                        unoptimized={!!foto.url && isR2Url(foto.url)}
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
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

