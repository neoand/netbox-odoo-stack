# API Reference - API Gateway

## Overview

El API Gateway es el punto de entrada único para toda la plataforma NEO_STACK v3.0. Gestiona routing, rate limiting, autenticación y load balancing para todos los microservices.

## Authentication

Todos los endpoints requieren autenticación vía JWT token en el header `Authorization`.

```bash
Authorization: Bearer <token>
```

## Endpoints

### Health Check

#### GET /health

Verifica el status del API Gateway.

**Response** (200):
```json
{
  "status": "healthy",
  "timestamp": "2025-12-06T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "auth-service": "healthy",
    "tenant-manager": "healthy",
    "billing-service": "healthy"
  }
}
```

### Service Routes

#### GET /api/v1/services

Lista todos los servicios disponibles.

**Response** (200):
```json
{
  "services": [
    {
      "name": "auth-service",
      "url": "http://auth-service:8000",
      "version": "1.0.0",
      "status": "healthy"
    },
    {
      "name": "tenant-manager",
      "url": "http://tenant-manager:8001",
      "version": "1.0.0",
      "status": "healthy"
    }
  ]
}
```

### Rate Limiting

#### GET /api/v1/rate-limit

Retorna información sobre rate limiting del cliente actual.

**Response** (200):
```json
{
  "limit": 1000,
  "remaining": 995,
  "reset": "2025-12-06T11:00:00Z"
}
```

### Request Transformation

#### POST /api/v1/transform

Transforma una petición antes de enviar al servicio de destino.

**Request**:
```json
{
  "service": "tenant-manager",
  "endpoint": "/api/v1/tenants",
  "method": "POST",
  "headers": {
    "X-Custom-Header": "value"
  },
  "body": {
    "name": "Tenant Name",
    "plan": "professional"
  }
}
```

**Response** (200):
```json
{
  "transformed": true,
  "service": "tenant-manager",
  "endpoint": "/api/v1/tenants",
  "status": "forwarded"
}
```

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 401 | Unauthorized | Token inválido o faltante |
| 403 | Forbidden | Permisos insuficientes |
| 429 | Too Many Requests | Rate limit excedido |
| 502 | Bad Gateway | Servicio no disponible |
| 503 | Service Unavailable | Gateway sobrecargado |

## Rate Limiting Tiers

| Tier | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| **Free** | 1,000 | 10,000 |
| **Starter** | 10,000 | 100,000 |
| **Professional** | 100,000 | 1,000,000 |
| **Enterprise** | Unlimited | Unlimited |
