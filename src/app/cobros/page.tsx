"use client"

import { useState } from "react"
import { useCobros } from "@/hooks/use-cobros"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CobroForm } from "@/components/forms/cobro-form"
import { Cobro } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function CobrosPage() {
  const { cobros, loading, refetch } = useCobros()
  const { toast } = useToast()
  const [editingCobro, setEditingCobro] = useState<Cobro | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cobro?")) return

    try {
      const response = await fetch(`/api/cobros/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Cobro eliminado",
        description: "El cobro se eliminó correctamente",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cobro",
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
      header: "Monto",
      accessorKey: "monto",
      cell: ({ row }: any) => formatCurrency(row.original.monto),
    },
    {
      header: "Método de Pago",
      accessorKey: "metodoPago",
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ row }: any) => {
        const estado = row.original.estado
        const variant = estado === 'Completado' ? 'default' : estado === 'Cancelado' ? 'destructive' : 'outline'
        return <Badge variant={variant}>{estado}</Badge>
      },
    },
    {
      header: "Comprobante",
      accessorKey: "numeroComprobante",
    },
    {
      header: "Acciones",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCobro(row.original)
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
          <h1 className="text-3xl font-bold">Cobros</h1>
          <p className="text-muted-foreground">Gestiona los cobros realizados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingCobro(undefined)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cobro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCobro ? "Editar Cobro" : "Nuevo Cobro"}
              </DialogTitle>
            </DialogHeader>
            <CobroForm
              cobro={editingCobro}
              onSuccess={() => {
                setIsDialogOpen(false)
                setEditingCobro(undefined)
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={cobros}
        loading={loading}
        searchKey="numeroComprobante"
      />
    </div>
  )
}

