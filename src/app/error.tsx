"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Algo salió mal</CardTitle>
          </div>
          <CardDescription>
            Ocurrió un error inesperado. Por favor, intenta nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Intentar de nuevo
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/dashboard"}
              className="flex-1"
            >
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

