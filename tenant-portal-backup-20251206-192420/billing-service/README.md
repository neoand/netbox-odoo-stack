# 💰 NEO_STACK Billing Service v3.0

**Enterprise SaaS Billing & Subscription Management Platform**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](./)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Stripe](https://img.shields.io/badge/Stripe-Integrated-blue.svg)](#-stripe-integration)
[![Multi-tenant](https://img.shields.io/badge/Multi--tenant-SaaS-green.svg)](#-multi-tenant-architecture)
[![API](https://img.shields.io/badge/API-REST-orange.svg)](#-api-reference)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Architecture](#-architecture)
4. [Stripe Integration](#-stripe-integration)
5. [Subscription Plans](#-subscription-plans)
6. [Usage-Based Billing](#-usage-based-billing)
7. [Quick Start](#-quick-start)
8. [API Reference](#-api-reference)
9. [Webhooks](#-webhooks)
10. [Billing Cycles](#-billing-cycles)
11. [Analytics](#-analytics)
12. [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

O **NEO_STACK Billing Service** é um sistema completo de gestão de billing e assinaturas para a plataforma SaaS multi-tenant. Integração nativa com Stripe, suporte a múltiplas moedas, billing baseado em uso, e automação completa de faturas.

### Key Capabilities

- 💳 **Stripe Integration**: Pagamentos globais seguros
- 🌍 **Multi-Currency**: Suporte a USD, EUR, BRL, MXN
- 📊 **Usage-Based Billing**: Precificação dinâmica por uso
- 🔄 **Subscription Management**: Upgrade/downgrade automático
- 📄 **Invoice Automation**: Geração automática de faturas
- 💰 **Proration**: Ajuste proporcional em mudanças de plano
- 🎁 **Coupons & Discounts**: Sistema de cupons flexível
- 📧 **Email Notifications**: Alertas automáticos
- 🏢 **Multi-Tenant**: Isolamento por tenant
- 📈 **Analytics**: Relatórios detalhados de receita

---

## ✨ Features

### Core Billing Features

**Subscription Management**:
- Create, update, cancel subscriptions
- Upgrade/downgrade with proration
- Trial periods
- Pause/resume subscriptions
- Automatic renewal

**Payment Processing**:
- Credit/debit cards
- ACH transfers
- Wire transfers (enterprise)
- Local payment methods
- Dunning management

**Invoice Management**:
- Auto-generated invoices
- PDF generation
- Email delivery
- Payment reminders
- Collections process

**Tax Handling**:
- Automatic tax calculation
- VAT support
- Regional tax compliance
- Tax exemption certificates
- International tax rules

### Enterprise Features

**Usage Tracking**:
- API calls
- Storage usage
- Bandwidth consumption
- User seats
- Custom metrics

**Custom Pricing**:
- Volume discounts
- Enterprise agreements
- Custom contracts
- Prepaid credits
- Committed use discounts

**Reporting**:
- Revenue analytics
- Churn analysis
- LTV calculation
- MRR/ARR tracking
- Cohort analysis

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                NEO_STACK Billing Service                         │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway (Kong)                                             │
│  ├── Rate Limiting                                              │
│  ├── Authentication                                             │
│  └── Load Balancing                                             │
├─────────────────────────────────────────────────────────────────┤
│  Application Layer                                              │
│  ├── Billing API (FastAPI)                                     │
│  ├── Stripe Webhook Handler                                    │
│  ├── Usage Tracker                                              │
│  └── Invoice Generator                                          │
├─────────────────────────────────────────────────────────────────┤
│  Service Layer                                                  │
│  ├── Subscription Service                                       │
│  ├── Payment Service                                            │
│  ├── Invoice Service                                            │
│  └── Analytics Service                                          │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ├── PostgreSQL (Billing DB)                                   │
│  ├── Redis (Cache)                                             │
│  └── Stripe (Payment Processor)                                │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

**Tables**:
- `tenants` - Tenant information
- `subscriptions` - Subscription details
- `plans` - Subscription plans
- `invoices` - Invoice records
- `payments` - Payment transactions
- `usage_records` - Usage tracking
- `coupons` - Discount codes
- `events` - Billing events

### Core Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API** | FastAPI | RESTful billing API |
| **Database** | PostgreSQL | Persistent storage |
| **Cache** | Redis | Session & cache |
| **Payments** | Stripe | Payment processing |
| **Queue** | Redis + Celery | Async billing tasks |
| **Email** | SendGrid | Invoice delivery |

---

## 💳 Stripe Integration

### Setup

1. **Create Stripe Account**
   - Sign up at stripe.com
   - Complete verification
   - Get API keys

2. **Configure Stripe**
   ```bash
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Enable Features**
   - Subscriptions
   - Invoicing
   - Tax handling
   - Payment methods

### Payment Methods

**Cards**:
- Visa, Mastercard, Amex
- Debit cards
- Prepaid cards
- 3D Secure

**Bank Transfers**:
- ACH (US)
- SEPA (EU)
- BACS (UK)
- Local ACH

**Digital Wallets**:
- Apple Pay
- Google Pay
- Microsoft Pay
- Samsung Pay

**Buy Now, Pay Later**:
- Klarna
- Afterpay
- Sezzle
- Affirm

### Webhook Events

```python
# Stripe webhook events we handle
STRIPE_EVENTS = [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.created',
    'invoice.paid',
    'invoice.payment_failed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
]
```

---

## 📦 Subscription Plans

### Standard Plans

#### 🥉 Starter
**Price**: $49/month
**Target**: Small teams (1-10 users)

**Includes**:
- 10,000 API calls/month
- 100GB storage
- 1TB bandwidth
- Email support
- Basic analytics

**Overage**:
- $0.001 per additional API call
- $0.10/GB additional storage
- $0.05/GB additional bandwidth

#### 🥈 Professional
**Price**: $199/month
**Target**: Growing businesses (10-50 users)

**Includes**:
- 100,000 API calls/month
- 1TB storage
- 10TB bandwidth
- Priority support
- Advanced analytics
- Custom integrations

**Overage**:
- $0.0008 per additional API call
- $0.08/GB additional storage
- $0.04/GB additional bandwidth

#### 🥇 Enterprise
**Price**: $799/month
**Target**: Large organizations (50-200 users)

**Includes**:
- 1,000,000 API calls/month
- 10TB storage
- 100TB bandwidth
- 24/7 phone support
- SLA guarantees
- Dedicated account manager
- Custom features

**Overage**:
- $0.0005 per additional API call
- $0.05/GB additional storage
- $0.02/GB additional bandwidth

#### 💎 Ultimate
**Price**: $2,499/month
**Target**: Enterprise (200+ users)

**Includes**:
- Unlimited API calls
- Unlimited storage
- Unlimited bandwidth
- White-glove support
- Custom SLAs
- Dedicated infrastructure
- Custom development

**Overage**:
- No overage charges
- Custom pricing

### Enterprise Custom Plans

**Dedicated Infrastructure**:
- $5,000/month base
- Custom resource allocation
- Dedicated support team
- Custom SLA (99.99% uptime)

**Committed Use Discounts**:
- 1-year commitment: 20% off
- 2-year commitment: 30% off
- 3-year commitment: 40% off

**Volume Discounts**:
- 10-49 subscriptions: 10% off
- 50-99 subscriptions: 15% off
- 100+ subscriptions: 25% off

### Free Tier

**NEO_STACK Free**:
- 1,000 API calls/month
- 10GB storage
- 100GB bandwidth
- Community support
- Basic analytics

**Limitations**:
- No SLA
- No priority support
- Limited features

---

## 📊 Usage-Based Billing

### Metrics Tracked

**API Usage**:
- Requests per tenant
- Rate limits
- Error rates
- Response times

**Storage**:
- Total storage used
- File count
- Retention period
- Backup storage

**Bandwidth**:
- Data transfer
- Download/upload ratio
- Peak usage
- Geographic distribution

**User Seats**:
- Active users
- Seat utilization
- Role-based access
- Guest users

**Custom Metrics**:
- Custom-defined by tenant
- Integration usage
- ML model calls
- Data processing

### Usage Calculation

```python
def calculate_usage_cost(tenant_id, period_start, period_end):
    """Calculate usage-based charges"""
    api_calls = get_api_usage(tenant_id, period_start, period_end)
    storage_gb = get_storage_usage(tenant_id, period_end)
    bandwidth_gb = get_bandwidth_usage(tenant_id, period_start, period_end)

    api_cost = api_calls * plan.api_rate
    storage_cost = storage_gb * plan.storage_rate
    bandwidth_cost = bandwidth_gb * plan.bandwidth_rate

    total = api_cost + storage_cost + bandwidth_cost
    return total
```

### Usage Alerts

**Threshold Alerts**:
- 75% of plan limit
- 90% of plan limit
- 100% of plan limit (overage)

**Actions**:
- Email notification
- SMS alert
- Dashboard warning
- Auto-upgrade suggestion

---

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 13+
- Redis 6+
- Stripe account

### Installation

```bash
# Clone repository
git clone https://github.com/neo-stack/neo_netbox_odoo_stack.git
cd neo_netbox_odoo_stack/platform/billing-service

# Configure environment
cp .env.example .env
# Edit .env with your Stripe keys

# Start services
docker-compose up -d

# Initialize database
docker-compose exec api python -m scripts.init_db

# Access API
open http://localhost:8003/docs
```

### Environment Variables

```bash
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://billing_user:password@db:5432/billing

# Redis
REDIS_URL=redis://redis:6379/0

# Email
SENDGRID_API_KEY=SG....
FROM_EMAIL=billing@neo-stack.com

# Security
SECRET_KEY=your-secret-key-change-me
```

### First Steps

1. **Create Plan**
   ```bash
   curl -X POST http://localhost:8003/api/plans \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Professional",
       "price": 199.00,
       "currency": "USD",
       "interval": "month"
     }'
   ```

2. **Create Customer**
   ```bash
   curl -X POST http://localhost:8003/api/customers \
     -H "Content-Type: application/json" \
     -d '{
       "email": "customer@example.com",
       "name": "John Doe"
     }'
   ```

3. **Create Subscription**
   ```bash
   curl -X POST http://localhost:8003/api/subscriptions \
     -H "Content-Type: application/json" \
     -d '{
       "customer_id": "cust_123",
       "plan_id": "plan_pro"
     }'
   ```

---

## 📡 API Reference

### Customer Management

#### Create Customer

```bash
POST /api/customers
```

**Request**:
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "company": "Acme Corp",
  "metadata": {
    "tenant_id": "tenant_123"
  }
}
```

**Response**:
```json
{
  "id": "cust_123",
  "email": "customer@example.com",
  "name": "John Doe",
  "stripe_customer_id": "cus_...",
  "created_at": "2025-12-06T10:00:00Z"
}
```

#### Get Customer

```bash
GET /api/customers/{customer_id}
```

#### Update Customer

```bash
PUT /api/customers/{customer_id}
```

#### Delete Customer

```bash
DELETE /api/customers/{customer_id}
```

### Subscription Management

#### Create Subscription

```bash
POST /api/subscriptions
```

**Request**:
```json
{
  "customer_id": "cust_123",
  "plan_id": "plan_pro",
  "payment_method_id": "pm_123",
  "trial_days": 14,
  "metadata": {
    "tenant_id": "tenant_123"
  }
}
```

**Response**:
```json
{
  "id": "sub_123",
  "customer_id": "cust_123",
  "status": "active",
  "plan_id": "plan_pro",
  "current_period_start": "2025-12-06T10:00:00Z",
  "current_period_end": "2026-01-06T10:00:00Z",
  "stripe_subscription_id": "sub_..."
}
```

#### Update Subscription

```bash
PUT /api/subscriptions/{subscription_id}
```

**Request**:
```json
{
  "plan_id": "plan_ent",
  "prorate": true
}
```

#### Cancel Subscription

```bash
DELETE /api/subscriptions/{subscription_id}
```

**Request**:
```json
{
  "cancel_at_period_end": true,
  "cancellation_reason": "too_expensive"
}
```

### Usage Tracking

#### Record Usage

```bash
POST /api/usage
```

**Request**:
```json
{
  "subscription_id": "sub_123",
  "metric": "api_calls",
  "value": 100,
  "timestamp": "2025-12-06T10:00:00Z"
}
```

#### Get Usage

```bash
GET /api/usage/{subscription_id}?start=2025-12-01&end=2025-12-31
```

**Response**:
```json
{
  "subscription_id": "sub_123",
  "period": {
    "start": "2025-12-01T00:00:00Z",
    "end": "2025-12-31T23:59:59Z"
  },
  "usage": {
    "api_calls": 15420,
    "storage_gb": 245.6,
    "bandwidth_gb": 1024.3
  },
  "estimated_cost": 156.78
}
```

### Invoice Management

#### Create Invoice

```bash
POST /api/invoices
```

**Request**:
```json
{
  "subscription_id": "sub_123",
  "due_date": "2025-12-31"
}
```

#### Get Invoice

```bash
GET /api/invoices/{invoice_id}
```

#### List Invoices

```bash
GET /api/invoices?customer_id=cust_123&status=paid
```

#### Download Invoice PDF

```bash
GET /api/invoices/{invoice_id}/pdf
```

### Payment Methods

#### Add Payment Method

```bash
POST /api/payment-methods
```

**Request**:
```json
{
  "customer_id": "cust_123",
  "type": "card",
  "stripe_payment_method_id": "pm_123"
}
```

#### Set Default Payment Method

```bash
PUT /api/customers/{customer_id}/default-payment-method
```

**Request**:
```json
{
  "payment_method_id": "pm_123"
}
```

#### Remove Payment Method

```bash
DELETE /api/payment-methods/{payment_method_id}
```

---

## 🔔 Webhooks

### Webhook Handler

```python
@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle event
    await handle_stripe_event(event)

    return {"status": "success"}
```

### Event Handlers

**Subscription Events**:
```python
async def handle_subscription_created(event):
    subscription = event.data.object
    # Update local database
    # Send welcome email
    # Provision resources

async def handle_subscription_updated(event):
    subscription = event.data.object
    # Handle plan changes
    # Update usage limits
    # Send notification

async def handle_subscription_deleted(event):
    subscription = event.data.object
    # Cancel services
    # Send cancellation survey
    # Archive data
```

**Invoice Events**:
```python
async def handle_invoice_created(event):
    invoice = event.data.object
    # Generate PDF
    # Send to customer
    # Update accounting

async def handle_invoice_paid(event):
    invoice = event.data.object
    # Confirm payment
    # Send receipt
    # Extend service

async def handle_invoice_payment_failed(event):
    invoice = event.data.object
    # Send dunning email
    # Attempt retry
    # Notify customer
```

### Webhook Security

- Verify Stripe signature
- Use HTTPS only
- Rate limiting
- Idempotency keys
- Retry logic

---

## 🔄 Billing Cycles

### Subscription Cycles

**Monthly Billing**:
- 30-day cycles
- Auto-renewal
- Mid-cycle changes prorated

**Annual Billing**:
- 365-day cycles
- 20% discount
- Upfront payment
- Lock-in period

**Usage-Based**:
- No fixed cycle
- Pay-as-you-go
- Monthly aggregation
- Overage alerts

### Proration

**Plan Upgrade**:
```python
# Example: Upgrade from $49 to $199 mid-cycle
old_plan_cost = 49
new_plan_cost = 199
days_remaining = 15
days_in_cycle = 30

prorated_charge = (new_plan_cost - old_plan_cost) * (days_remaining / days_in_cycle)
# $75.00 charge immediately
```

**Plan Downgrade**:
```python
# Example: Downgrade from $199 to $49 mid-cycle
old_plan_cost = 199
new_plan_cost = 49
days_used = 15
days_in_cycle = 30

credit = (old_plan_cost - new_plan_cost) * (days_used / days_in_cycle)
# $75.00 credit on next invoice
```

**Add-ons**:
- Immediately charged
- No proration
- Cancel anytime

### Dunning Management

**Payment Failed**:
1. Immediate retry (3 days)
2. Email notification
3. Second retry (7 days)
4. Phone call (enterprise)
5. Suspend service (14 days)
6. Cancel subscription (30 days)

**Retry Schedule**:
- First failure: Retry in 3 days
- Second failure: Retry in 5 days
- Third failure: Retry in 7 days
- Final: Cancel

---

## 📈 Analytics

### Revenue Metrics

**MRR (Monthly Recurring Revenue)**:
```sql
SELECT DATE_TRUNC('month', created_at) as month,
       SUM(amount) as mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY month
ORDER BY month;
```

**ARR (Annual Recurring Revenue)**:
```sql
SELECT SUM(amount * 12) as arr
FROM subscriptions
WHERE status = 'active';
```

**Churn Rate**:
```sql
SELECT (cancelled_subscriptions / total_subscriptions) * 100 as churn_rate
FROM (
  SELECT COUNT(*) as cancelled_subscriptions
  FROM subscriptions
  WHERE status = 'cancelled'
    AND cancelled_at >= NOW() - INTERVAL '30 days'
) c,
(
  SELECT COUNT(*) as total_subscriptions
  FROM subscriptions
  WHERE created_at >= NOW() - INTERVAL '30 days'
) t;
```

**LTV (Customer Lifetime Value)**:
```sql
SELECT customer_id,
       SUM(amount) as lifetime_value
FROM invoices
WHERE status = 'paid'
GROUP BY customer_id;
```

### Usage Analytics

**Top Customers by Usage**:
```sql
SELECT customer_id,
       SUM(value) as total_usage
FROM usage_records
WHERE metric = 'api_calls'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY customer_id
ORDER BY total_usage DESC
LIMIT 10;
```

**Usage Trends**:
```sql
SELECT DATE_TRUNC('day', timestamp) as date,
       SUM(value) as daily_usage
FROM usage_records
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

### Dashboard

**Key Metrics**:
- MRR / ARR
- New subscribers
- Churn rate
- Average revenue per user (ARPU)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

**Charts**:
- Revenue growth
- Subscription trends
- Usage patterns
- Churn analysis
- Geographic distribution

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving

**Symptoms**: Payments not syncing

**Solution**:
```bash
# Check webhook logs
curl -X GET http://localhost:8003/api/admin/webhook-logs

# Test webhook
curl -X POST http://localhost:8003/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test_event"}'
```

**Debug Steps**:
1. Verify Stripe endpoint URL
2. Check webhook secret
3. Review Stripe dashboard logs
4. Check firewall rules

#### 2. Payment Failures

**Symptoms**: Failed payments, dunning emails

**Solution**:
```bash
# Check payment status
curl -X GET http://localhost:8003/api/payments?status=failed

# Retry payment
curl -X POST http://localhost:8003/api/payments/{payment_id}/retry
```

**Common Causes**:
- Insufficient funds
- Expired card
- Incorrect billing address
- Bank restrictions

#### 3. Usage Not Tracking

**Symptoms**: No usage records

**Solution**:
```bash
# Check usage endpoint
curl -X GET http://localhost:8003/api/usage/{subscription_id}

# Manual usage record
curl -X POST http://localhost:8003/api/usage \
  -H "Content-Type: application/json" \
  -d '{"subscription_id": "sub_123", "metric": "api_calls", "value": 100}'
```

#### 4. Invoice Generation

**Symptoms**: Missing invoices

**Solution**:
```bash
# Generate invoice manually
curl -X POST http://localhost:8003/api/invoices/generate \
  -H "Content-Type: application/json" \
  -d '{"subscription_id": "sub_123"}'

# Check invoice queue
curl -X GET http://localhost:8003/api/admin/invoice-queue
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `BILLING_001` | Invalid plan | Check plan ID |
| `BILLING_002` | Customer not found | Verify customer ID |
| `BILLING_003` | Payment failed | Update payment method |
| `BILLING_004` | Subscription canceled | Reactivate subscription |
| `BILLING_005` | Usage limit exceeded | Upgrade plan |

### Performance Tuning

**Database**:
```sql
-- Indexes for billing queries
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_usage_subscription ON usage_records(subscription_id);
```

**Redis**:
```bash
# Increase memory
redis-cli config set maxmemory 2gb
redis-cli config set maxmemory-policy allkeys-lru
```

**Stripe**:
- Use idempotency keys
- Batch operations
- Cache API responses
- Monitor rate limits

---

## 📞 Support

### Resources

- **Documentation**: [Full docs](./docs/)
- **API Reference**: http://localhost:8003/docs
- **Stripe Docs**: https://stripe.com/docs
- **Status Page**: status.neo-stack.com

### Contact

- **Email**: billing@neo-stack.com
- **Phone**: +1-800-NEO-STACK
- **Slack**: #billing-support
- **GitHub**: Issues & discussions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Stripe](https://stripe.com/) - Payment processing
- [FastAPI](https://fastapi.tiangolo.com/) - API framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - Cache & queue
- [Celery](https://celeryproject.org/) - Task queue

---

**Made with ❤️ by the NEO_STACK Team**

[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-orange.svg)](https://claude.ai)
