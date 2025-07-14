# Script para configurar datos iniciales del sistema de permisos
# Ejecutar desde PowerShell en el directorio del proyecto

Write-Host "🚀 Configurando datos iniciales del sistema..." -ForegroundColor Green

# Variables
$baseUrl = "http://127.0.0.1:3000"
$headers = @{
    "Content-Type" = "application/json"
}

# Función para hacer peticiones HTTP
function Invoke-API {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = "",
        [hashtable]$CustomHeaders = @{}
    )
    
    $requestHeaders = $headers.Clone()
    foreach ($key in $CustomHeaders.Keys) {
        $requestHeaders[$key] = $CustomHeaders[$key]
    }
    
    try {
        if ($Body -ne "") {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $requestHeaders -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $requestHeaders
        }
        return $response
    }
    catch {
        Write-Host "❌ Error en $Method $Url : $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Respuesta del servidor: $responseBody" -ForegroundColor Red
        }
        return $null
    }
}

# 1. Crear roles
Write-Host "📋 Creando roles..." -ForegroundColor Yellow

$roles = @(
    @{
        nombre = "ADMIN"
        descripcion = "Administrador del sistema"
        permisos = @("READ", "WRITE", "DELETE", "AUTHORIZE")
    },
    @{
        nombre = "TECNICO"
        descripcion = "Técnico de campo"
        permisos = @("READ", "WRITE")
    },
    @{
        nombre = "SUPERVISOR"
        descripcion = "Supervisor de campo"
        permisos = @("READ", "WRITE", "AUTHORIZE")
    },
    @{
        nombre = "PLANIFICADOR"
        descripcion = "Planificador de trabajos"
        permisos = @("READ", "WRITE", "AUTHORIZE")
    }
)

$roleIds = @{}

foreach ($role in $roles) {
    $roleBody = $role | ConvertTo-Json -Depth 3
    Write-Host "  Creando rol: $($role.nombre)" -ForegroundColor Cyan
    $response = Invoke-API -Method "POST" -Url "$baseUrl/roles" -Body $roleBody
    if ($response) {
        $roleIds[$role.nombre] = $response.id
        Write-Host "  ✅ Rol $($role.nombre) creado con ID: $($response.id)" -ForegroundColor Green
    }
}

# 2. Crear áreas
Write-Host "🏢 Creando áreas..." -ForegroundColor Yellow

$areas = @(
    @{
        nombre = "CYR CENTRO"
        descripcion = "Área Centro de la ciudad"
    },
    @{
        nombre = "CYR SUR"
        descripcion = "Área Sur de la ciudad"
    }
)

$areaIds = @{}

foreach ($area in $areas) {
    $areaBody = $area | ConvertTo-Json -Depth 3
    Write-Host "  Creando área: $($area.nombre)" -ForegroundColor Cyan
    $response = Invoke-API -Method "POST" -Url "$baseUrl/areas" -Body $areaBody
    if ($response) {
        $areaIds[$area.nombre] = $response.id
        Write-Host "  ✅ Área $($area.nombre) creada con ID: $($response.id)" -ForegroundColor Green
    }
}

# 3. Crear tipos de permiso
Write-Host "📝 Creando tipos de permiso..." -ForegroundColor Yellow

$tiposPermiso = @(
    @{
        nombre = "Altura"
        descripcion = "Permiso para trabajos en altura"
        requisitos = @("Arnés de seguridad", "Casco", "Botas de seguridad", "Línea de vida")
        duracion = 8
        activo = $true
    },
    @{
        nombre = "Enganche"
        descripcion = "Permiso para trabajos de enganche y izaje"
        requisitos = @("Casco", "Botas de seguridad", "Guantes", "Chaleco reflectivo")
        duracion = 6
        activo = $true
    },
    @{
        nombre = "Cierre"
        descripcion = "Permiso para trabajos de cierre de circuitos"
        requisitos = @("Casco", "Botas de seguridad", "Guantes aislantes", "Herramientas certificadas")
        duracion = 4
        activo = $true
    }
)

$tipoPermisoIds = @{}

foreach ($tipo in $tiposPermiso) {
    $tipoBody = $tipo | ConvertTo-Json -Depth 3
    Write-Host "  Creando tipo de permiso: $($tipo.nombre)" -ForegroundColor Cyan
    $response = Invoke-API -Method "POST" -Url "$baseUrl/tipos-permiso" -Body $tipoBody
    if ($response) {
        $tipoPermisoIds[$tipo.nombre] = $response.id
        Write-Host "  ✅ Tipo de permiso $($tipo.nombre) creado con ID: $($response.id)" -ForegroundColor Green
    }
}

# 4. Crear usuarios
Write-Host "👥 Creando usuarios..." -ForegroundColor Yellow

$usuarios = @(
    @{
        email = "admin1@demo.com"
        password = "123456"
        nombre = "Administrador"
        apellido = "Sistema"
        telefono = "+1234567890"
        roleId = $roleIds["ADMIN"]
        areaId = $areaIds["CYR CENTRO"]
    },
    @{
        email = "tecnico1@demo.com"
        password = "123456"
        nombre = "Juan"
        apellido = "Técnico"
        telefono = "+1234567891"
        roleId = $roleIds["TECNICO"]
        areaId = $areaIds["CYR CENTRO"]
    },
    @{
        email = "supervisor1@demo.com"
        password = "123456"
        nombre = "María"
        apellido = "Supervisora"
        telefono = "+1234567892"
        roleId = $roleIds["SUPERVISOR"]
        areaId = $areaIds["CYR SUR"]
    },
    @{
        email = "planificador1@demo.com"
        password = "123456"
        nombre = "Carlos"
        apellido = "Planificador"
        telefono = "+1234567893"
        roleId = $roleIds["PLANIFICADOR"]
        areaId = $areaIds["CYR CENTRO"]
    }
)

$userIds = @{}

foreach ($usuario in $usuarios) {
    $userBody = $usuario | ConvertTo-Json -Depth 3
    Write-Host "  Creando usuario: $($usuario.email)" -ForegroundColor Cyan
    $response = Invoke-API -Method "POST" -Url "$baseUrl/auth/register" -Body $userBody
    if ($response) {
        $userIds[$usuario.email] = $response.user.id
        Write-Host "  ✅ Usuario $($usuario.email) creado con ID: $($response.user.id)" -ForegroundColor Green
        Write-Host "  🔑 Token: $($response.access_token)" -ForegroundColor Gray
    }
}

# 5. Mostrar resumen
Write-Host "`n📊 RESUMEN DE CONFIGURACIÓN:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host "`n👑 Roles creados:" -ForegroundColor Yellow
foreach ($role in $roles) {
    Write-Host "  - $($role.nombre): $($roleIds[$role.nombre])" -ForegroundColor White
}

Write-Host "`n🏢 Áreas creadas:" -ForegroundColor Yellow
foreach ($area in $areas) {
    Write-Host "  - $($area.nombre): $($areaIds[$area.nombre])" -ForegroundColor White
}

Write-Host "`n📝 Tipos de permiso creados:" -ForegroundColor Yellow
foreach ($tipo in $tiposPermiso) {
    Write-Host "  - $($tipo.nombre): $($tipoPermisoIds[$tipo.nombre])" -ForegroundColor White
}

Write-Host "`n👥 Usuarios creados:" -ForegroundColor Yellow
foreach ($usuario in $usuarios) {
    Write-Host "  - $($usuario.email): $($userIds[$usuario.email])" -ForegroundColor White
}

Write-Host "`n🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "Puedes iniciar sesión con cualquiera de los usuarios creados usando la contraseña: 123456" -ForegroundColor Cyan 