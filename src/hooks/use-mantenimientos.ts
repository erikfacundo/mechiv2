"use client"

import { useState, useEffect } from "react"
import { Mantenimiento } from "@/types"

export function useMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMantenimientos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/mantenimientos")
      if (!response.ok) throw new Error("Error al obtener mantenimientos")
      const data = await response.json()
      setMantenimientos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setMantenimientos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMantenimientos()
  }, [])

  return { mantenimientos, loading, error, refetch: fetchMantenimientos }
}

export function useMantenimientoById(id: string) {
  const [mantenimiento, setMantenimiento] = useState<Mantenimiento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMantenimiento = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/mantenimientos/${id}`)
      if (!response.ok) throw new Error("Error al obtener mantenimiento")
      const data = await response.json()
      setMantenimiento(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setMantenimiento(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchMantenimiento()
    }
  }, [id])

  return { mantenimiento, loading, error, refetch: fetchMantenimiento }
}

export function useMantenimientosPendientes() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMantenimientos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/mantenimientos?pendientes=true")
      if (!response.ok) throw new Error("Error al obtener mantenimientos pendientes")
      const data = await response.json()
      setMantenimientos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setMantenimientos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMantenimientos()
  }, [])

  return { mantenimientos, loading, error, refetch: fetchMantenimientos }
}

