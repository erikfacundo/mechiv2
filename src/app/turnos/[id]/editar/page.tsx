"use client"

import { useRouter, useParams } from "next/navigation"
import { TurnoForm } from "@/components/forms/turno-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando turno...</p>
        </div>
      </div>
    )
  }

  if (!turno) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Turno no encontrado</p>
          <Button onClick={() => router.push("/turnos")}>
            Volver a Turnos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Turno"
      description="Modifica los datos del turno"
      backUrl="/turnos"
    >
      <TurnoForm turno={turno} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

