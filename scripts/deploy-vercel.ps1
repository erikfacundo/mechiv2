# Script completo para deploy en Vercel
# Incluye login, importacion de variables y deploy

Write-Host "[DEPLOY] Script de Deploy a Vercel" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "[ERROR] Error: No se encontro el archivo .env.local" -ForegroundColor Red
    exit 1
}

# Verificar que Vercel CLI esta instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "[WARN]  Vercel CLI no esta instalado." -ForegroundColor Yellow
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar autenticacion
Write-Host "Verificando autenticacion en Vercel..." -ForegroundColor Gray
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARN]  No estas logueado en Vercel." -ForegroundColor Yellow
    Write-Host "Iniciando sesion..." -ForegroundColor Yellow
    Write-Host ""
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Error al iniciar sesion en Vercel" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Autenticado como: $vercelWhoami" -ForegroundColor Green
}

Write-Host ""
Write-Host "[VARS] Paso 1: Importando variables de entorno..." -ForegroundColor Cyan
Write-Host ""

# Leer y importar variables
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
    }
}

Write-Host "Variables encontradas: $($variables.Count)" -ForegroundColor Green
Write-Host ""

foreach ($var in $variables) {
    Write-Host "Agregando $($var.Key)..." -ForegroundColor Yellow
    
    # Usar echo para pasar el valor
    $var.Value | vercel env add $var.Key production preview development 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $($var.Key) agregada" -ForegroundColor Green
    } else {
        Write-Host "  [WARN]  $($var.Key) - puede que ya exista o hubo un error" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[DEPLOY] Paso 2: Desplegando a Vercel..." -ForegroundColor Cyan
Write-Host ""

# Hacer deploy
Write-Host "Ejecutando: vercel --prod" -ForegroundColor Gray
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Deploy completado exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Error en el deploy. Revisa los logs arriba." -ForegroundColor Red
    exit 1
}

