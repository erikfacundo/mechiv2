"use client"

import { useState, useEffect } from "react"
import { Turno } from "@/types"

export function useTurnos(fecha?: Date) {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      const url = fecha ? `/api/turnos?fecha=${fecha.toISOString()}` : "/api/turnos"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Error al obtener turnos")
      const data = await response.json()
      setTurnos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setTurnos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTurnos()
  }, [fecha])

  return { turnos, loading, error, refetch: fetchTurnos }
}

