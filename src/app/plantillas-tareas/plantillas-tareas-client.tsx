"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { PlantillaTarea } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface PlantillasTareasClientProps {
  plantillas: PlantillaTarea[]
}

export function PlantillasTareasClient({ plantillas: initialPlantillas }: PlantillasTareasClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [plantillas, setPlantillas] = useState(initialPlantillas)

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
      
      setPlantillas(plantillas.filter(p => p.id !== id))
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
            onClick={() => router.push(`/plantillas-tareas/${row.id}/editar`)}
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
    <div className="space-y-6">
      <PageHeader
        title="Plantillas de Tareas"
        description="Gestiona las plantillas de tareas reutilizables"
        action={
          <Button onClick={() => router.push("/plantillas-tareas/nuevo")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={plantillas}
        searchKey="nombre"
      />
    </div>
  )
}

