# 🚀 Guía de Configuración - Mechify v2.0

Esta guía te ayudará a configurar el proyecto en una nueva computadora.

## 📋 Prerrequisitos

- **Node.js 18+** instalado
- **npm** o **yarn** o **pnpm**
- **Git** instalado
- **Cuenta de Firebase** con proyecto configurado

## 🔧 Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/erikfacundo/mechiv2.git
cd mechiv2
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Firebase

Tienes **dos opciones** para configurar Firebase:

#### Opción A: Usar archivo JSON (Desarrollo Local)

1. Obtén el archivo de credenciales de Firebase Admin SDK desde la consola de Firebase:
   - Ve a Firebase Console → Configuración del Proyecto → Cuentas de servicio
   - Genera una nueva clave privada o usa una existente
   - Descarga el archivo JSON

2. Coloca el archivo en `src/lib/firebase-admin.json`

   ```bash
   # El archivo debe tener este nombre exacto:
   src/lib/firebase-admin.json
   ```

#### Opción B: Usar Variables de Entorno (Recomendado para Producción)

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=tu-client-email@project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=tu-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**Nota:** El `FIREBASE_PRIVATE_KEY` debe incluir los `\n` literales (no saltos de línea reales).

### 4. Poblar la Base de Datos con Categorías

Ejecuta el script para crear las categorías y subcategorías en Firestore:

```bash
npm run firestore:seed-categorias
```

Este script creará:
- ✅ 10 categorías (Tareas Principales)
- ✅ 50 subtareas (Subcategorías)

### 5. Verificar la Conexión a Firebase (Opcional)

```bash
npm run firestore:check
```

### 6. Ejecutar el Proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔐 Credenciales de Acceso

**Usuario:** `admteam`  
**Contraseña:** (consulta con el administrador del proyecto)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia el servidor de desarrollo
npm run build            # Construye la aplicación para producción
npm run start            # Inicia el servidor de producción
npm run lint             # Ejecuta el linter

# Firebase
npm run firestore:check              # Verifica la conexión a Firestore
npm run firestore:init               # Inicializa Firestore con datos básicos
npm run firestore:create             # Crea las colecciones necesarias
npm run firestore:migrate             # Migra campos nuevos a documentos existentes
npm run firestore:seed-categorias     # Pobla categorías y subcategorías
```

## ⚠️ Problemas Comunes

### Error: "No se encontró configuración de Firebase Admin"

**Solución:** Asegúrate de tener:
- El archivo `src/lib/firebase-admin.json` O
- Las variables de entorno configuradas en `.env.local`

### Error: "Module not found"

**Solución:** Ejecuta `npm install` nuevamente.

### Error al ejecutar scripts de Firebase

**Solución:** Verifica que el archivo JSON de Firebase esté en la ruta correcta o que las variables de entorno estén configuradas.

## 📦 Estructura del Proyecto

```
mechiv2/
├── src/
│   ├── app/              # Rutas de Next.js (App Router)
│   ├── components/       # Componentes React
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades y configuración
│   ├── services/         # Servicios de Firebase
│   └── types/            # Tipos TypeScript
├── scripts/              # Scripts de utilidad
├── public/               # Archivos estáticos
└── package.json
```

## 🔄 Actualizar desde GitHub

Si ya tienes el proyecto clonado y quieres actualizarlo:

```bash
git pull origin main
npm install
npm run firestore:seed-categorias  # Si hay nuevas categorías
```

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🆘 Soporte

Si encuentras problemas, verifica:
1. Que todas las dependencias estén instaladas
2. Que Firebase esté correctamente configurado
3. Que las variables de entorno estén correctas (si usas esa opción)
4. Que el archivo `firebase-admin.json` esté en la ruta correcta

