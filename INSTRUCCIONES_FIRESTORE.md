# 🔥 Instrucciones para Configurar Firestore - Mechify v2.0

## 📋 Situación Actual

Según tu descripción, en Firebase solo ves:
- `categorias` (no usada en este proyecto)
- `configuracion` (no usada en este proyecto)

**Necesitamos crear**:
- `clientes`
- `vehiculos`
- `ordenes`

## 🚀 Solución Rápida

### Opción 1: Usar Scripts Automáticos (Recomendado)

1. **Verificar estado actual**:
```bash
npm run firestore:check
```

2. **Inicializar colecciones con datos de ejemplo**:
```bash
npm run firestore:init
```

Este script:
- ✅ Crea las colecciones si no existen
- ✅ Migra datos de ejemplo (5 clientes, 6 vehículos, 5 órdenes)
- ✅ Solo migra si las colecciones están vacías

### Opción 2: Crear Solo la Estructura (Sin Datos)

```bash
npm run firestore:create
```

Esto crea las colecciones vacías sin datos.

### Opción 3: Manual desde Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mechifyv2`
3. Ve a **Firestore Database**
4. Haz clic en **"Comenzar colección"** o **"Add collection"**
5. Crea las siguientes colecciones:

#### Colección: `clientes`
- Crea un documento de ejemplo con estos campos:
  - `nombre` (string): "Ejemplo"
  - `apellido` (string): "Test"
  - `dni` (string): "12345678"
  - `telefono` (string): "+54 11 1234-5678"
  - `email` (string): "ejemplo@test.com"
  - `fechaRegistro` (timestamp): Fecha actual

#### Colección: `vehiculos`
- Crea un documento de ejemplo con estos campos:
  - `clienteId` (string): ID del cliente creado arriba
  - `marca` (string): "Ford"
  - `modelo` (string): "Focus"
  - `año` (number): 2020
  - `patente` (string): "ABC123"
  - `kilometraje` (number): 50000

#### Colección: `ordenes`
- Crea un documento de ejemplo con estos campos:
  - `clienteId` (string): ID del cliente
  - `vehiculoId` (string): ID del vehículo
  - `numeroOrden` (string): "OT-2024-001"
  - `fechaIngreso` (timestamp): Fecha actual
  - `estado` (string): "Pendiente"
  - `descripcion` (string): "Service completo"
  - `servicios` (array): ["Cambio de aceite", "Filtros"]
  - `costoTotal` (number): 15000

## 📝 Estructura Completa de Cada Colección

### `clientes`
```typescript
{
  nombre: string          // Requerido
  apellido: string        // Requerido
  dni: string            // Requerido, único
  telefono: string       // Requerido
  email: string          // Requerido
  direccion?: string     // Opcional
  fechaRegistro: Timestamp // Requerido
}
```

### `vehiculos`
```typescript
{
  clienteId: string      // Requerido (ID de cliente)
  marca: string          // Requerido
  modelo: string        // Requerido
  año: number           // Requerido
  patente: string       // Requerido, único, uppercase
  kilometraje: number   // Requerido
  color?: string        // Opcional
  tipoCombustible?: string // Opcional
}
```

### `ordenes`
```typescript
{
  clienteId: string      // Requerido (ID de cliente)
  vehiculoId: string    // Requerido (ID de vehículo)
  numeroOrden: string   // Requerido, único, formato: OT-YYYY-NNN
  fechaIngreso: Timestamp // Requerido
  fechaEntrega?: Timestamp // Opcional
  estado: string        // Requerido: "Pendiente" | "En Proceso" | "Completado" | "Entregado"
  descripcion: string   // Requerido
  servicios: string[]   // Requerido (array de strings)
  costoTotal: number    // Requerido
  observaciones?: string // Opcional
}
```

## 🔧 Scripts Disponibles

Después de instalar dependencias, puedes usar:

```bash
# Verificar estado de Firestore
npm run firestore:check

# Inicializar con datos de ejemplo
npm run firestore:init

# Crear solo estructura (sin datos)
npm run firestore:create
```

## ⚠️ Notas Importantes

1. **Los scripts solo migran si las colecciones están vacías**
   - Si ya tienes datos, no los sobrescribirá
   - Puedes eliminar manualmente los datos si quieres empezar de nuevo

2. **Índices necesarios**
   - Después de crear las colecciones, crea los índices (ver `README_FIREBASE.md`)
   - Firebase te dará enlaces directos si faltan índices

3. **Colecciones existentes**
   - `categorias` y `configuracion` no se tocan
   - Solo se crean las colecciones necesarias para Mechify

## ✅ Verificación

Después de ejecutar los scripts:

1. Ve a Firebase Console > Firestore
2. Verifica que existan:
   - ✅ `clientes` (con datos si usaste `init`)
   - ✅ `vehiculos` (con datos si usaste `init`)
   - ✅ `ordenes` (con datos si usaste `init`)

3. Ejecuta el proyecto:
```bash
npm run dev
```

4. Inicia sesión y verifica que los datos se muestren correctamente

## 🐛 Solución de Problemas

### Error: "Collection not found"
- Ejecuta `npm run firestore:create` primero
- O crea manualmente desde Firebase Console

### Error: "Permission denied"
- Verifica las reglas de seguridad en Firestore
- Asegúrate de que el archivo `firebase-admin.json` tenga permisos

### Los datos no aparecen
- Verifica que las colecciones tengan documentos
- Revisa la consola del navegador para errores
- Verifica que Firebase esté configurado correctamente

---

**¡Listo!** Una vez creadas las colecciones, el sistema funcionará completamente. 🎉

