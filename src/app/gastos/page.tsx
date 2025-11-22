"use client"

import { useState } from "react"
import { useGastos } from "@/hooks/use-gastos"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GastoForm } from "@/components/forms/gasto-form"
import { Gasto } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GastosPage() {
  const { gastos, loading, refetch } = useGastos()
  const { toast } = useToast()
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return

    try {
      const response = await fetch(`/api/gastos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Gasto eliminado",
        description: "El gasto se eliminó correctamente",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('es-AR')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  const columns = [
    {
      header: "Fecha",
      accessorKey: "fecha",
      cell: ({ row }: any) => formatDate(row.original.fecha),
    },
    {
      header: "Categoría",
      accessorKey: "categoria",
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
    },
    {
      header: "Monto",
      accessorKey: "monto",
      cell: ({ row }: any) => formatCurrency(row.original.monto),
    },
    {
      header: "Método de Pago",
      accessorKey: "metodoPago",
    },
    {
      header: "Acciones",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingGasto(row.original)
              setIsDialogOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
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
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">Gestiona los gastos del taller</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingGasto(undefined)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGasto ? "Editar Gasto" : "Nuevo Gasto"}
              </DialogTitle>
            </DialogHeader>
            <GastoForm
              gasto={editingGasto}
              onSuccess={() => {
                setIsDialogOpen(false)
                setEditingGasto(undefined)
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={gastos}
        loading={loading}
        searchKey="descripcion"
      />
    </div>
  )
}

