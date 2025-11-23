"use client"

import { useState } from "react"
import { useCategorias } from "@/hooks/use-categorias"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CategoriaForm } from "@/components/forms/categoria-form"
import { Categoria } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function CategoriasPage() {
  const { categorias, loading, refetch } = useCategorias()
  const { toast } = useToast()
  const [editingCategoria, setEditingCategoria] = useState<Categoria | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Categoría eliminada",
        description: "La categoría se eliminó correctamente",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
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
      render: (_: any, row: Categoria) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCategoria(row)
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
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">Gestiona las categorías del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingCategoria(undefined)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
            </DialogHeader>
            <CategoriaForm
              categoria={editingCategoria}
              onSuccess={() => {
                setIsDialogOpen(false)
                setEditingCategoria(undefined)
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando categorías...</div>
      ) : (
        <DataTable
          columns={columns}
          data={categorias}
          searchKey="nombre"
        />
      )}
    </div>
  )
}

