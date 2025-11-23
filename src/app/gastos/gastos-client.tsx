"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Gasto } from "@/types"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface GastosClientProps {
  gastos: Gasto[]
}

export function GastosClient({ gastos: initialGastos }: GastosClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [gastos, setGastos] = useState(initialGastos)

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
      
      setGastos(gastos.filter(g => g.id !== id))
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
      key: "fecha",
      header: "Fecha",
      render: (value: Date | string) => formatDate(value),
    },
    {
      key: "categoria",
      header: "Categoría",
    },
    {
      key: "descripcion",
      header: "Descripción",
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
      key: "acciones",
      header: "Acciones",
      render: (_: any, row: Gasto) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/gastos/${row.id}/editar`)}
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
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">Gestiona los gastos del taller</p>
        </div>
        <Button onClick={() => router.push("/gastos/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={gastos}
        searchKey="descripcion"
      />
    </div>
  )
}

