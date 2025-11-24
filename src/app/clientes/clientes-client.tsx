"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Cliente } from "@/types"
import { Eye, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ClientesClientProps {
  clientes: Cliente[]
}

export function ClientesClient({ clientes: initialClientes }: ClientesClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [clientes, setClientes] = useState(initialClientes)

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

      // Actualizar estado local
      setClientes(clientes.filter(c => c.id !== cliente.id))
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

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestión de clientes del taller
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
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
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetail(cliente as Cliente)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Ver</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(cliente as Cliente)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(cliente as Cliente)}
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

