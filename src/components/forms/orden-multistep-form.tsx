"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Car, 
  Wrench, 
  CheckSquare,
  FileText,
  Save,
  Plus,
  X,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useClientes } from "@/hooks/use-clientes"
import { useVehiculos } from "@/hooks/use-vehiculos"
import { useCategorias } from "@/hooks/use-categorias"
import { OrdenTrabajo, EstadoOrden, TareaChecklist } from "@/types"
import { ChecklistManager } from "@/components/ordenes/checklist-manager"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClienteForm } from "./cliente-form"
import { VehiculoForm } from "./vehiculo-form"

interface OrdenMultiStepFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const estados: EstadoOrden[] = ["Pendiente", "En Proceso", "Completado", "Entregado"]

export function OrdenMultiStepForm({ onSuccess, onCancel }: OrdenMultiStepFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { clientes, refetch: refetchClientes } = useClientes()
  const { vehiculos, refetch: refetchVehiculos } = useVehiculos()
  const { categorias } = useCategorias()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [clienteId, setClienteId] = useState("")
  const [vehiculoId, setVehiculoId] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<any>(null)
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null)
  const [checklist, setChecklist] = useState<TareaChecklist[]>([])
  const [esMantenimiento, setEsMantenimiento] = useState(false)
  const [fechaRecordatorio, setFechaRecordatorio] = useState("")
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
  const [isVehiculoDialogOpen, setIsVehiculoDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      estado: "Pendiente" as EstadoOrden,
      descripcion: "",
      servicios: [""],
      costoTotal: 0,
      observaciones: "",
      fechaIngreso: new Date().toISOString().split('T')[0],
      fechaEntrega: "",
    },
  })

  const watchedTipoTrabajo = watch("descripcion")

  useEffect(() => {
    if (clienteId) {
      const cliente = clientes.find(c => c.id === clienteId)
      setSelectedCliente(cliente)
    }
  }, [clienteId, clientes, vehiculos])

  useEffect(() => {
    if (vehiculoId) {
      const vehiculo = vehiculos.find(v => v.id === vehiculoId)
      setSelectedVehiculo(vehiculo)
    }
  }, [vehiculoId, vehiculos])

  useEffect(() => {
    if (watchedTipoTrabajo && categorias.length > 0) {
      const categoria = categorias.find(c => c.nombre === watchedTipoTrabajo)
      setSelectedCategoria(categoria)
    }
  }, [watchedTipoTrabajo, categorias])

  const steps = [
    { id: 1, title: 'Cliente', icon: User },
    { id: 2, title: 'Vehículo', icon: Car },
    { id: 3, title: 'Trabajo', icon: Wrench },
    { id: 4, title: 'Checklist', icon: CheckSquare },
    { id: 5, title: 'Confirmar', icon: FileText },
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClienteCreated = async () => {
    await refetchClientes()
    // El cliente se seleccionará automáticamente cuando se actualice la lista
    setIsClienteDialogOpen(false)
    toast({
      title: "Cliente creado",
      description: "Ahora puedes seleccionarlo en el formulario.",
    })
  }

  const handleVehiculoCreated = async () => {
    await refetchVehiculos()
    // El vehículo se seleccionará automáticamente cuando se actualice la lista
    setIsVehiculoDialogOpen(false)
    toast({
      title: "Vehículo creado",
      description: "Ahora puedes seleccionarlo en el formulario.",
    })
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const ordenData: Omit<OrdenTrabajo, 'id'> = {
        clienteId,
        vehiculoId,
        numeroOrden: "", // Se generará automáticamente
        fechaIngreso: new Date(data.fechaIngreso),
        fechaEntrega: data.fechaEntrega ? new Date(data.fechaEntrega) : undefined,
        estado: data.estado,
        descripcion: data.descripcion,
        servicios: data.servicios.filter((s: string) => s.trim()),
        costoTotal: data.costoTotal || 0,
        observaciones: data.observaciones || "",
        checklist: checklist,
        gastos: [],
        porcentajeCompletitud: checklist.length > 0 
          ? Math.round((checklist.filter(t => t.completado).length / checklist.length) * 100)
          : 0,
        esMantenimiento: esMantenimiento,
        fechaRecordatorioMantenimiento: esMantenimiento && fechaRecordatorio 
          ? new Date(fechaRecordatorio) 
          : undefined,
      }

      const response = await fetch("/api/ordenes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ordenData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear orden")
      }

      toast({
        title: "Orden creada",
        description: "La orden se ha creado exitosamente.",
      })

      onSuccess?.() || router.push("/ordenes")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la orden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Seleccionar Cliente</h3>
              <p className="text-muted-foreground">
                Elige un cliente existente o crea uno nuevo
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} - {cliente.dni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!clienteId && (
                  <p className="text-sm text-destructive">El cliente es requerido</p>
                )}
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-4">¿No encuentras el cliente?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClienteDialogOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Crear Nuevo Cliente
                </Button>
              </div>

              {selectedCliente && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{selectedCliente.nombre} {selectedCliente.apellido}</h4>
                        <p className="text-sm text-muted-foreground">
                          DNI: {selectedCliente.dni} • Tel: {selectedCliente.telefono}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Seleccionar Vehículo</h3>
              <p className="text-muted-foreground">
                Elige un vehículo del cliente o agrega uno nuevo
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Vehículo *</Label>
                <Select
                  value={vehiculoId}
                  onValueChange={setVehiculoId}
                  disabled={!clienteId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={clienteId ? "Seleccionar vehículo..." : "Primero selecciona un cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos
                      .filter(v => v.clienteId === clienteId)
                      .map((vehiculo) => (
                        <SelectItem key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.marca} {vehiculo.modelo} - {vehiculo.patente}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!vehiculoId && clienteId && (
                  <p className="text-sm text-destructive">El vehículo es requerido</p>
                )}
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-4">¿El vehículo no está registrado?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVehiculoDialogOpen(true)}
                  disabled={!clienteId}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Agregar Nuevo Vehículo
                </Button>
              </div>

              {selectedVehiculo && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Car className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">
                          {selectedVehiculo.marca} {selectedVehiculo.modelo}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedVehiculo.patente} • {selectedVehiculo.año} • {selectedVehiculo.kilometraje?.toLocaleString()} km
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Tipo de Trabajo</h3>
              <p className="text-muted-foreground">
                Selecciona el tipo de trabajo a realizar
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Trabajo *</Label>
                <Select
                  value={watch("descripcion")}
                  onValueChange={(value) => {
                    setValue("descripcion", value)
                    const categoria = categorias.find(c => c.nombre === value)
                    setSelectedCategoria(categoria)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de trabajo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nombre}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.descripcion && (
                  <p className="text-sm text-destructive">{errors.descripcion.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
                  <Input
                    id="fechaIngreso"
                    type="date"
                    {...register("fechaIngreso", { required: "La fecha de ingreso es obligatoria" })}
                  />
                  {errors.fechaIngreso && (
                    <p className="text-sm text-destructive">{errors.fechaIngreso.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaEntrega">Fecha Estimada de Entrega</Label>
                  <Input
                    id="fechaEntrega"
                    type="date"
                    {...register("fechaEntrega")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones Iniciales</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Describe el trabajo a realizar, problemas detectados, etc."
                  rows={4}
                  {...register("observaciones")}
                />
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="esMantenimiento">¿Es un trabajo de Mantenimiento?</Label>
                    <p className="text-sm text-muted-foreground">
                      Activa esto para crear un recordatorio de mantenimiento
                    </p>
                  </div>
                  <Switch
                    id="esMantenimiento"
                    checked={esMantenimiento}
                    onCheckedChange={setEsMantenimiento}
                  />
                </div>

                {esMantenimiento && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="fechaRecordatorio">Fecha de Recordatorio *</Label>
                    <Input
                      id="fechaRecordatorio"
                      type="date"
                      value={fechaRecordatorio}
                      onChange={(e) => setFechaRecordatorio(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {!fechaRecordatorio && (
                      <p className="text-sm text-destructive">La fecha de recordatorio es requerida</p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Checklist de Trabajo</h3>
              <p className="text-muted-foreground">
                Personaliza las tareas según el tipo de trabajo
              </p>
            </div>

            <ChecklistManager
              checklist={checklist}
              onChecklistChange={setChecklist}
            />
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Confirmar Orden</h3>
              <p className="text-muted-foreground">
                Revisa los datos antes de crear la orden
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedCliente?.nombre} {selectedCliente?.apellido}</h4>
                      <p className="text-sm text-muted-foreground">
                        DNI: {selectedCliente?.dni} • Tel: {selectedCliente?.telefono}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vehículo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {selectedVehiculo?.marca} {selectedVehiculo?.modelo}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedVehiculo?.patente} • {selectedVehiculo?.año} • {selectedVehiculo?.kilometraje?.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trabajo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <Wrench className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{selectedCategoria?.nombre || watch("descripcion")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {watch("fechaIngreso")} - {watch("fechaEntrega") || "Sin fecha estimada"}
                      </p>
                    </div>
                  </div>
                  
                  {watch("observaciones") && (
                    <div>
                      <h5 className="font-medium text-sm mb-1">Observaciones:</h5>
                      <p className="text-sm text-muted-foreground">{watch("observaciones")}</p>
                    </div>
                  )}

                  {esMantenimiento && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        <strong>Recordatorio:</strong> {fechaRecordatorio || "No especificado"}
                      </span>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium text-sm mb-2">Tareas ({checklist.length}):</h5>
                    <div className="space-y-1">
                      {checklist.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${item.completado ? 'bg-green-500' : 'bg-muted'}`} />
                          <span className={item.completado ? 'line-through text-muted-foreground' : ''}>
                            {item.tareaPadre ? `  └ ${item.tarea}` : item.tarea}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!clienteId
      case 2:
        return !!vehiculoId
      case 3:
        return !!watch("descripcion") && (!esMantenimiento || !!fechaRecordatorio)
      case 4:
        return true // El checklist es opcional
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="hidden xl:flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isActive 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-input bg-background text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile/Tablet progress */}
          <div className="xl:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  currentStep === steps[currentStep - 1]?.id
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : 'border-input bg-background text-muted-foreground'
                }`}>
                  {React.createElement(steps[currentStep - 1]?.icon || steps[0].icon, { className: "h-4 w-4" })}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {steps[currentStep - 1]?.title || 'Paso 1'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Paso {currentStep} de {steps.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {Math.round((currentStep / steps.length) * 100)}%
                </p>
                <div className="w-20 h-1 bg-muted rounded-full mt-1">
                  <div 
                    className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {currentStep < steps.length ? (
          <Button 
            onClick={handleNext} 
            disabled={!canProceedToNext()}
            className="w-full sm:w-auto"
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={loading || !canProceedToNext()}
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creando...' : 'Crear Orden'}
          </Button>
        )}
      </div>

      {/* Modals */}
      {isClienteDialogOpen && (
        <Dialog open={isClienteDialogOpen} onOpenChange={setIsClienteDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm
              onSuccess={handleClienteCreated}
              onCancel={() => setIsClienteDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {isVehiculoDialogOpen && (
        <Dialog open={isVehiculoDialogOpen} onOpenChange={setIsVehiculoDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Vehículo</DialogTitle>
            </DialogHeader>
            <VehiculoForm
              clienteId={clienteId || undefined}
              onSuccess={handleVehiculoCreated}
              onCancel={() => setIsVehiculoDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

