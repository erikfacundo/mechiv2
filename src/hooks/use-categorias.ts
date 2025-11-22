"use client"

import { useState, useEffect } from "react"
import { Categoria } from "@/types"

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categorias")
      if (!response.ok) throw new Error("Error al obtener categorías")
      const data = await response.json()
      setCategorias(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setCategorias([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  return { categorias, loading, error, refetch: fetchCategorias }
}

