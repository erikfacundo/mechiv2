"use client"

import { useRouter, useParams } from "next/navigation"
import { TurnoForm } from "@/components/forms/turno-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Turno } from "@/types"

export default function EditarTurnoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [turno, setTurno] = useState<Turno | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const response = await fetch(`/api/turnos/${id}`)
        if (!response.ok) throw new Error("Error al obtener turno")
        const data = await response.json()
        setTurno(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el turno",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchTurno()
  }, [id, toast])

  const handleSuccess = () => {
    toast({
      title: "Turno actualizado",
      description: "El turno se ha actualizado exitosamente.",
    })
    router.push("/turnos")
  }

  const handleCancel = () => {
    router.push("/turnos")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">Cargando turno...</div>
      </div>
    )
  }

  if (!turno) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Turno no encontrado</p>
          <Button onClick={() => router.push("/turnos")}>
            Volver a Turnos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/turnos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Turnos
        </Button>
        <h1 className="text-3xl font-bold">Editar Turno</h1>
        <p className="text-muted-foreground">Modifica los datos del turno</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <TurnoForm turno={turno} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

