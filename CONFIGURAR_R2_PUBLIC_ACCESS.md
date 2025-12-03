# Configurar Acceso Público en Cloudflare R2

## Problema: 401 Unauthorized al acceder a imágenes

Si ves errores `401 Unauthorized` al intentar acceder a imágenes desde R2, significa que el bucket no tiene acceso público habilitado.

## Solución: Habilitar Public Access

### Paso 1: Ir al Dashboard de Cloudflare R2

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona tu cuenta
3. Ve a **R2** en el menú lateral
4. Haz clic en tu bucket (`mechify`)

### Paso 2: Habilitar Public Development URL

1. En la página del bucket, ve a la pestaña **Settings**
2. Busca la sección **Public Development URL**
3. Verás un mensaje que dice: *"Indicates if the bucket is accessible over the public internet. The bucket is publicly accessible if a custom domain or the public development URL is enabled."*
4. Haz clic en el botón **"Enable"** (Habilitar)
5. **IMPORTANTE**: Se te pedirá confirmar escribiendo **"allow"** en un campo de confirmación
6. Escribe **"allow"** y confirma
7. Después de confirmar, se mostrará la URL pública de desarrollo debajo, algo como: `https://pub-2bd7f6b6433d060f6ed0867ef99abe86.r2.dev`
8. **Copia esta URL** - la necesitarás para la variable de entorno
9. Los cambios se guardan automáticamente

**⚠️ Nota**: La Public Development URL está destinada para desarrollo y está sujeta a limitaciones de tasa. Para producción, considera usar un dominio personalizado.

### Paso 3: Verificar la Variable de Entorno

Asegúrate de que en Vercel tengas configurada la variable:

```
R2_PUBLIC_URL=https://pub-2bd7f6b6433d060f6ed0867ef99abe86.r2.dev
```

O si prefieres usar el dominio por defecto, déjala vacía y el código usará automáticamente:
```
https://pub-{R2_ACCOUNT_ID}.r2.dev
```

### Paso 4: Re-desplegar

Después de habilitar Public Access:
1. Re-despliega la aplicación en Vercel
2. Las imágenes subidas después de habilitar Public Access deberían ser accesibles

## Nota sobre Imágenes Existentes

Si ya subiste imágenes antes de habilitar Public Access, es posible que necesites:
1. Eliminar las imágenes antiguas
2. Subirlas nuevamente

O alternativamente, puedes usar **Signed URLs** (URLs temporales firmadas) para acceso privado, pero esto requiere cambios en el código.

## Verificación

Para verificar que funciona:
1. Sube una nueva imagen
2. Intenta acceder a la URL directamente en el navegador
3. Deberías ver la imagen sin errores 401

