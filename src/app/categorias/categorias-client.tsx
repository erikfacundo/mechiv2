"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
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
    <div className="space-y-6">
      <PageHeader
        title="Tareas Principales y Subtareas"
        description="Gestiona las categorías (tareas principales) y sus subcategorías (subtareas)"
        action={
          <Button onClick={() => router.push("/categorias/nuevo")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea Principal
          </Button>
        }
      />

      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input
          placeholder="Buscar por nombre, descripción o subtarea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Badge variant="outline" className="self-start sm:self-auto">
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
        <div className="space-y-2 sm:space-y-4">
          {filteredCategorias.map((categoria) => {
            const isExpanded = expandedCategories.has(categoria.id)
            const hasSubtareas = categoria.subcategorias && categoria.subcategorias.length > 0
            
            return (
              <Card key={categoria.id} className="overflow-hidden">
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <div className="space-y-2 sm:space-y-3">
                    {/* Primera fila: Flecha + Título + Botones */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Botón expandir */}
                      {hasSubtareas ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => toggleExpand(categoria.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      
                      {/* Título con color */}
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <span 
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: categoria.color || '#3b82f6' }} 
                        />
                        <CardTitle className="text-base sm:text-lg font-semibold leading-tight truncate min-w-0">
                          {categoria.nombre}
                        </CardTitle>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/categorias/${categoria.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(categoria.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Segunda fila: Descripción */}
                    {categoria.descripcion && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-0 sm:pl-0">
                        {hasSubtareas && <span className="inline-block w-8 sm:w-8" />}
                        {categoria.descripcion}
                      </p>
                    )}
                    
                    {/* Tercera fila: Badges */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pl-0 sm:pl-0">
                      {hasSubtareas && <span className="inline-block w-8 sm:w-8" />}
                      <Badge variant="outline" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 h-5 sm:h-6">
                        Principal
                      </Badge>
                      <Badge 
                        variant={categoria.activa ? "default" : "secondary"} 
                        className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 h-5 sm:h-6"
                      >
                        {categoria.activa ? "Activa" : "Inactiva"}
                      </Badge>
                      {hasSubtareas && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 h-5 sm:h-6">
                          {categoria.subcategorias?.length || 0} {categoria.subcategorias?.length === 1 ? 'subtarea' : 'subtareas'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Subtareas (Subcategorías) */}
                {hasSubtareas && isExpanded && categoria.subcategorias && (
                  <CardContent className="pt-2 sm:pt-3 pb-2 sm:pb-4 px-3 sm:px-6">
                    <div className="space-y-2 sm:space-y-2.5">
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        {categoria.subcategorias.length} {categoria.subcategorias.length === 1 ? 'subtarea' : 'subtareas'}
                      </p>
                      <div className="space-y-1.5 sm:space-y-2">
                        {categoria.subcategorias.map((subcategoria, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-md bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
                          >
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm flex-1 leading-relaxed">{subcategoria}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}

                {/* Mensaje cuando no hay subtareas */}
                {!hasSubtareas && isExpanded && (
                  <CardContent className="pt-2 sm:pt-3 pb-2 sm:pb-4 px-3 sm:px-6">
                    <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                      No tiene subtareas.{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs sm:text-sm underline"
                        onClick={() => router.push(`/categorias/${categoria.id}/editar`)}
                      >
                        Editar para agregar.
                      </Button>
                    </p>
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

