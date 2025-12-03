# Configuración de Cloudflare R2 para Almacenamiento de Fotos

Este proyecto usa **Cloudflare R2** para almacenar las fotos de vehículos y órdenes de trabajo. R2 ofrece:

- ✅ **10 GB de almacenamiento gratuito**
- ✅ **Sin costos de egress** (transferencia de datos saliente)
- ✅ **Escalable** - Sin límites de tamaño por documento
- ✅ **Rápido** - CDN global de Cloudflare

## 📋 Plan Gratuito de R2

- **10 GB de almacenamiento** gratuito por mes
- **Sin costos de egress** (transferencia de datos)
- **$0.015 por GB adicional** de almacenamiento
- **$4.50 por millón** de operaciones Class A (PUT, COPY, POST, LIST)
- **$0.36 por millón** de operaciones Class B (GET, HEAD)

**⚠️ IMPORTANTE**: El plan gratuito es generoso, pero monitorea tu uso para evitar costos inesperados.

## 🚀 Configuración Paso a Paso

### 1. Crear cuenta en Cloudflare R2

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Inicia sesión o crea una cuenta
3. Selecciona tu cuenta o crea una nueva

### 2. Crear un Bucket R2

1. En el dashboard, ve a **R2** en el menú lateral
2. Haz clic en **Create bucket**
3. Elige un nombre (ej: `mechify-fotos`)
4. Selecciona la ubicación (cualquiera está bien)
5. Haz clic en **Create bucket**

### 3. Configurar Public Access (Opcional pero Recomendado)

Para que las imágenes sean accesibles públicamente:

1. Ve a tu bucket
2. Ve a **Settings** → **Public Access**
3. Habilita **Allow Access**
4. Guarda los cambios

### 4. Crear API Token

1. Ve a **Manage R2 API Tokens**
2. Haz clic en **Create API token**
3. Configura:
   - **Token name**: `mechify-upload` (o el nombre que prefieras)
   - **Permissions**: `Object Read & Write`
   - **TTL**: Dejar en blanco (sin expiración) o configurar según necesites
4. Haz clic en **Create API Token**
5. **⚠️ IMPORTANTE**: Guarda el **Access Key ID** y **Secret Access Key** (solo se muestran una vez)

### 5. Obtener Account ID

1. En el dashboard de Cloudflare, ve a cualquier página
2. En la barra lateral derecha, encontrarás tu **Account ID**
3. Cópialo

### 6. Configurar Variables de Entorno

#### Desarrollo Local (.env.local)

Crea o actualiza `.env.local` con:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=tu_account_id_aqui
R2_ACCESS_KEY_ID=tu_access_key_id_aqui
R2_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
R2_BUCKET_NAME=mechify-fotos
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # Opcional: si configuraste un dominio personalizado
```

#### Producción (Vercel)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

```
R2_ACCOUNT_ID = tu_account_id
R2_ACCESS_KEY_ID = tu_access_key_id
R2_SECRET_ACCESS_KEY = tu_secret_access_key
R2_BUCKET_NAME = mechify-fotos
R2_PUBLIC_URL = https://pub-xxxxx.r2.dev  # Opcional
```

4. Marca todas como disponibles en **Production**, **Preview**, y **Development**
5. Guarda los cambios

### 7. Configurar Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio para las imágenes:

1. En tu bucket R2, ve a **Settings** → **Public Access**
2. Haz clic en **Connect Domain**
3. Ingresa tu dominio (ej: `fotos.tudominio.com`)
4. Sigue las instrucciones para configurar DNS
5. Una vez configurado, actualiza `R2_PUBLIC_URL` con tu dominio

## 🔄 Migración de Fotos Existentes

El sistema mantiene **compatibilidad completa** con fotos existentes en base64:

- ✅ Las fotos nuevas se suben automáticamente a R2
- ✅ Las fotos antiguas en base64 siguen funcionando
- ✅ No necesitas migrar fotos existentes (opcional)

Si quieres migrar fotos existentes a R2, puedes crear un script de migración.

## 📊 Monitoreo de Uso

Para monitorear tu uso de R2:

1. Ve a **R2** en el dashboard de Cloudflare
2. Revisa las métricas de almacenamiento y operaciones
3. Configura alertas si lo deseas

## 🛡️ Seguridad

- ✅ Los tokens de API tienen permisos limitados (solo lectura/escritura de objetos)
- ✅ Puedes rotar los tokens periódicamente
- ✅ Las URLs públicas son necesarias para mostrar las imágenes en el navegador
- ✅ Considera usar signed URLs para contenido privado (futuro)

## 🐛 Troubleshooting

### Error: "R2 storage not configured"
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que las variables estén disponibles en el entorno correcto (production/preview/development)

### Error: "Access Denied"
- Verifica que el API token tenga permisos de `Object Read & Write`
- Verifica que el nombre del bucket sea correcto

### Las imágenes no se muestran
- Verifica que Public Access esté habilitado en el bucket
- Verifica que la URL pública sea correcta
- Revisa la consola del navegador para errores de CORS

## 📚 Recursos

- [Documentación de Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Pricing de R2](https://developers.cloudflare.com/r2/pricing/)
- [API Reference](https://developers.cloudflare.com/r2/api/)

