# Variables de Entorno para Vercel

Copia y pega estas variables en Vercel Dashboard → Settings → Environment Variables

## 🔥 Firebase (6 variables)

### FIREBASE_PROJECT_ID
```
mechifyv2
```

### FIREBASE_PRIVATE_KEY_ID
```
20702725a17ec368d983dcb779b588da61cff1aa
```

### FIREBASE_PRIVATE_KEY
⚠️ **IMPORTANTE**: Copia TODO el valor, incluyendo las comillas y los `\n`
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWe9SwDZQRJ0Ym\n7G89GeaKtEIUIrbWraY2KbXdT9ZDnbOrSInXW4B1oXNEtNyIkUZs5HB75NH7NAQn\nYT5gcO2L/C0SaGI/juagfhVxLrANBYphWINjMjOw1VBRLiQeIp7Meslckol0CsYl\nrMCXx9Kfzrhg+a6ntsRbG8ezcEiIhGLH392E9U5s1vF3KRz6+taZW9pNYU5dmDzs\nccXhp04KAoGyGau2wLscUPxbpLfoPf48ROiFD18fvzV6mUZnisTApqaqMR+obCpg\nYFmkAqRX6siBlcqD/2QsEY8vUNQQB2/8V5r8yDGujX3hwSsM+ZH3Iuxe+pw7nIJV\nsdxtY7S1AgMBAAECggEAH9t+PJUTulWFSbhCEIcFk3IRQ4jhc/MQdkiNOv1GA76L\nhoQsdyif5LjxlFGx1PYRChEHNRvIZaG1AT1kJLJ5UhrHfg2zlCGvV0TK/gfzfcem\nJW3efBAjld8lQh2Sn0hAonoVaRLZ6DrGcied5p13RyXPBJZpbv9KXIb8i0ZA+8e6\ngTCzyoEwgFsAP7Zc2EgHf1HMLp1PbP80wI3zNcA2VkmrFQ1FafMGlaEsseUmGQmv\ncxhhtT4f/Pm6rRUdeKP6VVQoRpKklD58Mg424EiNVKgriB5fFOOL4sH8QQOk3Ank\nPn2qMptHicktI+eWiOAvvpkDWv+71mLJn1j75zqoGQKBgQDrCAZOYcd/6Cc897/P\nwNWEV2LXhNwlKpUK1oEBxBos+U8o7MgDgP9B4iyfuy2TxPMEaFiO4HI3FoMy+dQ2\nGj8gTGL4RmkTTC85k+sXKS0JipUkVeJzpidRXg81woMRSNb+INULc6MXkne6CWOz\n3PmQarGtl6FEeV0HjQjzLXyEDQKBgQDpnoKzcbU7knJ6fxfCrJhl38PO5Cx0JkzR\nxbXc3S4in5oferuLPGeGHAeRs+XXB/sIvrzCy76VMY0tZRbP99asFFAoRBSMOn6w\nfy5dwib9fWEaRywa6wDWCioqYFWNS2Mdg2/5vkTwh4liK0DSM80MfPBgFFEiocJL\n8tIaDFYBSQKBgE7QlRTJ01XAKxBV4FuxxagoibvOEOjhu7MztXU7Jq/4NqR5qqUK\nKA8W4nH6GdGY1QmgWDopaAOzJ/H7Nz+hU5PoKbQqIGhZPujnAon0w+aUM2lI57Ry\nfnLZwO39OWidbYMwzWCWuZVZB486QNX6/zF/pe+Zjnng3OKAWAT8NuotAoGBAJDb\nvdWA00y+EQgN2HDYzqKUrniSGVJoEUgdnRf3ecz0Q//y/WlnqhWJOdRJxWGhTDJu\n+uKarXEbSZv1S8Dmv5DyA4YEOO1+s+HC6sAuTDjwTo6ZxSpnv5v4r46ZL1MuhKXf\nQ0aLiXnPwQtDIK12e1Wb/vzEfE7KGI05YrfOIGIpAoGBAIjh+6f365qO1MxeKUK7\n/LAYltDIHZau0oOrYKJx/3c4hCTU4A3H7YKq3p8htPjU9UjHweqTINC6JXVNwHq9\nibYdyuKLU9/PUCEgjWFAY0ZfjAeIxLfqPJPimPgF2edgm1zNYQfHJKAJ21D7fsbs\ny4F2pk4Xh89kT6ZtDlm8T4ZW\n-----END PRIVATE KEY-----\n
```

### FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@mechifyv2.iam.gserviceaccount.com
```

### FIREBASE_CLIENT_ID
```
106040146678098688695
```

### FIREBASE_CLIENT_X509_CERT_URL
```
https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mechifyv2.iam.gserviceaccount.com
```

## ☁️ Cloudflare R2 (5 variables)

### R2_ACCOUNT_ID
```
2bd7f6b6433d060f6ed0867ef99abe86
```

### R2_ACCESS_KEY_ID
```
75704a630fc032d0e4ef88fa9388fde6
```

### R2_SECRET_ACCESS_KEY
```
fcac464eb4a1ce7da47b45340bb9b7f4bb9aae1a40f4d767311897f8116d0f0a
```

### R2_BUCKET_NAME
```
mechify
```

### R2_PUBLIC_URL
```
https://pub-2bd7f6b6433d060f6ed0867ef99abe86.r2.dev
```

## 📋 Pasos en Vercel

1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Para cada variable:
   - Si ya existe: Haz clic en ella y actualiza el valor
   - Si no existe: Haz clic en **Add New** y crea la variable
3. Selecciona los ambientes: **Production**, **Preview**, **Development**
4. Haz clic en **Save**
5. **Re-despliega** la aplicación (Deployments → ... → Redeploy)

## ✅ Verificación

Después de configurar, visita:
- `https://mechiv2.vercel.app/api/health`

Deberías ver todas las variables marcadas como `presentVars`.

