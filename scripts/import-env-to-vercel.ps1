# Script para importar variables de entorno de .env.local a Vercel
# Requiere tener Vercel CLI instalado: npm i -g vercel

Write-Host "🚀 Importando variables de entorno a Vercel..." -ForegroundColor Cyan
Write-Host ""

# Verificar que existe .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: No se encontró el archivo .env.local" -ForegroundColor Red
    exit 1
}

# Verificar que Vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI no está instalado." -ForegroundColor Yellow
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar que está logueado en Vercel
Write-Host "Verificando autenticación en Vercel..." -ForegroundColor Gray
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No estás logueado en Vercel." -ForegroundColor Yellow
    Write-Host "Ejecutando: vercel login" -ForegroundColor Yellow
    vercel login
}

Write-Host ""
Write-Host "Variables encontradas en .env.local:" -ForegroundColor Green
Write-Host ""

# Leer el archivo .env.local
$envContent = Get-Content ".env.local" | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' }

$variables = @()

foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remover comillas si las tiene
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        }
        
        $variables += @{
            Key = $key
            Value = $value
        }
        
        Write-Host "  ✓ $key" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "¿Deseas importar estas variables a Vercel? (S/N)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "S" -and $confirm -ne "s" -and $confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Operación cancelada." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Importando variables..." -ForegroundColor Cyan
Write-Host ""

foreach ($var in $variables) {
    Write-Host "Agregando $($var.Key)..." -ForegroundColor Yellow
    
    # Usar echo para pasar el valor al comando vercel env add
    $var.Value | vercel env add $var.Key production preview development
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $($var.Key) agregada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error al agregar $($var.Key)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✅ Proceso completado!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Redesplega tu proyecto en Vercel para que las variables surtan efecto." -ForegroundColor Yellow
Write-Host "   Puedes hacerlo desde el dashboard o ejecutando: vercel --prod" -ForegroundColor Gray
