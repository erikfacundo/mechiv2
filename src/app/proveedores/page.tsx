"use client"

import { useRouter } from "next/navigation"
import { useProveedores } from "@/hooks/use-proveedores"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Proveedor } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function ProveedoresPage() {
  const router = useRouter()
  const { proveedores, loading, refetch } = useProveedores()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return

    try {
      const response = await fetch(`/api/proveedores/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Proveedor eliminado",
        description: "El proveedor se eliminó correctamente",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
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
      key: "razonSocial",
      header: "Razón Social",
    },
    {
      key: "telefono",
      header: "Teléfono",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "tipo",
      header: "Tipo",
    },
    {
      key: "activo",
      header: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (_: any, row: Proveedor) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/proveedores/${row.id}/editar`)}
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
          <h1 className="text-3xl font-bold">Proveedores</h1>
          <p className="text-muted-foreground">Gestiona los proveedores del taller</p>
        </div>
        <Button onClick={() => router.push("/proveedores/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando proveedores...</div>
      ) : (
        <DataTable
          columns={columns}
          data={proveedores}
          searchKey="nombre"
        />
      )}
    </div>
  )
}

