#!/bin/bash
# Script para importar variables de entorno de .env.local a Vercel
# Requiere tener Vercel CLI instalado: npm i -g vercel

echo "🚀 Importando variables de entorno a Vercel..."
echo ""

# Verificar que existe .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Error: No se encontró el archivo .env.local"
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI no está instalado."
    echo "Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "Variables encontradas:"
echo ""

# Leer el archivo .env.local y procesar cada línea
while IFS='=' read -r key value; do
    # Ignorar comentarios y líneas vacías
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Limpiar espacios y comillas
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs | sed 's/^"//;s/"$//')
    
    echo "  - $key"
    
    # Agregar a Vercel
    echo "$value" | vercel env add "$key" production preview development
    
done < <(grep -v '^#' .env.local | grep '=')

echo ""
echo "✅ Variables importadas exitosamente a Vercel!"

