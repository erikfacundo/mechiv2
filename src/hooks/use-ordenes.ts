"use client"

import { useState, useEffect, useCallback } from 'react'
import { OrdenTrabajo, EstadoOrden } from '@/types'

export function useOrdenes(estado?: EstadoOrden | 'Todos') {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrdenes = useCallback(async () => {
    try {
      setLoading(true)
      const url = estado && estado !== 'Todos' 
        ? `/api/ordenes?estado=${estado}`
        : '/api/ordenes'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al obtener órdenes')
      const data = await response.json()
      setOrdenes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [estado])

  useEffect(() => {
    fetchOrdenes()
  }, [fetchOrdenes])

  return { ordenes, loading, error, refetch: fetchOrdenes }
}

export function useOrden(id: string) {
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrden = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/ordenes/${id}`)
      if (!response.ok) throw new Error('Error al obtener orden')
      const data = await response.json()
      setOrden(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrden()
  }, [fetchOrden])

  return { orden, loading, error, refetch: fetchOrden }
}

