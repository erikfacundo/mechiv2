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

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd mechiv2
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

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

El proyecto está configurado para usar Firebase Firestore. El archivo de credenciales debe estar en:
- `src/lib/firebase-admin.json`

**⚠️ IMPORTANTE**: Este archivo está en `.gitignore` y no debe subirse al repositorio.

### Estructura de Firestore

El proyecto espera las siguientes colecciones en Firestore:
- `clientes` - Información de clientes
- `vehiculos` - Información de vehículos
- `ordenes` - Órdenes de trabajo

### Datos Mockeados

El proyecto incluye datos de ejemplo en `src/services/data-mock.ts` que puedes usar para poblar Firestore inicialmente. Puedes crear un script de migración para cargar estos datos.

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. El despliegue se realizará automáticamente

### Build de Producción

```bash
npm run build
npm start
```

## 📊 Migración de Datos

Para migrar los datos mockeados a Firestore, puedes usar el script incluido:

```bash
npx ts-node scripts/migrate-data.ts
```

**Nota**: Asegúrate de tener configurado Firebase correctamente antes de ejecutar el script.

## ✅ Estado del Proyecto

**Versión**: 2.0.0  
**Estado**: ✅ **COMPLETO Y FUNCIONAL**

### Funcionalidades Implementadas
- ✅ Integración completa con Firebase Firestore
- ✅ Autenticación de usuarios (usuario: `admteam`, pass: `gandara 3368`)
- ✅ Formularios CRUD completos (Clientes, Vehículos, Órdenes)
- ✅ Validaciones únicas en tiempo real
- ✅ Sistema de notificaciones Toast
- ✅ Dashboard con métricas
- ✅ Filtros y búsqueda
- ✅ Vista de detalle completa

### Documentación Completa
- 📖 `GUIA_COMPLETA.md` - Guía completa de usuario y desarrollador
- 📖 `README_FIREBASE.md` - Configuración detallada de Firebase
- 📖 `ESTADO_PROYECTO.md` - Estado actual del proyecto
- 📖 `CHANGELOG.md` - Historial de cambios
- 📖 `FUNCIONALIDADES_FALTANTES.md` - Lista de funcionalidades (mayormente completadas)

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

