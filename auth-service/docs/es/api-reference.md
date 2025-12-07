# API Reference - Auth Service

## Visión General

El **Auth Service** basado en **Authentik** es responsable de la autenticación y autorización multi-tenant de la plataforma NEO_STACK v3.0. Ofrece SSO (Single Sign-On), RBAC (Role-Based Access Control), e integraciones con múltiples proveedores de identidad incluyendo SAML 2.0, OAuth 2.0, LDAP/Active Directory y SCIM 2.0.

### Información Base

- **Versión de la API**: v3.0
- **URL Base**: `https://auth.platform.local/api/v3`
- **Protocolo**: HTTPS obligatorio
- **Formato**: JSON
- **Engine**: Authentik 2024.x

---

## Autenticación

### JWT Bearer Token

Todos los endpoints (excepto login, registro y health check) requieren autenticación via JWT:

```http
Authorization: Bearer <jwt_token>
```

### Headers Obligatorios

```http
Content-Type: application/json
X-Tenant-ID: <tenant_id>
```

### Sesiones

- **Lifetime**: 1 hora (3600 segundos)
- **Idle timeout**: 30 minutos (1800 segundos)
- **Refresh token**: Disponible por 7 días

---

## Endpoints

### Health Check

Verifica el estado del servicio de autenticación.

#### GET /api/v3/health

**Método**: GET
**URL**: `/api/v3/health`
**Autenticación**: No requerida

##### Parámetros

Ninguno.

##### Response

**200 OK** - Servicio saludable

```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T10:30:00Z",
  "version": "2024.10.2",
  "database": "connected",
  "redis": "connected",
  "tenants_active": 42
}
```

##### Ejemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/health
```

---

### Autenticación de Usuario

#### POST /api/v3/auth/login/

**Método**: POST
**URL**: `/api/v3/auth/login/`
**Autenticación**: No requerida

##### Parámetros

**Body** (application/json):

```json
{
  "username": "string",
  "password": "string",
  "tenant_id": "string",
  "remember_me": "boolean"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| username | string | Sí | Nombre de usuario o email |
| password | string | Sí | Contraseña del usuario |
| tenant_id | string | Sí | ID del tenant |
| remember_me | boolean | No | Mantener sesión por 7 días (predeterminado: false) |

##### Response

**200 OK** - Login exitoso

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "user-123",
    "username": "admin",
    "email": "admin@example.com",
    "name": "Administrador Sistema",
    "tenant_id": "tenant1",
    "groups": ["admin", "tenant-admin"],
    "is_active": true,
    "last_login": "2025-12-06T10:30:00Z"
  }
}
```

**401 Unauthorized** - Credenciales inválidas

```json
{
  "error": "invalid_credentials",
  "message": "Nombre de usuario o contraseña inválidos",
  "code": 1001
}
```

**429 Too Many Requests** - Intentos de login excedidos

```json
{
  "error": "too_many_attempts",
  "message": "Demasiados intentos de login. Intente nuevamente en 15 minutos",
  "retry_after": 900
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure_password",
    "tenant_id": "tenant1",
    "remember_me": false
  }'
```

---

#### POST /api/v3/auth/refresh/

**Método**: POST
**URL**: `/api/v3/auth/refresh/`
**Autenticación**: Refresh Token

##### Parámetros

**Body** (application/json):

```json
{
  "refresh_token": "string"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| refresh_token | string | Sí | Token de refresh |

##### Response

**200 OK** - Token renovado

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**401 Unauthorized** - Refresh token inválido o expirado

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

#### POST /api/v3/auth/logout/

**Método**: POST
**URL**: `/api/v3/auth/logout/`
**Autenticación**: Bearer Token

##### Parámetros

Ninguno.

##### Response

**204 No Content** - Logout exitoso

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/auth/logout/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Gestión de Usuarios

#### GET /api/v3/users/me/

**Método**: GET
**URL**: `/api/v3/users/me/`
**Autenticación**: Bearer Token

##### Parámetros

Ninguno.

##### Response

**200 OK** - Datos del usuario actual

```json
{
  "id": "user-123",
  "username": "admin",
  "email": "admin@example.com",
  "name": "Administrador Sistema",
  "first_name": "Administrador",
  "last_name": "Sistema",
  "tenant_id": "tenant1",
  "groups": ["admin", "tenant-admin"],
  "attributes": {
    "role": "admin",
    "department": "TI",
    "employee_id": "EMP-001"
  },
  "is_active": true,
  "is_superuser": false,
  "date_joined": "2025-01-01T00:00:00Z",
  "last_login": "2025-12-06T10:30:00Z",
  "mfa_enabled": true,
  "password_last_set": "2025-11-01T00:00:00Z"
}
```

##### Ejemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/users/me/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### GET /api/v3/users/

**Método**: GET
**URL**: `/api/v3/users/`
**Autenticación**: Bearer Token (Admin)

##### Parámetros

**Query String**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| page | integer | No | Número de página (predeterminado: 1) |
| page_size | integer | No | Items por página (predeterminado: 50, máximo: 100) |
| search | string | No | Buscar por username o email |
| group | string | No | Filtrar por grupo |
| is_active | boolean | No | Filtrar por estado activo |

##### Response

**200 OK** - Lista de usuarios

```json
{
  "count": 150,
  "total_pages": 3,
  "page": 1,
  "page_size": 50,
  "results": [
    {
      "id": "user-123",
      "username": "admin",
      "email": "admin@example.com",
      "name": "Administrador Sistema",
      "tenant_id": "tenant1",
      "groups": ["admin", "tenant-admin"],
      "is_active": true,
      "last_login": "2025-12-06T10:30:00Z"
    }
  ]
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://auth.platform.local/api/v3/users/?page=1&page_size=50&search=admin" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### POST /api/v3/users/

**Método**: POST
**URL**: `/api/v3/users/`
**Autenticación**: Bearer Token (Admin)

##### Parámetros

**Body** (application/json):

```json
{
  "username": "string",
  "email": "string",
  "name": "string",
  "password": "string",
  "groups": ["array"],
  "attributes": {},
  "send_invitation": "boolean"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| username | string | Sí | Nombre único del usuario |
| email | string | Sí | Email del usuario |
| name | string | Sí | Nombre completo |
| password | string | Sí | Contraseña inicial |
| groups | array | No | Lista de grupos |
| attributes | object | No | Atributos personalizados |
| send_invitation | boolean | No | Enviar email de invitación (predeterminado: false) |

##### Response

**201 Created** - Usuario creado

```json
{
  "id": "user-124",
  "username": "nuevo_usuario",
  "email": "nuevo@example.com",
  "name": "Nuevo Usuario",
  "tenant_id": "tenant1",
  "groups": ["user"],
  "is_active": true,
  "created_at": "2025-12-06T10:30:00Z",
  "password_is_set": true
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/users/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nuevo_usuario",
    "email": "nuevo@example.com",
    "name": "Nuevo Usuario",
    "password": "secure_password",
    "groups": ["user"]
  }'
```

---

#### GET /api/v3/users/{user_id}/

**Método**: GET
**URL**: `/api/v3/users/{user_id}/`
**Autenticación**: Bearer Token

##### Parámetros

**Path**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| user_id | string | Sí | ID del usuario |

##### Response

**200 OK** - Detalles del usuario

```json
{
  "id": "user-124",
  "username": "nuevo_usuario",
  "email": "nuevo@example.com",
  "name": "Nuevo Usuario",
  "first_name": "Nuevo",
  "last_name": "Usuario",
  "tenant_id": "tenant1",
  "groups": ["user"],
  "attributes": {
    "department": "Ventas"
  },
  "is_active": true,
  "date_joined": "2025-12-06T10:30:00Z",
  "last_login": null,
  "mfa_enabled": false
}
```

**404 Not Found** - Usuario no encontrado

##### Ejemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/users/user-124/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### PATCH /api/v3/users/{user_id}/

**Método**: PATCH
**URL**: `/api/v3/users/{user_id}/`
**Autenticación**: Bearer Token (Admin o usuario propio)

##### Parámetros

**Path**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| user_id | string | Sí | ID del usuario |

**Body** (application/json) - Campos a actualizar:

```json
{
  "email": "nuevo@email.com",
  "name": "Nombre Actualizado",
  "attributes": {
    "department": "Marketing"
  },
  "is_active": true
}
```

##### Response

**200 OK** - Usuario actualizado

```json
{
  "id": "user-124",
  "username": "nuevo_usuario",
  "email": "nuevo@email.com",
  "name": "Nombre Actualizado",
  "updated_at": "2025-12-06T10:35:00Z"
}
```

##### Ejemplo cURL

```bash
curl -X PATCH https://auth.platform.local/api/v3/users/user-124/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@email.com"
  }'
```

---

#### DELETE /api/v3/users/{user_id}/

**Método**: DELETE
**URL**: `/api/v3/users/{user_id}/`
**Autenticación**: Bearer Token (Admin)

##### Parámetros

**Path**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| user_id | string | Sí | ID del usuario |

##### Response

**204 No Content** - Usuario eliminado exitosamente

##### Ejemplo cURL

```bash
curl -X DELETE https://auth.platform.local/api/v3/users/user-124/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### POST /api/v3/users/{user_id}/password/reset/

**Método**: POST
**URL**: `/api/v3/users/{user_id}/password/reset/`
**Autenticación**: Bearer Token (Admin)

##### Parámetros

**Path**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| user_id | string | Sí | ID del usuario |

**Body** (application/json):

```json
{
  "send_email": "boolean"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| send_email | boolean | No | Enviar email de restablecimiento (predeterminado: true) |

##### Response

**200 OK** - Solicitud procesada

```json
{
  "message": "Email de restablecimiento enviado",
  "email_sent": true
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/users/user-124/password/reset/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{"send_email": true}'
```

---

### Gestión de Grupos

#### GET /api/v3/groups/

**Método**: GET
**URL**: `/api/v3/groups/`
**Autenticación**: Bearer Token

##### Parámetros

**Query String**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| search | string | No | Buscar por nombre del grupo |

##### Response

**200 OK** - Lista de grupos

```json
{
  "results": [
    {
      "id": "group-admin",
      "name": "admin",
      "description": "Administrators group",
      "tenant_id": "tenant1",
      "user_count": 5,
      "is_system": true
    },
    {
      "id": "group-user",
      "name": "user",
      "description": "Regular users group",
      "tenant_id": "tenant1",
      "user_count": 45,
      "is_system": true
    }
  ]
}
```

##### Ejemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/groups/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### POST /api/v3/groups/

**Método**: POST
**URL**: `/api/v3/groups/`
**Autenticación**: Bearer Token (Admin)

##### Parámetros

**Body** (application/json):

```json
{
  "name": "string",
  "description": "string",
  "attributes": {}
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| name | string | Sí | Nombre único del grupo |
| description | string | No | Descripción del grupo |
| attributes | object | No | Atributos personalizados |

##### Response

**201 Created** - Grupo creado

```json
{
  "id": "group-custom",
  "name": "custom-group",
  "description": "Custom group",
  "tenant_id": "tenant1",
  "user_count": 0,
  "is_system": false,
  "created_at": "2025-12-06T10:30:00Z"
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/groups/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "custom-group",
    "description": "Grupo personalizado"
  }'
```

---

#### POST /api/v3/groups/{group_id}/users/

**Método**: POST
**URL**: `/api/v3/groups/{group_id}/users/`
**Autenticación**: Bearer Token (Admin)

##### Parámetros

**Path**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| group_id | string | Sí | ID del grupo |

**Body** (application/json):

```json
{
  "users": ["array"]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| users | array | Sí | Lista de IDs de usuarios |

##### Response

**200 OK** - Usuarios agregados al grupo

```json
{
  "message": "Usuarios agregados al grupo",
  "added_count": 3
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/groups/group-custom/users/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{
    "users": ["user-123", "user-124", "user-125"]
  }'
```

---

### Autenticación Multi-Factor (MFA)

#### GET /api/v3/mfa/totp/enroll/

**Método**: POST
**URL**: `/api/v3/mfa/totp/enroll/`
**Autenticación**: Bearer Token

##### Parámetros

Ninguno.

##### Response

**200 OK** - Enroll iniciado

```json
{
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauth_url": "otpauth://totp/Authentik:admin?secret=JBSWY3DPEHPK3PXP..."
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/mfa/totp/enroll/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/mfa/totp/verify/

**Método**: POST
**URL**: `/api/v3/mfa/totp/verify/`
**Autenticación**: Bearer Token

##### Parámetros

**Body** (application/json):

```json
{
  "token": "string"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| token | string | Sí | Código TOTP de 6 dígitos |

##### Response

**200 OK** - MFA habilitado

```json
{
  "enabled": true,
  "backup_codes": [
    "12345678",
    "87654321"
  ],
  "message": "MFA habilitado exitosamente"
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/mfa/totp/verify/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

---

### Políticas de Acceso

#### GET /api/v3/policies/check/

**Método**: GET
**URL**: `/api/v3/policies/check/`
**Autenticación**: Bearer Token

##### Parámetros

**Query String**:

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| permission | string | Sí | Permiso a verificar |
| model | string | No | Modelo del objeto |
| pk | string | No | Clave primaria del objeto |

##### Response

**200 OK** - Resultado de la verificación

```json
{
  "allowed": true,
  "permission": "admin:create",
  "user_id": "user-123",
  "reason": "User has admin group membership"
}
```

##### Ejemplo cURL

```bash
curl -X GET "https://auth.platform.local/api/v3/policies/check/?permission=admin:create" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/policies/evaluate/

**Método**: POST
**URL**: `/api/v3/policies/evaluate/`
**Autenticación**: Bearer Token

##### Parámetros

**Body** (application/json):

```json
{
  "policy_id": "string",
  "context": {}
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| policy_id | string | Sí | ID de la política |
| context | object | No | Contexto adicional |

##### Response

**200 OK** - Resultado de la evaluación

```json
{
  "result": true,
  "policy_name": "Tenant Admin Policy",
  "passing": true,
  "messages": ["Policy evaluation successful"]
}
```

##### Ejemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/policies/evaluate/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": "policy-tenant-admin"
  }'
```

---

### Proveedores OAuth/SAML

#### GET /api/v3/providers/oauth/

**Método**: GET
**URL**: `/api/v3/providers/oauth/`
**Autenticación**: Bearer Token

##### Parámetros

Ninguno.

##### Response

**200 OK** - Lista de proveedores OAuth

```json
{
  "results": [
    {
      "id": "oauth-google",
      "name": "Google",
      "type": "oauth",
      "client_id": "google-client-id",
      "authorization_url": "https://accounts.google.com/o/oauth2/auth",
      "token_url": "https://oauth2.googleapis.com/token",
      "user_info_url": "https://www.googleapis.com/oauth2/v2/userinfo",
      "tenant_id": "tenant1"
    }
  ]
}
```

##### Ejemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/providers/oauth/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/providers/saml/

**Método**: GET
**URL**: `/api/v3/providers/saml/`
**Autenticación**: Bearer Token

##### Parámetros

Ninguno.

##### Response

**200 OK** - Lista de proveedores SAML

```json
{
  "results": [
    {
      "id": "saml-corp",
      "name": "Corporate SAML",
      "type": "saml",
      "acs_url": "https://auth.platform.local/acs/saml-corp/",
      "sso_url": "https://idp.corp.com/sso",
      "tenant_id": "tenant1",
      "sp_entity_id": "neo-stack-saml"
    }
  ]
}
```

##### Ejemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/providers/saml/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Códigos de Error

### Códigos HTTP Comunes

| Código | Descripción | Significado |
|--------|-------------|-------------|
| **200** | OK | Request procesado exitosamente |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Operación exitosa |
| **400** | Bad Request | Parámetros inválidos |
| **401** | Unauthorized | Autenticación necesaria |
| **403** | Forbidden | Acceso denegado |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto (ej: usuario ya existe) |
| **422** | Unprocessable Entity | Datos inválidos |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Error interno |

### Errores Específicos

| Código | Error | Descripción |
|--------|-------|-------------|
| **1001** | invalid_credentials | Credenciales inválidas |
| **1002** | account_locked | Cuenta bloqueada |
| **1003** | token_expired | Token expirado |
| **1004** | token_invalid | Token inválido |
| **1005** | mfa_required | MFA obligatorio |
| **1006** | mfa_invalid | Código MFA inválido |
| **1007** | weak_password | Contraseña muy débil |
| **1008** | user_not_found | Usuario no encontrado |
| **1009** | group_not_found | Grupo no encontrado |
| **1010** | insufficient_permissions | Permisos insuficientes |
| **1011** | tenant_not_found | Tenant no encontrado |
| **1012** | provider_not_found | Proveedor no encontrado |
| **1013** | rate_limit_exceeded | Rate limit excedido |
| **1014** | session_expired | Sesión expirada |

### Estructura de Error

```json
{
  "error": {
    "code": 1001,
    "type": "invalid_credentials",
    "message": "Nombre de usuario o contraseña inválidos",
    "details": {
      "field": "password",
      "attempts_remaining": 3
    },
    "timestamp": "2025-12-06T10:30:00Z"
  }
}
```

---

## Rate Limiting

- **Login**: 5 intentos por 15 minutos por IP
- **API general**: 1000 req/minuto por tenant
- **MFA**: 10 intentos por hora por usuario

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Soporte

- **Documentación**: https://docs.auth.platform.local
- **Authentik Docs**: https://goauthentik.io/docs/
- **Email**: auth-support@platform.local
- **Slack**: #auth-service

---

**Versión**: 3.0.0
**Última Actualización**: 06 de Diciembre de 2025
