"use client"

import { useState, useEffect, useCallback } from "react"
import { Gasto } from "@/types"

export function useGastos(proveedorId?: string) {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGastos = useCallback(async () => {
    try {
      setLoading(true)
      const url = proveedorId ? `/api/gastos?proveedorId=${proveedorId}` : "/api/gastos"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Error al obtener gastos")
      const data = await response.json()
      setGastos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setGastos([])
    } finally {
      setLoading(false)
    }
  }, [proveedorId])

  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])

  return { gastos, loading, error, refetch: fetchGastos }
}

