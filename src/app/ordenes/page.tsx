"use client"

import { useState, useEffect } from "react"
import { useOrdenes } from "@/hooks/use-ordenes"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { OrdenForm } from "@/components/forms/orden-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { OrdenTrabajo, EstadoOrden } from "@/types"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export default function OrdenesPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoOrden | "Todos">("Todos")
  const { ordenes, loading: loadingOrdenes, refetch } = useOrdenes(estadoFiltro)
  const { clientes } = useClientes()
  const { vehiculos } = useVehiculos()
  const { toast } = useToast()
  
  const [clientesMap, setClientesMap] = useState<Record<string, { nombre: string; apellido: string }>>({})
  const [vehiculosMap, setVehiculosMap] = useState<Record<string, { marca: string; modelo: string; patente: string }>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOrden, setEditingOrden] = useState<OrdenTrabajo | null>(null)
  const [selectedOrden, setSelectedOrden] = useState<OrdenTrabajo | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (clientes.length > 0) {
      const map: Record<string, { nombre: string; apellido: string }> = {}
      clientes.forEach(c => {
        map[c.id] = { nombre: c.nombre, apellido: c.apellido }
      })
      setClientesMap(map)
    }
  }, [clientes])

  useEffect(() => {
    if (vehiculos.length > 0) {
      const map: Record<string, { marca: string; modelo: string; patente: string }> = {}
      vehiculos.forEach(v => {
        map[v.id] = { marca: v.marca, modelo: v.modelo, patente: v.patente }
      })
      setVehiculosMap(map)
    }
  }, [vehiculos])

  const handleCreate = () => {
    setEditingOrden(null)
    setIsFormOpen(true)
  }

  const handleEdit = (orden: OrdenTrabajo) => {
    setEditingOrden(orden)
    setIsFormOpen(true)
  }

  const handleViewDetail = (orden: OrdenTrabajo) => {
    setSelectedOrden(orden)
    setIsDetailOpen(true)
  }

  const handleDelete = async (orden: OrdenTrabajo) => {
    if (!confirm(`¿Estás seguro de eliminar la orden ${orden.numeroOrden}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/ordenes/${orden.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Orden eliminada",
        description: "La orden se ha eliminado correctamente.",
        variant: "success",
      })

      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden.",
        variant: "destructive",
      })
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingOrden(null)
    refetch()
  }

  const columns = [
    { key: "numeroOrden", header: "N° Orden" },
    {
      key: "clienteId",
      header: "Cliente",
      render: (value: string) => {
        const cliente = clientesMap[value]
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A"
      },
    },
    {
      key: "vehiculoId",
      header: "Vehículo",
      render: (value: string) => {
        const vehiculo = vehiculosMap[value]
        return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}` : "N/A"
      },
    },
    {
      key: "fechaIngreso",
      header: "Fecha Ingreso",
      render: (value: Date) => new Date(value).toLocaleDateString("es-AR"),
    },
    {
      key: "estado",
      header: "Estado",
      render: (value: string) => (
        <Badge variant={getEstadoBadgeVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: "costoTotal",
      header: "Costo Total",
      render: (value: number) => `$${value.toLocaleString("es-AR")}`,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Trabajo</h1>
          <p className="text-muted-foreground">
            Gestión de órdenes de trabajo
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={estadoFiltro} onValueChange={(value) => setEstadoFiltro(value as EstadoOrden | "Todos")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="En Proceso">En Proceso</SelectItem>
            <SelectItem value="Completado">Completado</SelectItem>
            <SelectItem value="Entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loadingOrdenes ? (
        <div className="text-center py-8">Cargando órdenes...</div>
      ) : (
        <DataTable
          data={ordenes}
          columns={columns}
          searchKey="numeroOrden"
          searchPlaceholder="Buscar por número de orden..."
          actions={(orden) => (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetail(orden as OrdenTrabajo)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(orden as OrdenTrabajo)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(orden as OrdenTrabajo)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrden ? "Editar Orden" : "Nueva Orden"}
            </DialogTitle>
            <DialogDescription>
              {editingOrden
                ? "Modifica la información de la orden."
                : "Completa los datos para crear una nueva orden de trabajo."}
            </DialogDescription>
          </DialogHeader>
          <OrdenForm
            orden={editingOrden || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle de la Orden</DialogTitle>
            <DialogDescription>
              Información completa de la orden de trabajo
            </DialogDescription>
          </DialogHeader>
          {selectedOrden && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">N° Orden</p>
                  <p className="text-sm font-semibold">{selectedOrden.numeroOrden}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={getEstadoBadgeVariant(selectedOrden.estado)}>
                    {selectedOrden.estado}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="text-sm">
                    {clientesMap[selectedOrden.clienteId] 
                      ? `${clientesMap[selectedOrden.clienteId].nombre} ${clientesMap[selectedOrden.clienteId].apellido}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                  <p className="text-sm">
                    {vehiculosMap[selectedOrden.vehiculoId]
                      ? `${vehiculosMap[selectedOrden.vehiculoId].marca} ${vehiculosMap[selectedOrden.vehiculoId].modelo} - ${vehiculosMap[selectedOrden.vehiculoId].patente}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Ingreso</p>
                  <p className="text-sm">
                    {new Date(selectedOrden.fechaIngreso).toLocaleDateString("es-AR")}
                  </p>
                </div>
                {selectedOrden.fechaEntrega && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Entrega</p>
                    <p className="text-sm">
                      {new Date(selectedOrden.fechaEntrega).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Costo Total</p>
                  <p className="text-sm font-semibold">
                    ${selectedOrden.costoTotal.toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-sm">{selectedOrden.descripcion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Servicios</p>
                <ul className="list-disc list-inside text-sm">
                  {selectedOrden.servicios.map((servicio, index) => (
                    <li key={index}>{servicio}</li>
                  ))}
                </ul>
              </div>
              {selectedOrden.observaciones && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                  <p className="text-sm">{selectedOrden.observaciones}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

