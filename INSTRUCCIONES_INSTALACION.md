# 📦 Instrucciones de Instalación - Mechify v2.0

## 🚀 Instalación Paso a Paso

### 1. Prerrequisitos

Asegúrate de tener instalado:
- **Node.js** 18 o superior
- **npm** o **yarn** o **pnpm**
- Cuenta de **Firebase** con proyecto creado

### 2. Clonar e Instalar

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd mechiv2

# Instalar dependencias
npm install
```

### 3. Configurar Firebase

#### Paso 1: Archivo de Credenciales
1. Descarga tu archivo de credenciales de Firebase Admin SDK desde la consola de Firebase
2. Colócalo en: `src/lib/firebase-admin.json`
3. **IMPORTANTE**: Este archivo está en `.gitignore` y no debe subirse al repositorio

#### Paso 2: Crear Colecciones en Firestore
Ve a Firebase Console > Firestore Database y crea las siguientes colecciones:
- `clientes`
- `vehiculos`
- `ordenes`

#### Paso 3: Crear Índices
**Opción A - Automático (Recomendado)**:
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar Firestore (si no lo has hecho)
firebase init firestore

# Desplegar índices
firebase deploy --only firestore:indexes
```

**Opción B - Manual**:
1. Ve a Firebase Console > Firestore > Indexes
2. Crea los índices según `firestore.indexes.json`:
   - `clientes`: índice en `dni` (ASCENDING)
   - `vehiculos`: índice en `patente` (ASCENDING)
   - `vehiculos`: índice en `clienteId` (ASCENDING)
   - `ordenes`: índice compuesto en `estado` (ASC) + `fechaIngreso` (DESC)
   - `ordenes`: índice compuesto en `clienteId` (ASC) + `fechaIngreso` (DESC)
   - `ordenes`: índice en `numeroOrden` (ASCENDING)

#### Paso 4: Configurar Reglas de Seguridad
```bash
firebase deploy --only firestore:rules
```

O manualmente desde Firebase Console > Firestore > Rules, copia el contenido de `firestore.rules`

### 4. Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev

# El proyecto estará disponible en:
# http://localhost:3000
```

### 5. Acceder al Sistema

1. Abre http://localhost:3000
2. Serás redirigido a `/login`
3. Ingresa las credenciales:
   - **Usuario**: `admteam`
   - **Contraseña**: `gandara 3368`
4. Serás redirigido al Dashboard

## 🔧 Configuración Adicional

### Variables de Entorno (Opcional)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
```

### Migrar Datos Mockeados (Opcional)

Si quieres poblar Firestore con datos de ejemplo:

```bash
# Instalar ts-node si no lo tienes
npm install -g ts-node

# Ejecutar script de migración
npx ts-node scripts/migrate-data.ts
```

## ✅ Verificación

Después de la instalación, verifica:

1. ✅ El proyecto inicia sin errores
2. ✅ Puedes hacer login con las credenciales
3. ✅ Las páginas cargan correctamente
4. ✅ Puedes crear un cliente de prueba
5. ✅ Las validaciones funcionan

## 🐛 Solución de Problemas

### Error: "Cannot find module 'firebase-admin'"
```bash
npm install
```

### Error: "The query requires an index"
- Ve a Firebase Console
- Firestore > Indexes
- Haz clic en el enlace que Firebase proporciona
- Crea el índice automáticamente

### Error: "Firebase Admin SDK credential error"
- Verifica que `src/lib/firebase-admin.json` exista
- Verifica que el archivo tenga el formato correcto
- Verifica que las credenciales sean válidas

### Error: "Collection not found"
- Asegúrate de que las colecciones existan en Firestore
- Verifica los nombres: `clientes`, `vehiculos`, `ordenes`

## 📚 Documentación Adicional

- `GUIA_COMPLETA.md` - Guía completa del sistema
- `README_FIREBASE.md` - Detalles de configuración de Firebase
- `README.md` - Documentación general

---

**¡Listo para usar!** 🎉

