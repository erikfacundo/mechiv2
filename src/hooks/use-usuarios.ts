"use client"

import { useState, useEffect, useCallback } from 'react'
import { Usuario } from '@/types'

export type UsuarioSinPassword = Omit<Usuario, 'passwordHash'>

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSinPassword[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usuarios')
      if (!response.ok) throw new Error('Error al obtener usuarios')
      const data = await response.json()
      setUsuarios(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  return { usuarios, loading, error, refetch: fetchUsuarios }
}

export function useUsuario(id: string) {
  const [usuario, setUsuario] = useState<UsuarioSinPassword | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuario = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await fetch(`/api/usuarios/${id}`)
      if (!response.ok) throw new Error('Error al obtener usuario')
      const data = await response.json()
      setUsuario(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchUsuario()
  }, [fetchUsuario])

  return { usuario, loading, error, refetch: fetchUsuario }
}



