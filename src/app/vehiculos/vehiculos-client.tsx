"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Vehiculo, Cliente } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useMemo } from "react"

interface VehiculosClientProps {
  vehiculos: Vehiculo[]
  clientes: Cliente[]
}

export function VehiculosClient({ vehiculos: initialVehiculos, clientes }: VehiculosClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [vehiculos, setVehiculos] = useState(initialVehiculos)

  const clientesMap = useMemo(() => {
    const map: Record<string, { nombre: string; apellido: string }> = {}
    clientes.forEach(c => {
      map[c.id] = { nombre: c.nombre, apellido: c.apellido }
    })
    return map
  }, [clientes])

  const handleCreate = () => {
    router.push("/vehiculos/nuevo")
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    router.push(`/vehiculos/${vehiculo.id}/editar`)
  }

  const handleDelete = async (vehiculo: Vehiculo) => {
    if (!confirm(`¿Estás seguro de eliminar el vehículo ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/vehiculos/${vehiculo.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Vehículo eliminado",
        description: "El vehículo se ha eliminado correctamente.",
        variant: "success",
      })

      // Actualizar estado local
      setVehiculos(vehiculos.filter(v => v.id !== vehiculo.id))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo.",
        variant: "destructive",
      })
    }
  }

  const columns = [
    { key: "marca", header: "Marca" },
    { key: "modelo", header: "Modelo" },
    { key: "año", header: "Año" },
    { key: "patente", header: "Patente" },
    {
      key: "kilometraje",
      header: "Kilometraje",
      render: (value: number) => `${value.toLocaleString("es-AR")} km`,
    },
    {
      key: "clienteId",
      header: "Cliente",
      render: (value: string) => {
        const cliente = clientesMap[value]
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A"
      },
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestión de vehículos registrados
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      <DataTable
        data={vehiculos}
        columns={columns}
        searchKey="patente"
        searchPlaceholder="Buscar por patente..."
        actions={(vehiculo) => (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(vehiculo as Vehiculo)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(vehiculo as Vehiculo)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
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

