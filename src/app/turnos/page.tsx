"use client"

import { useState } from "react"
import { useTurnos } from "@/hooks/use-turnos"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TurnoForm } from "@/components/forms/turno-form"
import { Turno } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"

export default function TurnosPage() {
  const { turnos, loading, refetch } = useTurnos()
  const { toast } = useToast()
  const { clientes } = useClientes()
  const { vehiculos } = useVehiculos()
  const [editingTurno, setEditingTurno] = useState<Turno | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
      header: "Fecha",
      accessorKey: "fecha",
      cell: ({ row }: any) => formatDate(row.original.fecha),
    },
    {
      header: "Hora",
      accessorKey: "hora",
    },
    {
      header: "Cliente",
      accessorKey: "clienteId",
      cell: ({ row }: any) => getClienteNombre(row.original.clienteId),
    },
    {
      header: "Vehículo",
      accessorKey: "vehiculoId",
      cell: ({ row }: any) => getVehiculoInfo(row.original.vehiculoId),
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ row }: any) => {
        const estado = row.original.estado
        const variant = estado === 'Completado' ? 'default' : estado === 'Cancelado' ? 'destructive' : estado === 'Confirmado' ? 'secondary' : 'outline'
        return <Badge variant={variant}>{estado}</Badge>
      },
    },
    {
      header: "Acciones",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingTurno(row.original)
              setIsDialogOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingTurno(undefined)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Turno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTurno ? "Editar Turno" : "Nuevo Turno"}
              </DialogTitle>
            </DialogHeader>
            <TurnoForm
              turno={editingTurno}
              onSuccess={() => {
                setIsDialogOpen(false)
                setEditingTurno(undefined)
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={turnos}
        loading={loading}
        searchKey="descripcion"
      />
    </div>
  )
}

