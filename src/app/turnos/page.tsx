"use client"

import { useRouter } from "next/navigation"
import { useTurnos } from "@/hooks/use-turnos"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Turno } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"

export default function TurnosPage() {
  const router = useRouter()
  const { turnos, loading, refetch } = useTurnos()
  const { toast } = useToast()
  const { clientes } = useClientes()
  const { vehiculos } = useVehiculos()

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este turno?")) return

    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Turno eliminado",
        description: "El turno se eliminó correctamente",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno",
        variant: "destructive",
      })
    }
  }

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : clienteId
  }

  const getVehiculoInfo = (vehiculoId: string) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId)
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}` : vehiculoId
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('es-AR')
  }

  const columns = [
    {
      key: "fecha",
      header: "Fecha",
      render: (value: Date | string) => formatDate(value),
    },
    {
      key: "hora",
      header: "Hora",
    },
    {
      key: "clienteId",
      header: "Cliente",
      render: (value: string) => getClienteNombre(value),
    },
    {
      key: "vehiculoId",
      header: "Vehículo",
      render: (value: string) => getVehiculoInfo(value),
    },
    {
      key: "descripcion",
      header: "Descripción",
    },
    {
      key: "estado",
      header: "Estado",
      render: (value: string) => {
        const variant = value === 'Completado' ? 'default' : value === 'Cancelado' ? 'destructive' : value === 'Confirmado' ? 'secondary' : 'outline'
        return <Badge variant={variant}>{value}</Badge>
      },
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (_: any, row: Turno) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/turnos/${row.id}/editar`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Turnos</h1>
          <p className="text-muted-foreground">Gestiona los turnos de los clientes</p>
        </div>
        <Button onClick={() => router.push("/turnos/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Turno
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando turnos...</div>
      ) : (
        <DataTable
          columns={columns}
          data={turnos}
          searchKey="descripcion"
        />
      )}
    </div>
  )
}

