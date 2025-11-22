"use client"

import { useState, useEffect } from 'react'
import { Cliente } from '@/types'

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
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
  }

  return { clientes, loading, error, refetch: fetchClientes }
}

export function useCliente(id: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchCliente()
  }, [id])

  const fetchCliente = async () => {
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
  }

  return { cliente, loading, error, refetch: fetchCliente }
}

