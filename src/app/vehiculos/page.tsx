"use client"

import { useVehiculos } from "@/hooks/use-vehiculos"
import { useClientes } from "@/hooks/use-clientes"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VehiculoForm } from "@/components/forms/vehiculo-form"
import { Vehiculo } from "@/types"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VehiculosPage() {
  const { vehiculos, loading: loadingVehiculos, refetch } = useVehiculos()
  const { clientes, loading: loadingClientes } = useClientes()
  const { toast } = useToast()
  const [clientesMap, setClientesMap] = useState<Record<string, { nombre: string; apellido: string }>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null)

  useEffect(() => {
    if (clientes.length > 0) {
      const map: Record<string, { nombre: string; apellido: string }> = {}
      clientes.forEach(c => {
        map[c.id] = { nombre: c.nombre, apellido: c.apellido }
      })
      setClientesMap(map)
    }
  }, [clientes])

  const handleCreate = () => {
    setEditingVehiculo(null)
    setIsFormOpen(true)
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo)
    setIsFormOpen(true)
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

      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el vehículo.",
        variant: "destructive",
      })
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingVehiculo(null)
    refetch()
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

  if (loadingVehiculos || loadingClientes) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-muted-foreground">
            Gestión de vehículos registrados
          </p>
        </div>
        <div className="text-center py-8">Cargando vehículos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-muted-foreground">
            Gestión de vehículos registrados
          </p>
        </div>
        <Button onClick={handleCreate}>
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(vehiculo as Vehiculo)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(vehiculo as Vehiculo)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
            </DialogTitle>
            <DialogDescription>
              {editingVehiculo
                ? "Modifica la información del vehículo."
                : "Completa los datos para registrar un nuevo vehículo."}
            </DialogDescription>
          </DialogHeader>
          <VehiculoForm
            vehiculo={editingVehiculo || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

