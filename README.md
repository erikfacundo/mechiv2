# Mechify v2.0 - Sistema de Gestión de Taller Automotriz

Aplicación web moderna para la gestión integral de talleres automotrices. Desarrollada con Next.js 14, TypeScript, Tailwind CSS y shadcn/ui.

## 🚀 Características

- **Dashboard Interactivo**: Vista general con métricas clave y órdenes recientes
- **Gestión de Clientes**: CRUD completo con búsqueda y visualización de detalles
- **Gestión de Vehículos**: Registro y seguimiento de vehículos de clientes
- **Órdenes de Trabajo**: Sistema completo de órdenes con filtros por estado
- **Modo Oscuro/Claro**: Tema adaptable con soporte para preferencias del sistema
- **Diseño Responsive**: Optimizado para escritorio, tablet y móvil
- **Interfaz Moderna**: Construida con componentes de shadcn/ui

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Firebase Firestore
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Estado Global**: Zustand
- **Formularios**: React Hook Form
- **Iconos**: Lucide React
- **Temas**: next-themes

## 📋 Prerrequisitos

- Node.js 18+ 
- npm, yarn o pnpm

## 🔧 Instalación Rápida

1. Clona el repositorio:
```bash
git clone https://github.com/erikfacundo/mechiv2.git
cd mechiv2
```

2. Instala las dependencias:
```bash
npm install
```

3. **Configura Firebase:**
   - Coloca el archivo `firebase-admin.json` en `src/lib/` O
   - Crea un archivo `.env.local` con las variables de entorno de Firebase

4. **Pobla la base de datos con categorías:**
```bash
npm run firestore:seed-categorias
```

5. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

> 📖 **Para instrucciones detalladas**, consulta [SETUP.md](./SETUP.md)

## 📁 Estructura del Proyecto

```
mechiv2/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── dashboard/          # Página del dashboard
│   │   ├── clientes/           # Página de gestión de clientes
│   │   ├── vehiculos/          # Página de gestión de vehículos
│   │   ├── ordenes/            # Página de órdenes de trabajo
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página de inicio (redirige a dashboard)
│   │   └── globals.css         # Estilos globales
│   ├── components/
│   │   ├── ui/                 # Componentes de shadcn/ui
│   │   ├── layout/             # Componentes de layout (Sidebar, Header)
│   │   └── theme-provider.tsx  # Proveedor de temas
│   ├── lib/
│   │   └── utils.ts            # Utilidades (cn function)
│   ├── services/
│   │   └── data-mock.ts        # Servicios con datos mockeados
│   ├── store/
│   │   └── use-store.ts        # Store de Zustand
│   └── types/
│       └── index.ts            # Tipos TypeScript
├── public/                     # Archivos estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎨 Configuración de shadcn/ui

Este proyecto ya incluye los componentes de shadcn/ui necesarios. Si necesitas agregar más componentes en el futuro, puedes usar:

```bash
npx shadcn-ui@latest add [component-name]
```

Los componentes incluidos son:
- Button
- Card
- Dialog
- Input
- Label
- Select
- Table
- Badge
- Separator

## 🔥 Configuración de Firebase

El proyecto está configurado para usar Firebase Firestore.

### Desarrollo Local

Tienes dos opciones para desarrollo local:

**Opción 1: Usar archivo JSON (Recomendado)**
Coloca el archivo de credenciales en:
- `src/lib/firebase-admin.json`

**Opción 2: Usar variables de entorno**
Copia `.env.example` a `.env.local` y completa con tus valores:
```bash
cp .env.example .env.local
```

**⚠️ IMPORTANTE**: Tanto `firebase-admin.json` como `.env.local` están en `.gitignore` y no deben subirse al repositorio.

### Producción (Vercel)

En Vercel, configura las siguientes variables de entorno:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY` (con `\n` escapados)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_CLIENT_X509_CERT_URL`

### Estructura de Firestore

El proyecto usa las siguientes colecciones:
- `categorias` - Categorías del sistema
- `clientes` - Información de clientes
- `vehiculos` - Información de vehículos
- `ordenes` - Órdenes de trabajo
- `cobros` - Registro de cobros
- `gastos` - Registro de gastos
- `proveedores` - Proveedores
- `turnos` - Turnos de clientes
- `plantillas_tareas` - Plantillas de tareas
- `configuracion` - Configuración del sistema

### Inicializar Firestore

Para crear las colecciones y poblar datos iniciales:

```bash
npm run firestore:init
```

Para verificar el estado de las colecciones:

```bash
npm run firestore:check
```

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente Next.js
3. Configura las variables de entorno de Firebase (ver sección de Firebase)
4. El despliegue se realizará automáticamente en cada push

### Build de Producción

```bash
npm run build
npm start
```

## ✅ Estado del Proyecto

**Versión**: 2.0.0  
**Estado**: ✅ **COMPLETO Y FUNCIONAL**

### Funcionalidades Implementadas
- ✅ Integración completa con Firebase Firestore
- ✅ Autenticación de usuarios (usuario: `admteam`, pass: `gandara 3368`)
- ✅ Formularios CRUD completos para todas las entidades:
  - Clientes, Vehículos, Órdenes
  - Categorías, Cobros, Gastos
  - Proveedores, Turnos, Plantillas de Tareas
- ✅ Validaciones únicas en tiempo real (DNI, patente, número de orden)
- ✅ Sistema de notificaciones Toast
- ✅ Dashboard con métricas
- ✅ Filtros y búsqueda en todas las tablas
- ✅ Vista de detalle completa
- ✅ Modo oscuro/claro
- ✅ Diseño responsive

### Documentación
- 📖 `CHANGELOG.md` - Historial de cambios
- 📖 `FUNCIONALIDADES_FALTANTES.md` - Funcionalidades pendientes (opcionales)

## 🔮 Próximas Mejoras (Opcionales)

- [ ] Paginación en tablas
- [ ] Ordenamiento de columnas
- [ ] Exportación de reportes (CSV/PDF)
- [ ] Dashboard con gráficos
- [ ] Notificaciones en tiempo real
- [ ] Sistema de facturación avanzado

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

Desarrollado con ❤️ para talleres automotrices

