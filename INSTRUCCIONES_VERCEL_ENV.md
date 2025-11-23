# 🔧 Configurar Variables de Entorno en Vercel

## 📋 Valores para Vercel (del archivo actual)

Copia estos valores exactos en Vercel:

```
FIREBASE_PROJECT_ID = mechifyv2

FIREBASE_PRIVATE_KEY_ID = 5c500febadc75aaba263690d7108475cb12bc021

FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@mechifyv2.iam.gserviceaccount.com

FIREBASE_CLIENT_ID = 106040146678098688695

FIREBASE_CLIENT_X509_CERT_URL = https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mechifyv2.iam.gserviceaccount.com

FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC26JUz/xlMN7gx\n/wZgLGrRTGyNrTRaSqk+zLOranOl/HscLoLDxY9NzeTFUpFUd4emkpLCbp7xNLwF\npJfesMDJnwmiYF1IYhj5JGC4niJO1STxsljQyXKx7DO5XK+YdHMeslQFXCHe6yEN\nslIULHRBEhWNnF2kRK/pOBxR2Ou7e+J+5X/M5go9HfIsRua7o8AjWex5kpXpspMg\nGf/QdsENBiUbV6w5BWIydkJw1IJoqX4tngcROHSV6Uv4TY835Midt6Bee+BLqxik\n6OyQb15FBe32EBNJGaxL33tbibyNSoU0UjMuRW6MnxTcD5uaiLOeU/Ah67olnJwG\n9+jklfkPAgMBAAECggEAAIvk8Ww541KbS0YlLiGT11I9VMlt4zZfF3mKSkdqijyd\nEliu07tOxUwjLdYkUJzjm9zLCw4RJxlVCOAU0BNPg1d+5axLoXOH+l6Tp2ZZjEpY\nu09UGQBkRlUCICcMI0F3aPt3z5hJ3zegOEFBiFJMFDgXAzHlzOxwaU4qNeUwnYIs\n8UTe5L6Sc1SKKM8NlCcfzgSta8MQQ8Ik7k2SpKxR8lD1UhGIKr0bhMZMavZyJ5Xu\nw9bi8m5gmVkfGFy67IgZKo5GdhuxZFMW70HNOLViOEudlCcGZyrfIzPla7MH7kGW\n2tr/Qnk0eyin0Ga7Ybm90pvNbiyHvxEx/bKsFwqTMQKBgQDysVbZxnlKSFAkctoa\nj41weQNO2QCAGnS2XDZEBdplgi6Wk2vOCquwNydqrAPlzZI2iU/9gZPjjAyo0+V0\n0dQ+5FycZWvNFOnmNEv+ifLnfcLAsvixRGABux9C1ye9TpOGbiy/1OVCXAjbBfAz\nxXOJ4qqtUxM+lzZB8fARWq55BwKBgQDA8A6RFgdMPku5qCZ5AqMMiYtivXxYuQDR\ndZFvHUo5PU2z46LdkNXUITOoW9+f9sKfBDRt0eYpUuwCNzNuQbAuZJP/jJqI3LH0\nA2SbQAHrCeV3TlShTycYCHhHsIHcF1WTPhpRQ1NrQaqoX3nnXWuF196N4wgtopxn\njs2LjsmluQKBgEReDNdgf/6bDGiYKjTdR7ztei8WFnv/9+z/YRIci/+YgsNMWEw8\n2UzU3LfCKX7tQEk4uV3yyNSLOW2985/LFH17G1O7hnjJcXK2PMpB1jm8Rca/JCvb\n1SfnrNDJh5perlRqaRTJRqRBBQWeUKJk9z1aqzYUdxFky5YcL8LTxt61AoGAWtRo\ntyr8sosdUUD1I8D3C57xLMHx+T7XQMSte/b5C2tt2kNPWCmoUN50mEzwQTmFNCFh\noVXQmiG8k+py3vQzwhN9jTAfTFFBwZObWG9Qt9sH2RvaQbqmt+y821sgN4IQumnh\nL+KXMgZPFkckd6SGSxNuZbO9FObZ5PLYl1vYWJkCgYEAj42itlCSkCp3hbmVy5G1\nmvdMhGvpxusfMu0JYREhqeQbdLThbMA3hQTOzf0cqTiSuNv5XIznoQpfA7YbqDT3\n8Pq5Z9QaGpA7q6+7BxraxwM6g5WZwqKDKrhwDm5dUwADZ3nctvpaSIJXOzE/maIb\nB5lO+FwmzshsNicghBbE9vU=\n-----END PRIVATE KEY-----\n
```

**⚠️ IMPORTANTE sobre FIREBASE_PRIVATE_KEY:**
- Copia el valor completo tal como está arriba, incluyendo los `\n` literales
- El código los convertirá automáticamente a saltos de línea reales
- NO reemplaces los `\n` manualmente

## 🚀 Pasos en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto `mechiv2`
3. Ve a **Settings** (Configuración)
4. En el menú lateral, haz clic en **Environment Variables** (Variables de Entorno)
5. Agrega cada variable una por una usando los valores de arriba
6. Para cada variable, selecciona los **Environments** donde aplicará:
   - ✅ **Production**
   - ✅ **Preview** 
   - ✅ **Development** (opcional)
7. Haz clic en **Save** para cada variable

### Opción B: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Iniciar sesión
vercel login

# Agregar variables (reemplaza los valores con los de arriba)
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_PRIVATE_KEY_ID
vercel env add FIREBASE_PRIVATE_KEY
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_CLIENT_ID
vercel env add FIREBASE_CLIENT_X509_CERT_URL
```

## 🔄 Redesplegar

Después de agregar las variables:

1. Ve a la pestaña **Deployments** en Vercel
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo push a GitHub (Vercel detectará los cambios automáticamente)

## ✅ Verificar que funcionó

Después del deploy, verifica en los logs de Vercel que no aparezcan errores de Firebase. Si ves errores como "Firebase Admin no está inicializado", significa que alguna variable no se configuró correctamente.

## ⚠️ Importante

- **NUNCA** subas el archivo `firebase-admin.json` a GitHub (ya está en `.gitignore`)
- Las variables de entorno son **secretas** y solo se usan en el servidor
- Después de agregar las variables, **debes redesplegar** para que surtan efecto
