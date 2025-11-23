"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOrdenes } from "@/hooks/use-ordenes"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { Wrench, Users, Car, DollarSign } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case "Entregado":
      return "default"
    case "Completado":
      return "secondary"
    case "En Proceso":
      return "outline"
    case "Pendiente":
      return "destructive"
    default:
      return "outline"
  }
}

export default function DashboardPage() {
  const { ordenes, loading: loadingOrdenes } = useOrdenes()
  const { clientes, loading: loadingClientes } = useClientes()
  const { vehiculos, loading: loadingVehiculos } = useVehiculos()

  const ordenesRecientes = ordenes.slice(0, 5)
  const ordenesPendientes = ordenes.filter(o => o.estado === "Pendiente").length
  const ordenesEnProceso = ordenes.filter(o => o.estado === "En Proceso").length
  const totalClientes = clientes.length
  const totalVehiculos = vehiculos.length
  const ingresosMensuales = ordenes
    .filter(o => o.estado === "Entregado" || o.estado === "Completado")
    .reduce((sum, o) => sum + o.costoTotal, 0)

  const loading = loadingOrdenes || loadingClientes || loadingVehiculos

  const ordenesColumns = [
    { key: "numeroOrden", header: "N° Orden" },
    { key: "fechaIngreso", header: "Fecha Ingreso", render: (value: Date | string) => new Date(value).toLocaleDateString("es-AR") },
    { key: "estado", header: "Estado", render: (value: string) => <Badge variant={getEstadoBadgeVariant(value)}>{value}</Badge> },
    { key: "costoTotal", header: "Costo", render: (value: number) => `$${value.toLocaleString("es-AR")}` },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del taller automotriz
          </p>
        </div>
        <div className="text-center py-8">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del taller automotriz
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes Pendientes
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordenesPendientes}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Proceso
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordenesEnProceso}</div>
            <p className="text-xs text-muted-foreground">
              Trabajando actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Mensuales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ingresosMensuales.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Total facturado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes Recientes</CardTitle>
          <CardDescription>
            Últimas 5 órdenes de trabajo registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={ordenesRecientes}
            columns={ordenesColumns}
            searchKey="numeroOrden"
            searchPlaceholder="Buscar por número de orden..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

