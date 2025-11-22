"use client"

import { useState, useEffect } from "react"
import { PlantillaTarea } from "@/types"

export function usePlantillasTareas() {
  const [plantillas, setPlantillas] = useState<PlantillaTarea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlantillas = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/plantillas-tareas")
      if (!response.ok) throw new Error("Error al obtener plantillas")
      const data = await response.json()
      setPlantillas(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setPlantillas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlantillas()
  }, [])

  return { plantillas, loading, error, refetch: fetchPlantillas }
}

