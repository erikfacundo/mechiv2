"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { Cobro } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface CobrosClientProps {
  cobros: Cobro[]
}

export function CobrosClient({ cobros: initialCobros }: CobrosClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [cobros, setCobros] = useState(initialCobros)

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
      
      setCobros(cobros.filter(c => c.id !== id))
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
            onClick={() => router.push(`/cobros/${row.id}/editar`)}
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
        title="Cobros"
        description="Gestiona los cobros realizados"
        action={
          <Button onClick={() => router.push("/cobros/nuevo")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cobro
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={cobros}
        searchKey="numeroComprobante"
      />
    </div>
  )
}

