"use client"

import { useState } from "react"
import { usePlantillasTareas } from "@/hooks/use-plantillas-tareas"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlantillaTareaForm } from "@/components/forms/plantilla-tarea-form"
import { PlantillaTarea } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function PlantillasTareasPage() {
  const { plantillas, loading, refetch } = usePlantillasTareas()
  const { toast } = useToast()
  const [editingPlantilla, setEditingPlantilla] = useState<PlantillaTarea | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return

    try {
      const response = await fetch(`/api/plantillas-tareas/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se eliminó correctamente",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  const columns = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "descripcion",
      header: "Descripción",
    },
    {
      key: "tiempoEstimado",
      header: "Tiempo Estimado",
      render: (value: number) => `${value || 0} min`,
    },
    {
      key: "costoEstimado",
      header: "Costo Estimado",
      render: (value: number) => formatCurrency(value || 0),
    },
    {
      key: "pasos",
      header: "Pasos",
      render: (value: string[]) => `${value?.length || 0} paso(s)`,
    },
    {
      key: "activa",
      header: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Activa" : "Inactiva"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (_: any, row: PlantillaTarea) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingPlantilla(row)
              setIsDialogOpen(true)
            }}
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
          <h1 className="text-3xl font-bold">Plantillas de Tareas</h1>
          <p className="text-muted-foreground">Gestiona las plantillas de tareas reutilizables</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingPlantilla(undefined)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlantilla ? "Editar Plantilla" : "Nueva Plantilla"}
              </DialogTitle>
            </DialogHeader>
            <PlantillaTareaForm
              plantilla={editingPlantilla}
              onSuccess={() => {
                setIsDialogOpen(false)
                setEditingPlantilla(undefined)
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando plantillas...</div>
      ) : (
        <DataTable
          columns={columns}
          data={plantillas}
          searchKey="nombre"
        />
      )}
    </div>
  )
}

