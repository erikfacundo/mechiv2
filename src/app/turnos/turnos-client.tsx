"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Turno, Cliente, Vehiculo } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"

interface TurnosClientProps {
  turnos: Turno[]
  clientes: Cliente[]
  vehiculos: Vehiculo[]
}

export function TurnosClient({ turnos: initialTurnos, clientes, vehiculos }: TurnosClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [turnos, setTurnos] = useState(initialTurnos)

  const clientesMap = useMemo(() => {
    const map: Record<string, string> = {}
    clientes.forEach(c => {
      map[c.id] = `${c.nombre} ${c.apellido}`
    })
    return map
  }, [clientes])

  const vehiculosMap = useMemo(() => {
    const map: Record<string, string> = {}
    vehiculos.forEach(v => {
      map[v.id] = `${v.marca} ${v.modelo} - ${v.patente}`
    })
    return map
  }, [vehiculos])

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
      
      setTurnos(turnos.filter(t => t.id !== id))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno",
        variant: "destructive",
      })
    }
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
      render: (value: string) => clientesMap[value] || value,
    },
    {
      key: "vehiculoId",
      header: "Vehículo",
      render: (value: string) => vehiculosMap[value] || value,
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
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/turnos/${row.id}/editar`)}
            className="flex-shrink-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Turnos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona los turnos de los clientes
          </p>
        </div>
        <Button onClick={() => router.push("/turnos/nuevo")} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Turno
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={turnos}
        searchKey="descripcion"
      />
    </div>
  )
}

