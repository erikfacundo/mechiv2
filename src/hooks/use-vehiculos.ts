"use client"

import { useState, useEffect, useCallback } from 'react'
import { Vehiculo } from '@/types'

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVehiculos()
  }, [])

  const fetchVehiculos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehiculos')
      if (!response.ok) throw new Error('Error al obtener vehículos')
      const data = await response.json()
      setVehiculos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return { vehiculos, loading, error, refetch: fetchVehiculos }
}

export function useVehiculo(id: string) {
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehiculo = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/vehiculos/${id}`)
      if (!response.ok) throw new Error('Error al obtener vehículo')
      const data = await response.json()
      setVehiculo(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchVehiculo()
  }, [fetchVehiculo])

  return { vehiculo, loading, error, refetch: fetchVehiculo }
}

