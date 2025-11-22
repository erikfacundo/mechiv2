"use client"

import { useState } from "react"
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
import { ClienteForm } from "@/components/forms/cliente-form"
import { Cliente } from "@/types"
import { Eye, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ClientesPage() {
  const { clientes, loading, refetch } = useClientes()
  const { toast } = useToast()
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)

  const handleViewDetail = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCliente(null)
    setIsFormOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setIsFormOpen(true)
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

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingCliente(null)
    refetch()
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingCliente
                ? "Modifica la información del cliente."
                : "Completa los datos para crear un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            cliente={editingCliente || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Cliente</DialogTitle>
            <DialogDescription>
              Información completa del cliente
            </DialogDescription>
          </DialogHeader>
          {selectedCliente && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nombre Completo
                  </p>
                  <p className="text-sm">
                    {selectedCliente.nombre} {selectedCliente.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    DNI
                  </p>
                  <p className="text-sm">{selectedCliente.dni}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Teléfono
                  </p>
                  <p className="text-sm">{selectedCliente.telefono}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{selectedCliente.email}</p>
                </div>
                {selectedCliente.direccion && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Dirección
                    </p>
                    <p className="text-sm">{selectedCliente.direccion}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha de Registro
                  </p>
                  <p className="text-sm">
                    {new Date(selectedCliente.fechaRegistro).toLocaleDateString(
                      "es-AR"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

