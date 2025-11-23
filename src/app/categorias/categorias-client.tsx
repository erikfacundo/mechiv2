"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Categoria } from "@/types"
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, ListTree } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface CategoriasClientProps {
  categorias: Categoria[]
}

export function CategoriasClient({ categorias: initialCategorias }: CategoriasClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [categorias, setCategorias] = useState(initialCategorias)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Categoría eliminada",
        description: "La categoría se eliminó correctamente",
      })
      
      // Actualizar estado local
      setCategorias(categorias.filter(c => c.id !== id))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCategories(newExpanded)
  }

  // Filtrar categorías por término de búsqueda
  const filteredCategorias = categorias.filter((cat) => {
    const matchesSearch = 
      cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.subcategorias?.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tareas Principales y Subtareas</h1>
          <p className="text-muted-foreground">
            Gestiona las categorías (tareas principales) y sus subcategorías (subtareas)
          </p>
        </div>
        <Button onClick={() => router.push("/categorias/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea Principal
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nombre, descripción o subtarea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Badge variant="outline" className="ml-auto">
          {categorias.length} {categorias.length === 1 ? 'tarea principal' : 'tareas principales'}
        </Badge>
      </div>

      {filteredCategorias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No se encontraron resultados" : "No hay categorías"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Intenta con otro término de búsqueda"
                : "Crea tu primera tarea principal para comenzar"}
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push("/categorias/nuevo")}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Tarea Principal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCategorias.map((categoria) => {
            const isExpanded = expandedCategories.has(categoria.id)
            const hasSubtareas = categoria.subcategorias && categoria.subcategorias.length > 0
            
            return (
              <Card key={categoria.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {hasSubtareas && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleExpand(categoria.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoria.color || '#3b82f6' }} />
                            {categoria.nombre}
                            <Badge variant="outline" className="ml-2">
                              Tarea Principal
                            </Badge>
                          </CardTitle>
                          {categoria.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {categoria.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={categoria.activa ? "default" : "secondary"}>
                        {categoria.activa ? "Activa" : "Inactiva"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/categorias/${categoria.id}/editar`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(categoria.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Subtareas (Subcategorías) */}
                {hasSubtareas && isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="ml-8 border-l-2 border-muted pl-4 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {categoria.subcategorias.length} {categoria.subcategorias.length === 1 ? 'subtarea' : 'subtareas'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Dependen de: <strong>{categoria.nombre}</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {categoria.subcategorias.map((subcategoria, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border"
                          >
                            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">{subcategoria}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              Subtarea
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}

                {/* Mensaje cuando no hay subtareas */}
                {!hasSubtareas && isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="ml-8 border-l-2 border-muted pl-4">
                      <p className="text-sm text-muted-foreground italic">
                        Esta tarea principal no tiene subtareas definidas.
                        Edita la categoría para agregar subtareas.
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

