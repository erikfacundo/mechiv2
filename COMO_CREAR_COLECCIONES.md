# 🔥 Cómo Crear las Colecciones en Firebase

## ⚠️ Importante

**NO, las colecciones NO se crean automáticamente en Firebase.** 

He creado todo el código necesario (servicios, API routes, formularios, páginas), pero **tú necesitas crear las colecciones en Firebase Firestore**.

## 🚀 Opciones para Crear las Colecciones

### Opción 1: Desde Firebase Console (Más Fácil) ⭐

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mechifyv2`
3. Ve a **Firestore Database**
4. Haz clic en **"Comenzar colección"** o **"Add collection"**
5. Crea las siguientes colecciones (una por una):

#### Colecciones a Crear:

1. **`categorias`** - Crea un documento de ejemplo:
   ```json
   {
     "nombre": "Service",
     "descripcion": "Servicios de mantenimiento",
     "color": "#3b82f6",
     "activa": true,
     "fechaCreacion": [timestamp actual]
   }
   ```

2. **`clientes`** - Crea un documento de ejemplo:
   ```json
   {
     "nombre": "Ejemplo",
     "apellido": "Test",
     "dni": "12345678",
     "telefono": "+54 11 1234-5678",
     "email": "ejemplo@test.com",
     "fechaRegistro": [timestamp actual]
   }
   ```

3. **`cobros`** - Puede estar vacía inicialmente

4. **`gastos`** - Puede estar vacía inicialmente

5. **`ordenes`** - Crea un documento de ejemplo:
   ```json
   {
     "clienteId": "[ID del cliente creado]",
     "vehiculoId": "[ID del vehículo creado]",
     "numeroOrden": "OT-2024-001",
     "fechaIngreso": [timestamp actual],
     "estado": "Pendiente",
     "descripcion": "Service completo",
     "servicios": ["Cambio de aceite"],
     "costoTotal": 15000
   }
   ```

6. **`plantillas_tareas`** - Puede estar vacía inicialmente

7. **`proveedores`** - Crea un documento de ejemplo:
   ```json
   {
     "nombre": "Repuestos ABC",
     "telefono": "+54 11 1111-1111",
     "tipo": "Repuestos",
     "activo": true,
     "fechaRegistro": [timestamp actual]
   }
   ```

8. **`turnos`** - Puede estar vacía inicialmente

9. **`vehiculos`** - Crea un documento de ejemplo:
   ```json
   {
     "clienteId": "[ID del cliente creado]",
     "marca": "Ford",
     "modelo": "Focus",
     "año": 2020,
     "patente": "ABC123",
     "kilometraje": 50000
   }
   ```

### Opción 2: Usar el Script (Requiere Configuración)

Si quieres usar el script automático, primero necesitas:

1. **Verificar que `firebase-admin.json` esté correcto**
   - Debe estar en `src/lib/firebase-admin.json`
   - Debe tener las credenciales correctas

2. **Ejecutar el script**:
   ```bash
   npm run firestore:init
   ```

   Este script:
   - Verifica qué colecciones existen
   - Crea las que faltan
   - Migra datos de ejemplo

## ✅ Verificación

Después de crear las colecciones:

1. Ve a Firebase Console > Firestore
2. Verifica que existan todas las colecciones:
   - ✅ categorias
   - ✅ clientes
   - ✅ cobros
   - ✅ gastos
   - ✅ ordenes
   - ✅ plantillas_tareas
   - ✅ proveedores
   - ✅ turnos
   - ✅ vehiculos

3. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```

4. Inicia sesión y verifica que las páginas funcionen

## 📝 Nota Importante

**Firestore crea las colecciones automáticamente cuando agregas el primer documento.** 

No necesitas crear las colecciones vacías - solo agrega un documento de ejemplo en cada una y la colección se creará automáticamente.

## 🎯 Recomendación

**Usa la Opción 1 (Firebase Console)** - Es más visual y te permite ver exactamente qué se está creando.

---

**Una vez creadas las colecciones, todo el código que creé funcionará perfectamente.** ✅

