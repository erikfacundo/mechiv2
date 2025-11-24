"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Users, DollarSign } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { OrdenTrabajo, Cliente, Vehiculo } from "@/types"
import { useMemo } from "react"

interface DashboardClientProps {
  ordenes: OrdenTrabajo[]
  clientes: Cliente[]
  vehiculos: Vehiculo[]
}

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

export function DashboardClient({ ordenes, clientes, vehiculos }: DashboardClientProps) {
  const ordenesRecientes = useMemo(() => ordenes.slice(0, 5), [ordenes])
  const ordenesPendientes = useMemo(() => ordenes.filter(o => o.estado === "Pendiente").length, [ordenes])
  const ordenesEnProceso = useMemo(() => ordenes.filter(o => o.estado === "En Proceso").length, [ordenes])
  const totalClientes = clientes.length
  const totalVehiculos = vehiculos.length
  // Ganancia real: solo mano de obra (lo que cobramos)
  const gananciaMensual = useMemo(() => {
    return ordenes
      .filter(o => o.estado === "Entregado" || o.estado === "Completado")
      .reduce((sum, o) => sum + (o.manoObra || o.costoTotal || 0), 0)
  }, [ordenes])

  // Total facturado (mano de obra cobrada)
  const totalFacturado = useMemo(() => {
    return ordenes
      .filter(o => o.estado === "Entregado" || o.estado === "Completado")
      .reduce((sum, o) => sum + (o.manoObra || o.costoTotal || 0), 0)
  }, [ordenes])

  // Gastos internos (repuestos/materiales que compramos pero NO cobramos)
  const gastosInternos = useMemo(() => {
    return ordenes
      .filter(o => o.estado === "Entregado" || o.estado === "Completado")
      .reduce((sum, o) => {
        const gastosOrden = o.gastos?.reduce((gSum, g) => gSum + g.monto, 0) || 0
        return sum + gastosOrden
      }, 0)
  }, [ordenes])

  const ordenesColumns = [
    { key: "numeroOrden", header: "N° Orden" },
    { key: "fechaIngreso", header: "Fecha Ingreso", render: (value: Date | string) => new Date(value).toLocaleDateString("es-AR") },
    { key: "estado", header: "Estado", render: (value: string) => <Badge variant={getEstadoBadgeVariant(value)}>{value}</Badge> },
    { key: "costoTotal", header: "Costo", render: (value: number) => `$${value.toLocaleString("es-AR")}` },
  ]

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Resumen general del taller automotriz
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
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
              Ganancia (Mano de Obra)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${gananciaMensual.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Solo mano de obra cobrada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos Internos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${gastosInternos.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">
              Repuestos/materiales (no cobrados)
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

