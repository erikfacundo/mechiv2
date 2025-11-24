"use client"

import { useState, useEffect, useCallback } from 'react'
import { Cliente } from '@/types'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clientes')
      if (!response.ok) throw new Error('Error al obtener clientes')
      const data = await response.json()
      setClientes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return { clientes, loading, error, refetch: fetchClientes }
}

export function useCliente(id: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCliente = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/clientes/${id}`)
      if (!response.ok) throw new Error('Error al obtener cliente')
      const data = await response.json()
      setCliente(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCliente()
  }, [fetchCliente])

  return { cliente, loading, error, refetch: fetchCliente }
}

