"use client"

import { useState, useEffect } from "react"
import { Proveedor } from "@/types"

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProveedores = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/proveedores")
      if (!response.ok) throw new Error("Error al obtener proveedores")
      const data = await response.json()
      setProveedores(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setProveedores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProveedores()
  }, [])

  return { proveedores, loading, error, refetch: fetchProveedores }
}

