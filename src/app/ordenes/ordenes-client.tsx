"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { OrdenTrabajo, EstadoOrden, Cliente, Vehiculo } from "@/types"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrdenesClientProps {
  ordenes: OrdenTrabajo[]
  clientes: Cliente[]
  vehiculos: Vehiculo[]
}

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

export function OrdenesClient({ ordenes: initialOrdenes, clientes, vehiculos }: OrdenesClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoOrden | "Todos">("Todos")
  const [ordenes, setOrdenes] = useState(initialOrdenes)

  const clientesMap = useMemo(() => {
    const map: Record<string, { nombre: string; apellido: string }> = {}
    clientes.forEach(c => {
      map[c.id] = { nombre: c.nombre, apellido: c.apellido }
    })
    return map
  }, [clientes])

  const vehiculosMap = useMemo(() => {
    const map: Record<string, { marca: string; modelo: string; patente: string }> = {}
    vehiculos.forEach(v => {
      map[v.id] = { marca: v.marca, modelo: v.modelo, patente: v.patente }
    })
    return map
  }, [vehiculos])

  const filteredOrdenes = useMemo(() => {
    if (estadoFiltro === "Todos") {
      return ordenes
    }
    return ordenes.filter(o => o.estado === estadoFiltro)
  }, [ordenes, estadoFiltro])

  const handleCreate = () => {
    router.push("/ordenes/nuevo")
  }

  const handleEdit = (orden: OrdenTrabajo) => {
    router.push(`/ordenes/${orden.id}/editar`)
  }

  const handleViewDetail = (orden: OrdenTrabajo) => {
    router.push(`/ordenes/${orden.id}`)
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

      // Actualizar estado local
      setOrdenes(ordenes.filter(o => o.id !== orden.id))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden.",
        variant: "destructive",
      })
    }
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
    <div className="space-y-4 sm:space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Órdenes de Trabajo</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestión de órdenes de trabajo
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={estadoFiltro} onValueChange={(value) => setEstadoFiltro(value as EstadoOrden | "Todos")}>
          <SelectTrigger className="w-full sm:w-[180px]">
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

      <DataTable
        data={filteredOrdenes}
        columns={columns}
        searchKey="numeroOrden"
        searchPlaceholder="Buscar por número de orden..."
        actions={(orden) => (
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetail(orden as OrdenTrabajo)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 flex-shrink-0"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Ver</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(orden as OrdenTrabajo)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(orden as OrdenTrabajo)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Eliminar</span>
            </Button>
          </div>
        )}
      />
    </div>
  )
}

