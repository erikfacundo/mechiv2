"use client"

import { useState, useEffect } from 'react'
import { OrdenTrabajo, EstadoOrden } from '@/types'

export function useOrdenes(estado?: EstadoOrden | 'Todos') {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrdenes()
  }, [estado])

  const fetchOrdenes = async () => {
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
  }

  return { ordenes, loading, error, refetch: fetchOrdenes }
}

export function useOrden(id: string) {
  const [orden, setOrden] = useState<OrdenTrabajo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchOrden()
  }, [id])

  const fetchOrden = async () => {
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
  }

  return { orden, loading, error, refetch: fetchOrden }
}

