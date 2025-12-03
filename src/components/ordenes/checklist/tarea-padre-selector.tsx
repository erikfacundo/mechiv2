"use client"

import { useState, useCallback } from "react"
import { TareaChecklist } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePlantillasTareas } from "@/hooks/use-plantillas-tareas"
import { useToast } from "@/hooks/use-toast"

interface TareaPadreSelectorProps {
  onClose: () => void
  onAdd: (tarea: TareaChecklist) => void
}

export function TareaPadreSelector({ onClose, onAdd }: TareaPadreSelectorProps) {
  const { plantillas, refetch: refetchPlantillas } = usePlantillasTareas()
  const { toast } = useToast()
  const [selectedTareaPadre, setSelectedTareaPadre] = useState<string>("")

  const plantillasPadre = plantillas.filter((p) => p.esTareaPadre)

  const handleAdd = useCallback(async () => {
    if (!selectedTareaPadre) {
      toast({
        title: "Error",
        description: "Debes seleccionar una tarea padre",
        variant: "destructive",
      })
      return
    }

    const response = await fetch("/api/plantillas-tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        findOrCreate: true,
        nombre: selectedTareaPadre,
        esTareaPadre: true,
      }),
    })

    if (!response.ok) {
      toast({
        title: "Error",
        description: "Error al crear tarea padre",
        variant: "destructive",
      })
      return
    }

    const nuevaTareaPadre: TareaChecklist = {
      id: Date.now().toString(),
      tarea: selectedTareaPadre,
      completado: false,
      notas: "",
    }

    onAdd(nuevaTareaPadre)
    setSelectedTareaPadre("")
    onClose()

    refetchPlantillas().catch(() => {})
    toast({
      title: "Tarea padre agregada",
      description: "Ahora puedes agregar subtareas",
    })
  }, [selectedTareaPadre, onAdd, onClose, toast, refetchPlantillas])

  return (
    <Card>
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <Label>Seleccionar o crear tarea padre</Label>
          <Select value={selectedTareaPadre} onValueChange={setSelectedTareaPadre}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una tarea padre" />
            </SelectTrigger>
            <SelectContent>
              {plantillasPadre.map((plantilla) => (
                <SelectItem key={plantilla.id} value={plantilla.nombre}>
                  {plantilla.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = prompt("Nombre de la nueva tarea padre:")
              if (input) {
                setSelectedTareaPadre(input)
              }
            }}
            className="flex-1 sm:flex-initial"
          >
            Crear Nueva
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            disabled={!selectedTareaPadre}
            className="flex-1 sm:flex-initial"
          >
            Agregar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 sm:flex-initial"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

