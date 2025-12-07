# API Reference - Auth Service

## Visão Geral

O **Auth Service** baseado em **Authentik** é responsável pela autenticação e autorização multi-tenant da plataforma NEO_STACK v3.0. Oferece SSO (Single Sign-On), RBAC (Role-Based Access Control), e integrações com múltiplos provedores de identidade incluindo SAML 2.0, OAuth 2.0, LDAP/Active Directory e SCIM 2.0.

### Informações Base

- **Versão da API**: v3.0
- **Base URL**: `https://auth.platform.local/api/v3`
- **Protocolo**: HTTPS obrigatório
- **Formato**: JSON
- **Engine**: Authentik 2024.x

---

## Autenticação

### JWT Bearer Token

Todos os endpoints (exceto login, registro e health check) requerem autenticação via JWT:

```http
Authorization: Bearer <jwt_token>
```

### Headers Obrigatórios

```http
Content-Type: application/json
X-Tenant-ID: <tenant_id>
```

### Sessões

- **Lifetime**: 1 hora (3600 segundos)
- **Idle timeout**: 30 minutos (1800 segundos)
- **Refresh token**: Disponível por 7 dias

---

## Endpoints

### Health Check

Verifica o status do serviço de autenticação.

#### GET /api/v3/health

**Método**: GET
**URL**: `/api/v3/health`
**Autenticação**: Não requerida

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Serviço saudável

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

##### Exemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/health
```

---

### Autenticação de Usuário

#### POST /api/v3/auth/login/

**Método**: POST
**URL**: `/api/v3/auth/login/`
**Autenticação**: Não requerida

##### Parâmetros

**Body** (application/json):

```json
{
  "username": "string",
  "password": "string",
  "tenant_id": "string",
  "remember_me": "boolean"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| username | string | Sim | Nome de usuário ou email |
| password | string | Sim | Senha do usuário |
| tenant_id | string | Sim | ID do tenant |
| remember_me | boolean | Não | Manter sessão por 7 dias (padrão: false) |

##### Response

**200 OK** - Login realizado com sucesso

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

**401 Unauthorized** - Credenciais inválidas

```json
{
  "error": "invalid_credentials",
  "message": "Nome de usuário ou senha inválidos",
  "code": 1001
}
```

**429 Too Many Requests** - Tentativas de login excedidas

```json
{
  "error": "too_many_attempts",
  "message": "Muitas tentativas de login. Tente novamente em 15 minutos",
  "retry_after": 900
}
```

##### Exemplo cURL

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
**Autenticação**: Refresh Token

##### Parâmetros

**Body** (application/json):

```json
{
  "refresh_token": "string"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| refresh_token | string | Sim | Token de refresh |

##### Response

**200 OK** - Token renovado

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**401 Unauthorized** - Refresh token inválido ou expirado

##### Exemplo cURL

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
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**204 No Content** - Logout realizado com sucesso

##### Exemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/auth/logout/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Gerenciamento de Usuários

#### GET /api/v3/users/me/

**Método**: GET
**URL**: `/api/v3/users/me/`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Dados do usuário atual

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

##### Exemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/users/me/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### GET /api/v3/users/

**Método**: GET
**URL**: `/api/v3/users/`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| page | integer | Não | Número da página (padrão: 1) |
| page_size | integer | Não | Itens por página (padrão: 50, máximo: 100) |
| search | string | Não | Buscar por username ou email |
| group | string | Filtrar por grupo |
| is_active | boolean | Filtrar por status ativo |

##### Response

**200 OK** - Lista de usuários

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

##### Exemplo cURL

```bash
curl -X GET "https://auth.platform.local/api/v3/users/?page=1&page_size=50&search=admin" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### POST /api/v3/users/

**Método**: POST
**URL**: `/api/v3/users/`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

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

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| username | string | Sim | Nome único do usuário |
| email | string | Sim | Email do usuário |
| name | string | Sim | Nome completo |
| password | string | Sim | Senha inicial |
| groups | array | Não | Lista de grupos |
| attributes | object | Não | Atributos customizados |
| send_invitation | boolean | Não | Enviar email de convite (padrão: false) |

##### Response

**201 Created** - Usuário criado

```json
{
  "id": "user-124",
  "username": "novo_usuario",
  "email": "novo@example.com",
  "name": "Novo Usuário",
  "tenant_id": "tenant1",
  "groups": ["user"],
  "is_active": true,
  "created_at": "2025-12-06T10:30:00Z",
  "password_is_set": true
}
```

##### Exemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/users/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "novo_usuario",
    "email": "novo@example.com",
    "name": "Novo Usuário",
    "password": "secure_password",
    "groups": ["user"]
  }'
```

---

#### GET /api/v3/users/{user_id}/

**Método**: GET
**URL**: `/api/v3/users/{user_id}/`
**Autenticação**: Bearer Token

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| user_id | string | Sim | ID do usuário |

##### Response

**200 OK** - Detalhes do usuário

```json
{
  "id": "user-124",
  "username": "novo_usuario",
  "email": "novo@example.com",
  "name": "Novo Usuário",
  "first_name": "Novo",
  "last_name": "Usuário",
  "tenant_id": "tenant1",
  "groups": ["user"],
  "attributes": {
    "department": "Vendas"
  },
  "is_active": true,
  "date_joined": "2025-12-06T10:30:00Z",
  "last_login": null,
  "mfa_enabled": false
}
```

**404 Not Found** - Usuário não encontrado

##### Exemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/users/user-124/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### PATCH /api/v3/users/{user_id}/

**Método**: PATCH
**URL**: `/api/v3/users/{user_id}/`
**Autenticação**: Bearer Token (Admin ou próprio usuário)

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| user_id | string | Sim | ID do usuário |

**Body** (application/json) - Campos a serem atualizados:

```json
{
  "email": "novo@email.com",
  "name": "Nome Atualizado",
  "attributes": {
    "department": "Marketing"
  },
  "is_active": true
}
```

##### Response

**200 OK** - Usuário atualizado

```json
{
  "id": "user-124",
  "username": "novo_usuario",
  "email": "novo@email.com",
  "name": "Nome Atualizado",
  "updated_at": "2025-12-06T10:35:00Z"
}
```

##### Exemplo cURL

```bash
curl -X PATCH https://auth.platform.local/api/v3/users/user-124/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@email.com"
  }'
```

---

#### DELETE /api/v3/users/{user_id}/

**Método**: DELETE
**URL**: `/api/v3/users/{user_id}/`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| user_id | string | Sim | ID do usuário |

##### Response

**204 No Content** - Usuário excluído com sucesso

##### Exemplo cURL

```bash
curl -X DELETE https://auth.platform.local/api/v3/users/user-124/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### POST /api/v3/users/{user_id}/password/reset/

**Método**: POST
**URL**: `/api/v3/users/{user_id}/password/reset/`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| user_id | string | Sim | ID do usuário |

**Body** (application/json):

```json
{
  "send_email": "boolean"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| send_email | boolean | Não | Enviar email de redefinição (padrão: true) |

##### Response

**200 OK** - Solicitação processada

```json
{
  "message": "Email de redefinição enviado",
  "email_sent": true
}
```

##### Exemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/users/user-124/password/reset/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{"send_email": true}'
```

---

### Gerenciamento de Grupos

#### GET /api/v3/groups/

**Método**: GET
**URL**: `/api/v3/groups/`
**Autenticação**: Bearer Token

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| search | string | Não | Buscar por nome do grupo |

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

##### Exemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/groups/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1"
```

---

#### POST /api/v3/groups/

**Método**: POST
**URL**: `/api/v3/groups/`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Body** (application/json):

```json
{
  "name": "string",
  "description": "string",
  "attributes": {}
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Sim | Nome único do grupo |
| description | string | Não | Descrição do grupo |
| attributes | object | Não | Atributos customizados |

##### Response

**201 Created** - Grupo criado

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

##### Exemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/groups/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-Tenant-ID: tenant1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "custom-group",
    "description": "Grupo customizado"
  }'
```

---

#### POST /api/v3/groups/{group_id}/users/

**Método**: POST
**URL**: `/api/v3/groups/{group_id}/users/`
**Autenticação**: Bearer Token (Admin)

##### Parâmetros

**Path**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| group_id | string | Sim | ID do grupo |

**Body** (application/json):

```json
{
  "users": ["array"]
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| users | array | Sim | Lista de IDs de usuários |

##### Response

**200 OK** - Usuários adicionados ao grupo

```json
{
  "message": "Usuários adicionados ao grupo",
  "added_count": 3
}
```

##### Exemplo cURL

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

### Autenticação Multi-Fator (MFA)

#### GET /api/v3/mfa/totp/enroll/

**Método**: POST
**URL**: `/api/v3/mfa/totp/enroll/`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Enroll iniciado

```json
{
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauth_url": "otpauth://totp/Authentik:admin?secret=JBSWY3DPEHPK3PXP..."
}
```

##### Exemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/mfa/totp/enroll/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/mfa/totp/verify/

**Método**: POST
**URL**: `/api/v3/mfa/totp/verify/`
**Autenticação**: Bearer Token

##### Parâmetros

**Body** (application/json):

```json
{
  "token": "string"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| token | string | Sim | Código TOTP de 6 dígitos |

##### Response

**200 OK** - MFA habilitado

```json
{
  "enabled": true,
  "backup_codes": [
    "12345678",
    "87654321"
  ],
  "message": "MFA habilitado com sucesso"
}
```

##### Exemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/mfa/totp/verify/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

---

### Políticas de Acesso

#### GET /api/v3/policies/check/

**Método**: GET
**URL**: `/api/v3/policies/check/`
**Autenticação**: Bearer Token

##### Parâmetros

**Query String**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| permission | string | Sim | Permissão a verificar |
| model | string | Não | Modelo do objeto |
| pk | string | Não | Chave primária do objeto |

##### Response

**200 OK** - Resultado da verificação

```json
{
  "allowed": true,
  "permission": "admin:create",
  "user_id": "user-123",
  "reason": "User has admin group membership"
}
```

##### Exemplo cURL

```bash
curl -X GET "https://auth.platform.local/api/v3/policies/check/?permission=admin:create" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### POST /api/v3/policies/evaluate/

**Método**: POST
**URL**: `/api/v3/policies/evaluate/`
**Autenticação**: Bearer Token

##### Parâmetros

**Body** (application/json):

```json
{
  "policy_id": "string",
  "context": {}
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| policy_id | string | Sim | ID da política |
| context | object | Não | Contexto adicional |

##### Response

**200 OK** - Resultado da avaliação

```json
{
  "result": true,
  "policy_name": "Tenant Admin Policy",
  "passing": true,
  "messages": ["Policy evaluation successful"]
}
```

##### Exemplo cURL

```bash
curl -X POST https://auth.platform.local/api/v3/policies/evaluate/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": "policy-tenant-admin"
  }'
```

---

### Provedores OAuth/SAML

#### GET /api/v3/providers/oauth/

**Método**: GET
**URL**: `/api/v3/providers/oauth/`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Lista de provedores OAuth

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

##### Exemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/providers/oauth/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### GET /api/v3/providers/saml/

**Método**: GET
**URL**: `/api/v3/providers/saml/`
**Autenticação**: Bearer Token

##### Parâmetros

Nenhum.

##### Response

**200 OK** - Lista de provedores SAML

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

##### Exemplo cURL

```bash
curl -X GET https://auth.platform.local/api/v3/providers/saml/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Códigos de Erro

### Códigos HTTP Comuns

| Código | Descrição | Significado |
|--------|-----------|-------------|
| **200** | OK | Requisição processada com sucesso |
| **201** | Created | Recurso criado com sucesso |
| **204** | No Content | Operação realizada com sucesso |
| **400** | Bad Request | Parâmetros inválidos |
| **401** | Unauthorized | Autenticação necessária |
| **403** | Forbidden | Acesso negado |
| **404** | Not Found | Recurso não encontrado |
| **409** | Conflict | Conflito (ex: usuário já existe) |
| **422** | Unprocessable Entity | Dados inválidos |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Erro interno |

### Erros Específicos

| Código | Erro | Descrição |
|--------|------|-----------|
| **1001** | invalid_credentials | Credenciais inválidas |
| **1002** | account_locked | Conta bloqueada |
| **1003** | token_expired | Token expirado |
| **1004** | token_invalid | Token inválido |
| **1005** | mfa_required | MFA obrigatório |
| **1006** | mfa_invalid | Código MFA inválido |
| **1007** | weak_password | Senha muito fraca |
| **1008** | user_not_found | Usuário não encontrado |
| **1009** | group_not_found | Grupo não encontrado |
| **1010** | insufficient_permissions | Permissões insuficientes |
| **1011** | tenant_not_found | Tenant não encontrado |
| **1012** | provider_not_found | Provedor não encontrado |
| **1013** | rate_limit_exceeded | Rate limit excedido |
| **1014** | session_expired | Sessão expirada |

### Estrutura de Erro

```json
{
  "error": {
    "code": 1001,
    "type": "invalid_credentials",
    "message": "Nome de usuário ou senha inválidos",
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

- **Login**: 5 tentativas por 15 minutos por IP
- **API geral**: 1000 req/minuto por tenant
- **MFA**: 10 tentativas por hora por usuário

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Suporte

- **Documentação**: https://docs.auth.platform.local
- **Authentik Docs**: https://goauthentik.io/docs/
- **Email**: auth-support@platform.local
- **Slack**: #auth-service

---

**Versão**: 3.0.0
**Última Atualização**: 06 de Dezembro de 2025
