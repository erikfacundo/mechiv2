# Variables de Entorno Requeridas

Este documento lista todas las variables de entorno necesarias para que la aplicación funcione correctamente.

## 🔍 Verificar Variables

Puedes verificar qué variables están configuradas visitando:
- **Producción**: `https://mechiv2.vercel.app/api/health`
- **Local**: `http://localhost:3000/api/health`

## 🔥 Firebase (Requeridas)

Estas variables son **OBLIGATORIAS** para que la aplicación funcione:

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `FIREBASE_PROJECT_ID` | ID del proyecto de Firebase | Firebase Console → Project Settings → General |
| `FIREBASE_PRIVATE_KEY_ID` | ID de la clave privada | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_PRIVATE_KEY` | Clave privada del servicio (con `\n` para saltos de línea) | Firebase Console → Project Settings → Service Accounts → Generate new private key |
| `FIREBASE_CLIENT_EMAIL` | Email del servicio | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_CLIENT_ID` | ID del cliente | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_CLIENT_X509_CERT_URL` | URL del certificado X509 | Firebase Console → Project Settings → Service Accounts |

### Cómo obtener las credenciales de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Haz clic en **Generate new private key**
5. Se descargará un archivo JSON con todas las credenciales
6. Copia cada valor a las variables de entorno correspondientes

**⚠️ IMPORTANTE**: Para `FIREBASE_PRIVATE_KEY`:
- El valor debe incluir los saltos de línea como `\n` (backslash n), NO como saltos de línea reales
- Ejemplo correcto: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC26JUz...\n-----END PRIVATE KEY-----`
- Si pegas el JSON completo de Firebase, los saltos de línea ya vienen como `\n`
- En Vercel, pega el valor tal cual viene del JSON (con los `\n`)

## ☁️ Cloudflare R2 (Requeridas para fotos)

Estas variables son necesarias para subir y almacenar fotos:

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `R2_ACCOUNT_ID` | ID de tu cuenta de Cloudflare | Cloudflare Dashboard → R2 → Overview (parte superior) |
| `R2_ACCESS_KEY_ID` | Clave de acceso | Cloudflare Dashboard → R2 → Manage R2 API Tokens → Tu token |
| `R2_SECRET_ACCESS_KEY` | Clave secreta | Cloudflare Dashboard → R2 → Manage R2 API Tokens → Tu token (solo se muestra una vez) |
| `R2_BUCKET_NAME` | Nombre del bucket | El nombre que le diste al bucket (ej: `mechify`) |
| `R2_PUBLIC_URL` | URL pública del bucket (opcional) | Si configuraste un dominio personalizado, úsalo aquí |

### Cómo obtener las credenciales de R2:

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Ve a **R2** en el menú lateral
3. **R2_ACCOUNT_ID**: 
   - Está en la parte superior de la página R2
   - Es un string largo como: `2bd7f6b6433d060f6ed0867ef99abe86`
4. **R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY**: 
   - Ve a **Manage R2 API Tokens** (en el menú de R2)
   - Si ya creaste un token, haz clic en él para ver los detalles
   - Si no tienes token, haz clic en **Create API token**
   - Configura:
     - **Token name**: `mechify-upload` (o el nombre que prefieras)
     - **Permissions**: **Object Read & Write**
     - **TTL**: Dejar en blanco (sin expiración) o configurar según necesites
   - Copia:
     - **Access Key ID** → `R2_ACCESS_KEY_ID`
     - **Secret Access Key** → `R2_SECRET_ACCESS_KEY` (⚠️ solo se muestra una vez, guárdalo bien)

## 📝 Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega cada variable una por una
4. Selecciona los ambientes donde aplicará (Production, Preview, Development)
5. Haz clic en **Save**
6. **Re-despliega** la aplicación para que los cambios surtan efecto

## ✅ Verificación

Después de configurar las variables:

1. Visita `https://mechiv2.vercel.app/api/health`
2. Verifica que todas las variables estén marcadas como `presentVars`
3. Si hay variables en `missingVars`, agrégalas en Vercel

## 🔒 Seguridad

- ⚠️ **NUNCA** commitees estas variables al repositorio
- ✅ Usa `.env.local` para desarrollo local
- ✅ Usa Vercel Environment Variables para producción
- ✅ El archivo `.env.local` está en `.gitignore`

## 🐛 Solución de Problemas

### Error: "Firebase Admin no está inicializado"

**Causa**: Faltan variables de Firebase en Vercel

**Solución**:
1. Verifica que todas las 6 variables de Firebase estén en Vercel
2. Revisa que los valores estén correctos (sin espacios extra)
3. Para `FIREBASE_PRIVATE_KEY`, asegúrate de incluir los `\n` (saltos de línea)
4. Re-despliega la aplicación

### Error: "R2 storage not configured"

**Causa**: Faltan variables de R2 en Vercel

**Solución**:
1. Verifica que todas las variables de R2 estén en Vercel
2. Revisa que `R2_BUCKET_NAME` coincida exactamente con el nombre del bucket
3. Re-despliega la aplicación

### Las imágenes no se ven

**Causa**: Public Access no está habilitado en R2

**Solución**:
1. Ve a Cloudflare Dashboard → R2 → Tu bucket
2. Ve a **Settings** → **Public Access**
3. Habilita **Allow Access**
4. Guarda los cambios

