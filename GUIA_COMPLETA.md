# 📚 Guía Completa - Mechify v2.0

## 🎯 Resumen del Proyecto

Mechify v2.0 es un sistema completo de gestión para talleres automotrices desarrollado con Next.js 14, TypeScript, Firebase Firestore y shadcn/ui.

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd mechiv2

# Instalar dependencias
npm install
```

### 2. Configuración de Firebase

1. **Coloca el archivo de credenciales**:
   - Mueve tu archivo `firebase-adminsdk-*.json` a `src/lib/firebase-admin.json`

2. **Crea las colecciones en Firestore**:
   - `clientes`
   - `vehiculos`
   - `ordenes`

3. **Crea los índices necesarios**:
   ```bash
   # Opción 1: Usando Firebase CLI
   firebase deploy --only firestore:indexes
   
   # Opción 2: Manualmente desde Firebase Console
   # Ve a Firestore > Indexes y crea los índices según firestore.indexes.json
   ```

4. **Configura las reglas de seguridad**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 3. Ejecutar el Proyecto

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

### 4. Acceder al Sistema

- **URL**: http://localhost:3000
- **Usuario**: `admteam`
- **Contraseña**: `gandara 3368`

## 📋 Estructura del Proyecto

```
mechiv2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── clientes/      # CRUD Clientes
│   │   │   ├── vehiculos/     # CRUD Vehículos
│   │   │   ├── ordenes/       # CRUD Órdenes
│   │   │   └── validations/   # Validaciones únicas
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── clientes/          # Página de clientes
│   │   ├── vehiculos/         # Página de vehículos
│   │   ├── ordenes/           # Página de órdenes
│   │   ├── login/             # Página de login
│   │   └── layout.tsx         # Layout principal
│   ├── components/
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── forms/             # Formularios
│   │   ├── layout/            # Layout (Sidebar, Header)
│   │   └── ui/                # Componentes shadcn/ui
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades y configuraciones
│   ├── services/
│   │   └── firebase/          # Servicios de Firebase
│   ├── store/                 # Zustand store
│   └── types/                 # Tipos TypeScript
├── firestore.indexes.json     # Índices de Firestore
├── firestore.rules            # Reglas de seguridad
└── package.json
```

## 🔐 Autenticación

### Credenciales por Defecto
- **Usuario**: `admteam`
- **Contraseña**: `gandara 3368`

### Implementación
- Autenticación básica con localStorage
- Protección de rutas con `AuthGuard`
- Middleware de Next.js para validación

### Mejoras Recomendadas para Producción
- Implementar JWT tokens
- Usar httpOnly cookies
- Integrar Firebase Authentication
- Agregar refresh tokens

## 📊 Base de Datos (Firestore)

### Colecciones

#### `clientes`
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

#### `vehiculos`
```typescript
{
  id: string
  clienteId: string
  marca: string
  modelo: string
  año: number
  patente: string (único, uppercase)
  kilometraje: number
  color?: string
  tipoCombustible?: string
}
```

#### `ordenes`
```typescript
{
  id: string
  clienteId: string
  vehiculoId: string
  numeroOrden: string (único, formato: OT-YYYY-NNN)
  fechaIngreso: Timestamp
  fechaEntrega?: Timestamp
  estado: "Pendiente" | "En Proceso" | "Completado" | "Entregado"
  descripcion: string
  servicios: string[]
  costoTotal: number
  observaciones?: string
}
```

### Índices Requeridos

Ver `firestore.indexes.json` para la lista completa. Los índices más importantes:

1. **clientes.dni** (ASCENDING) - Para validación única
2. **vehiculos.patente** (ASCENDING) - Para validación única
3. **vehiculos.clienteId** (ASCENDING) - Para filtrar por cliente
4. **ordenes.estado + fechaIngreso** - Para filtros por estado
5. **ordenes.clienteId + fechaIngreso** - Para órdenes por cliente
6. **ordenes.numeroOrden** (ASCENDING) - Para validación única

## ✅ Validaciones Implementadas

### Validaciones Únicas
- ✅ DNI único (clientes)
- ✅ Patente única (vehículos)
- ✅ Número de orden único (órdenes)

### Validaciones de Formato
- ✅ DNI: 7-8 dígitos
- ✅ Email: formato válido
- ✅ Patente: formato ABC123 o AB123CD
- ✅ Año: rango válido (1900 - año actual + 1)

### Validaciones en Tiempo Real
- Las validaciones únicas se verifican mientras el usuario escribe
- Feedback inmediato con mensajes de error

## 🎨 Funcionalidades Principales

### 1. Gestión de Clientes
- ✅ Crear, editar, eliminar clientes
- ✅ Búsqueda por nombre
- ✅ Vista de detalle completa
- ✅ Validación de DNI único

### 2. Gestión de Vehículos
- ✅ Crear, editar, eliminar vehículos
- ✅ Asociación con clientes
- ✅ Búsqueda por patente
- ✅ Validación de patente única
- ✅ Selector de marca predefinido

### 3. Gestión de Órdenes
- ✅ Crear, editar, eliminar órdenes
- ✅ Generación automática de número de orden
- ✅ Filtros por estado
- ✅ Cálculo automático de costos
- ✅ Vista de detalle completa
- ✅ Múltiples servicios por orden

### 4. Dashboard
- ✅ Métricas principales
- ✅ Órdenes pendientes/en proceso
- ✅ Total de clientes y vehículos
- ✅ Ingresos mensuales
- ✅ Tabla de órdenes recientes

## 🔧 API Endpoints

### Clientes
- `GET /api/clientes` - Listar todos
- `POST /api/clientes` - Crear nuevo
- `GET /api/clientes/[id]` - Obtener por ID
- `PUT /api/clientes/[id]` - Actualizar
- `DELETE /api/clientes/[id]` - Eliminar

### Vehículos
- `GET /api/vehiculos` - Listar todos
- `POST /api/vehiculos` - Crear nuevo
- `GET /api/vehiculos/[id]` - Obtener por ID
- `PUT /api/vehiculos/[id]` - Actualizar
- `DELETE /api/vehiculos/[id]` - Eliminar

### Órdenes
- `GET /api/ordenes?estado=X` - Listar (con filtro opcional)
- `POST /api/ordenes` - Crear nueva
- `GET /api/ordenes/[id]` - Obtener por ID
- `PUT /api/ordenes/[id]` - Actualizar
- `DELETE /api/ordenes/[id]` - Eliminar

### Validaciones
- `GET /api/validations/dni?dni=X&excludeId=Y` - Verificar DNI
- `GET /api/validations/patente?patente=X&excludeId=Y` - Verificar patente
- `GET /api/validations/numero-orden?numeroOrden=X&excludeId=Y` - Verificar número orden

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Firebase Firestore
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Estado**: Zustand
- **Formularios**: React Hook Form
- **Iconos**: Lucide React
- **Temas**: next-themes

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm start        # Servidor de producción
npm run lint     # Linter
```

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno si es necesario
3. Vercel detectará Next.js automáticamente
4. El despliegue se realizará automáticamente

### Variables de Entorno

En producción, considera agregar:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
```

## 🔒 Seguridad

### Implementado
- ✅ Validación de datos en servidor
- ✅ Validaciones únicas
- ✅ Protección de rutas
- ✅ Sanitización de inputs

### Recomendaciones para Producción
- Implementar rate limiting
- Agregar CORS apropiado
- Usar Firebase Authentication
- Implementar roles y permisos
- Agregar logging de auditoría
- Validar tokens JWT en cada request

## 🐛 Solución de Problemas

### Error: "The query requires an index"
1. Ve a Firebase Console > Firestore > Indexes
2. Haz clic en el enlace que Firebase proporciona
3. Crea el índice automáticamente

### Error: "Cannot read properties of undefined"
- Verifica que las colecciones existan en Firestore
- Asegúrate de que los datos tengan la estructura correcta

### Error de autenticación
- Verifica que el archivo `firebase-admin.json` esté en `src/lib/`
- Revisa que las credenciales sean correctas

## 📚 Documentación Adicional

- `README.md` - Documentación general
- `README_FIREBASE.md` - Configuración de Firebase
- `FUNCIONALIDADES_FALTANTES.md` - Estado de funcionalidades
- `IMPLEMENTACION_COMPLETA.md` - Resumen de implementación

## 🎯 Próximos Pasos Sugeridos

1. **Mejoras de UX**
   - Paginación en tablas
   - Ordenamiento de columnas
   - Exportar datos (CSV/PDF)

2. **Reportes**
   - Dashboard con gráficos
   - Reportes de ingresos
   - Estadísticas avanzadas

3. **Funcionalidades**
   - Historial de cambios
   - Notificaciones en tiempo real
   - Sistema de facturación

4. **Seguridad**
   - Autenticación robusta
   - Roles y permisos
   - Auditoría completa

---

**¡Proyecto completamente funcional y listo para usar!** 🎉

