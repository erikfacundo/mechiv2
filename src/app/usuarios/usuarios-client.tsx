"use client"

import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { useUsuarios, UsuarioSinPassword } from "@/hooks/use-usuarios"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UsuariosClient() {
  const router = useRouter()
  const { toast } = useToast()
  const { usuarios, loading, refetch } = useUsuarios()

  const handleCreate = () => {
    router.push("/usuarios/nuevo")
  }

  const handleEdit = (usuario: UsuarioSinPassword) => {
    router.push(`/usuarios/${usuario.id}`)
  }

  const handleDelete = async (usuario: UsuarioSinPassword) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${usuario.username}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente.",
      })

      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      })
    }
  }

  const columns = [
    { key: "username", header: "Usuario" },
    { key: "nombre", header: "Nombre" },
    { key: "apellido", header: "Apellido" },
    { key: "email", header: "Email" },
    {
      key: "activo",
      header: "Estado",
      render: (usuario: UsuarioSinPassword) => (
        <span className={usuario.activo ? "text-green-600" : "text-red-600"}>
          {usuario.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        action={
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        }
      />

      <DataTable
        data={usuarios}
        columns={columns}
        actions={(usuario) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(usuario)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Editar</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(usuario)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Eliminar</span>
            </Button>
          </>
        )}
      />
    </div>
  )
}

