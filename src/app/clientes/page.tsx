"use client"

import { useRouter } from "next/navigation"
import { useClientes } from "@/hooks/use-clientes"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Cliente } from "@/types"
import { Eye, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ClientesPage() {
  const router = useRouter()
  const { clientes, loading, refetch } = useClientes()
  const { toast } = useToast()

  const handleViewDetail = (cliente: Cliente) => {
    router.push(`/clientes/${cliente.id}`)
  }

  const handleCreate = () => {
    router.push("/clientes/nuevo")
  }

  const handleEdit = (cliente: Cliente) => {
    router.push(`/clientes/${cliente.id}/editar`)
  }

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`¿Estás seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Cliente eliminado",
        description: "El cliente se ha eliminado correctamente.",
        variant: "success",
      })

      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive",
      })
    }
  }


  const columns = [
    { key: "nombre", header: "Nombre" },
    { key: "apellido", header: "Apellido" },
    { key: "dni", header: "DNI" },
    { key: "telefono", header: "Teléfono" },
    { key: "email", header: "Email" },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestión de clientes del taller
          </p>
        </div>
        <div className="text-center py-8">Cargando clientes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestión de clientes del taller
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <DataTable
        data={clientes}
        columns={columns}
        searchKey="nombre"
        searchPlaceholder="Buscar por nombre..."
        actions={(cliente) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetail(cliente as Cliente)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(cliente as Cliente)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(cliente as Cliente)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

    </div>
  )
}

