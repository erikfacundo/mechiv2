"use client"

import { useState } from "react"
import { GastoOrden } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Upload, FileText, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GastosManagerProps {
  gastos: GastoOrden[]
  onGastosChange: (gastos: GastoOrden[]) => void
}

export function GastosManager({ gastos, onGastosChange }: GastosManagerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [nuevoGasto, setNuevoGasto] = useState({
    descripcion: "",
    monto: 0,
  })
  const [uploadingFactura, setUploadingFactura] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFactura(true)
    try {
      // Por ahora simulamos la subida, después implementaremos Firebase Storage
      // TODO: Implementar subida a Firebase Storage
      const mockUrl = `https://example.com/facturas/${Date.now()}_${file.name}`
      
      setNuevoGasto(prev => ({
        ...prev,
        facturaUrl: mockUrl,
      }))
      
      toast({
        title: "Factura subida",
        description: "La factura se subió correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir la factura",
        variant: "destructive",
      })
    } finally {
      setUploadingFactura(false)
    }
  }

  const agregarGasto = () => {
    if (!nuevoGasto.descripcion || nuevoGasto.monto <= 0) {
      toast({
        title: "Error",
        description: "La descripción y el monto son requeridos",
        variant: "destructive",
      })
      return
    }

    const gasto: GastoOrden = {
      id: Date.now().toString(),
      descripcion: nuevoGasto.descripcion,
      monto: nuevoGasto.monto,
      facturaUrl: nuevoGasto.facturaUrl,
      fecha: new Date(),
    }

    onGastosChange([...gastos, gasto])
    setNuevoGasto({ descripcion: "", monto: 0 })
    setShowAddForm(false)
    
    toast({
      title: "Gasto agregado",
      description: "El gasto se agregó correctamente",
    })
  }

  const eliminarGasto = (id: string) => {
    onGastosChange(gastos.filter(g => g.id !== id))
    toast({
      title: "Gasto eliminado",
      description: "El gasto se eliminó correctamente",
    })
  }

  const actualizarGasto = (id: string, field: keyof GastoOrden, value: any) => {
    const updated = gastos.map(g => {
      if (g.id === id) {
        return { ...g, [field]: value }
      }
      return g
    })
    onGastosChange(updated)
  }

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Gastos de la Orden</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar Gasto
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Descripción del gasto *</Label>
              <Input
                value={nuevoGasto.descripcion}
                onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
                placeholder="Ej: Kit completo service"
              />
            </div>
            <div className="space-y-2">
              <Label>Precio *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={nuevoGasto.monto || ""}
                onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: parseFloat(e.target.value) || 0 })}
                placeholder="180000"
              />
            </div>
            <div className="space-y-2">
              <Label>Factura (opcional)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="factura-upload"
                />
                <label
                  htmlFor="factura-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-accent"
                >
                  {uploadingFactura ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {nuevoGasto.facturaUrl ? "Factura subida" : "Subir factura"}
                </label>
                {nuevoGasto.facturaUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(nuevoGasto.facturaUrl, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Ver factura
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNuevoGasto({ descripcion: "", monto: 0 })
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={agregarGasto}>
                Agregar Gasto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gastos.length > 0 ? (
        <div className="space-y-2">
          {gastos.map((gasto) => (
            <Card key={gasto.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={gasto.descripcion}
                        onChange={(e) => actualizarGasto(gasto.id, 'descripcion', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={gasto.monto}
                        onChange={(e) => actualizarGasto(gasto.id, 'monto', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                      <span className="text-sm font-medium">${gasto.monto.toLocaleString()}</span>
                    </div>
                    {gasto.facturaUrl && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(gasto.facturaUrl, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver factura
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarGasto(gasto.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-end pt-2 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>Total Gastos:</span>
              <span className="text-green-600">${totalGastos.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay gastos registrados</p>
          <p className="text-sm">Agrega gastos como repuestos, materiales, etc.</p>
        </div>
      )}
    </div>
  )
}

