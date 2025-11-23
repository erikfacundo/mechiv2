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
      key: "fecha",
      header: "Fecha",
      render: (value: Date | string) => formatDate(value),
    },
    {
      key: "monto",
      header: "Monto",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "metodoPago",
      header: "Método de Pago",
    },
    {
      key: "estado",
      header: "Estado",
      render: (value: string) => {
        const variant = value === 'Completado' ? 'default' : value === 'Cancelado' ? 'destructive' : 'outline'
        return <Badge variant={variant}>{value}</Badge>
      },
    },
    {
      key: "numeroComprobante",
      header: "Comprobante",
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (_: any, row: Cobro) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingCobro(row)
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

      {loading ? (
        <div className="text-center py-8">Cargando cobros...</div>
      ) : (
        <DataTable
          columns={columns}
          data={cobros}
          searchKey="numeroComprobante"
        />
      )}
    </div>
  )
}

