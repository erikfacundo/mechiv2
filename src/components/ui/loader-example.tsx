"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Ejemplo de uso del componente Loader
 * 
 * Este componente demuestra cómo usar el Loader en diferentes escenarios:
 * - Operación exitosa
 * - Operación con error
 * - Con mensaje personalizado
 * - Con callback onFinish
 */
export function LoaderExample() {
  const [showSuccessLoader, setShowSuccessLoader] = useState(false)
  const [showErrorLoader, setShowErrorLoader] = useState(false)
  const [showCustomLoader, setShowCustomLoader] = useState(false)
  const [loaderMessage, setLoaderMessage] = useState("")

  const handleSuccessOperation = () => {
    setShowSuccessLoader(true)
  }

  const handleErrorOperation = () => {
    setShowErrorLoader(true)
  }

  const handleCustomOperation = () => {
    setLoaderMessage("Procesando orden de trabajo...")
    setShowCustomLoader(true)
  }

  const handleLoaderFinish = () => {
    console.log("Loader terminado, ejecutando callback...")
    // Aquí puedes hacer cualquier acción después de que termine el loader
    // Por ejemplo: redirigir, mostrar un toast, actualizar estado, etc.
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ejemplos de Uso del Loader</CardTitle>
          <CardDescription>
            Diferentes formas de usar el componente Loader en tu aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ejemplo 1: Operación exitosa */}
          <div className="space-y-2">
            <h3 className="font-semibold">1. Operación Exitosa</h3>
            <p className="text-sm text-muted-foreground">
              Muestra un tick verde después de 4 segundos
            </p>
            <Button onClick={handleSuccessOperation}>
              Simular Operación Exitosa
            </Button>
          </div>

          {/* Ejemplo 2: Operación con error */}
          <div className="space-y-2">
            <h3 className="font-semibold">2. Operación con Error</h3>
            <p className="text-sm text-muted-foreground">
              Muestra una cruz roja después de 4 segundos
            </p>
            <Button variant="destructive" onClick={handleErrorOperation}>
              Simular Operación con Error
            </Button>
          </div>

          {/* Ejemplo 3: Con mensaje personalizado */}
          <div className="space-y-2">
            <h3 className="font-semibold">3. Con Mensaje Personalizado</h3>
            <p className="text-sm text-muted-foreground">
              Muestra un mensaje personalizado junto al resultado
            </p>
            <Button variant="outline" onClick={handleCustomOperation}>
              Simular Operación con Mensaje
            </Button>
          </div>

          {/* Ejemplo 4: Con callback */}
          <div className="space-y-2">
            <h3 className="font-semibold">4. Con Callback onFinish</h3>
            <p className="text-sm text-muted-foreground">
              Ejecuta una función cuando termina la animación
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoaderMessage("Guardando cambios...")
                setShowCustomLoader(true)
              }}
            >
              Simular con Callback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loaders */}
      {showSuccessLoader && (
        <Loader
          result="success"
          message="Operación completada exitosamente"
          onFinish={() => {
            setShowSuccessLoader(false)
            handleLoaderFinish()
          }}
        />
      )}

      {showErrorLoader && (
        <Loader
          result="error"
          message="Ocurrió un error en la operación"
          onFinish={() => {
            setShowErrorLoader(false)
            handleLoaderFinish()
          }}
        />
      )}

      {showCustomLoader && (
        <Loader
          result="success"
          message={loaderMessage || "Procesando orden de trabajo..."}
          onFinish={() => {
            setShowCustomLoader(false)
            setLoaderMessage("")
            handleLoaderFinish()
          }}
        />
      )}

      {/* Código de ejemplo */}
      <Card>
        <CardHeader>
          <CardTitle>Código de Ejemplo</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`import { Loader } from "@/components/ui/loader"
import { useState } from "react"

function MyComponent() {
  const [showLoader, setShowLoader] = useState(false)

  const handleOperation = async () => {
    setShowLoader(true)
    
    try {
      // Tu operación aquí
      await someAsyncOperation()
      
      // El loader se mostrará con resultado exitoso
    } catch (error) {
      // El loader se mostrará con error
    }
  }

  return (
    <>
      <button onClick={handleOperation}>
        Ejecutar Operación
      </button>

      {showLoader && (
        <Loader
          result="success" // o "error"
          message="Procesando..."
          onFinish={() => {
            setShowLoader(false)
            // Hacer algo después de que termine
          }}
        />
      )}
    </>
  )
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

