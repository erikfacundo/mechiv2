"use client"

import { useState, useEffect, useCallback } from "react"
import { Cobro } from "@/types"

export function useCobros(ordenId?: string) {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCobros = useCallback(async () => {
    try {
      setLoading(true)
      const url = ordenId ? `/api/cobros?ordenId=${ordenId}` : "/api/cobros"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Error al obtener cobros")
      const data = await response.json()
      setCobros(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setCobros([])
    } finally {
      setLoading(false)
    }
  }, [ordenId])

  useEffect(() => {
    fetchCobros()
  }, [fetchCobros])

  return { cobros, loading, error, refetch: fetchCobros }
}

