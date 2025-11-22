# Configuración de Firebase para Mechify v2.0

## 📋 Índices de Firestore Requeridos

Para que las consultas funcionen correctamente, necesitas crear los siguientes índices en Firestore:

### 1. Índice para búsqueda de DNI único
- **Colección**: `clientes`
- **Campo**: `dni` (ASCENDING)

### 2. Índice para búsqueda de patente única
- **Colección**: `vehiculos`
- **Campo**: `patente` (ASCENDING)

### 3. Índice para vehículos por cliente
- **Colección**: `vehiculos`
- **Campo**: `clienteId` (ASCENDING)

### 4. Índice para órdenes por estado y fecha
- **Colección**: `ordenes`
- **Campos**: 
  - `estado` (ASCENDING)
  - `fechaIngreso` (DESCENDING)

### 5. Índice para órdenes por cliente
- **Colección**: `ordenes`
- **Campos**:
  - `clienteId` (ASCENDING)
  - `fechaIngreso` (DESCENDING)

### 6. Índice para búsqueda de número de orden único
- **Colección**: `ordenes`
- **Campo**: `numeroOrden` (ASCENDING)

## 🔧 Cómo Crear los Índices

### Opción 1: Usando Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mechifyv2`
3. Ve a Firestore Database > Indexes
4. Haz clic en "Add Index"
5. Crea cada índice según las especificaciones arriba

### Opción 2: Usando el archivo firestore.indexes.json
1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Inicializa Firestore: `firebase init firestore`
4. Despliega los índices: `firebase deploy --only firestore:indexes`

## 🔒 Reglas de Seguridad

El archivo `firestore.rules` contiene las reglas básicas. En producción, deberías:

1. Agregar autenticación real
2. Restringir acceso según roles de usuario
3. Validar datos antes de escribir

Para desplegar las reglas:
```bash
firebase deploy --only firestore:rules
```

## 📊 Estructura de Colecciones

### clientes
```typescript
{
  id: string
  nombre: string
  apellido: string
  dni: string (único)
  telefono: string
  email: string
  direccion?: string
  fechaRegistro: Timestamp
}
```

### vehiculos
```typescript
{
  id: string
  clienteId: string
  marca: string
  modelo: string
  año: number
  patente: string (único)
  kilometraje: number
  color?: string
  tipoCombustible?: string
}
```

### ordenes
```typescript
{
  id: string
  clienteId: string
  vehiculoId: string
  numeroOrden: string (único)
  fechaIngreso: Timestamp
  fechaEntrega?: Timestamp
  estado: "Pendiente" | "En Proceso" | "Completado" | "Entregado"
  descripcion: string
  servicios: string[]
  costoTotal: number
  observaciones?: string
}
```

## ⚠️ Notas Importantes

1. **Índices Compuestos**: Los índices compuestos (múltiples campos) son necesarios para queries con `where()` y `orderBy()` juntos.

2. **Unicidad**: Firestore no tiene restricciones de unicidad nativas. La validación se hace en la aplicación mediante las funciones en `src/services/firebase/validations.ts`.

3. **Performance**: Los índices mejoran significativamente el rendimiento de las consultas, especialmente cuando hay muchos documentos.

4. **Errores de Índice**: Si ves errores como "The query requires an index", Firebase te dará un enlace directo para crear el índice necesario.

