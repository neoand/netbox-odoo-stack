// Type definitions for Admin Portal

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string
  created_at: string
  updated_at: string
}

export interface Tenant {
  tenant_id: string
  name: string
  slug: string
  email: string
  status: 'active' | 'suspended' | 'cancelled' | 'trial'
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface Plan {
  plan_id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number | null
  currency: string
  interval_type: string
  features: string[]
  limits: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  subscription_id: string
  tenant_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface Invoice {
  invoice_id: string
  tenant_id: string
  subscription_id?: string
  stripe_invoice_id?: string
  invoice_number: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  currency: string
  subtotal: number
  tax: number
  total: number
  amount_paid: number
  amount_due: number
  due_date?: string
  paid_at?: string
  invoice_date: string
  period_start: string
  period_end: string
  pdf_url?: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface InvoiceItem {
  item_id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  period_start?: string
  period_end?: string
  metadata: Record<string, any>
  created_at: string
}

export interface Payment {
  payment_id: string
  tenant_id: string
  subscription_id?: string
  invoice_id?: string
  stripe_payment_intent_id?: string
  stripe_charge_id?: string
  payment_method: 'card' | 'paypal' | 'bank_transfer' | 'check'
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  amount: number
  currency: string
  fee_amount: number
  net_amount: number
  processed_at?: string
  failure_reason?: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface PaymentMethod {
  method_id: string
  tenant_id: string
  stripe_payment_method_id: string
  type: 'card' | 'bank_account' | 'paypal'
  last_four?: string
  brand?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface UsageRecord {
  usage_id: string
  tenant_id: string
  resource_type: string
  resource_id?: string
  quantity: number
  unit: string
  period_start: string
  period_end: string
  source: string
  created_at: string
}

export interface UsageLimit {
  limit_id: string
  tenant_id: string
  plan_id: string
  resource_type: string
  limit_value: number
  period_type: 'daily' | 'monthly' | 'yearly'
  created_at: string
  updated_at: string
}

export interface Coupon {
  coupon_id: string
  stripe_coupon_id?: string
  code: string
  name: string
  type: 'percentage' | 'fixed_amount'
  value: number
  currency: string
  max_redemptions?: number
  redemptions: number
  valid_from?: string
  valid_until?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CouponRedemption {
  redemption_id: string
  coupon_id: string
  tenant_id: string
  subscription_id?: string
  invoice_id?: string
  discount_amount: number
  redeemed_at: string
}

export interface BillingAlert {
  alert_id: string
  tenant_id: string
  alert_type: 'usage_threshold' | 'payment_failed' | 'invoice_overdue' | 'trial_ending'
  threshold_value?: number
  current_value?: number
  status: 'active' | 'triggered' | 'resolved'
  notified_at?: string
  resolved_at?: string
  created_at: string
  metadata: Record<string, any>
}

export interface BillingStats {
  totalRevenue: number
  monthlyRevenue: number
  activeSubscriptions: number
  totalInvoices: number
  pendingInvoices: number
  paidInvoices: number
  overdueInvoices: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension?: number
  }[]
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
}

export interface FilterOption {
  label: string
  value: string
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  meta?: PaginationMeta
}

export interface ApiError {
  message: string
  code: string
  status: number
  details?: Record<string, any>
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export interface TenantState {
  tenants: Tenant[]
  currentTenant: Tenant | null
  loading: boolean
  error: string | null
}

export interface BillingState {
  plans: Plan[]
  subscriptions: Subscription[]
  invoices: Invoice[]
  stats: BillingStats | null
  loading: boolean
  error: string | null
}

export interface CreateTenantRequest {
  name: string
  slug: string
  email: string
  status?: 'active' | 'trial'
  metadata?: Record<string, any>
}

export interface UpdateTenantRequest {
  name?: string
  email?: string
  status?: 'active' | 'suspended' | 'cancelled' | 'trial'
  metadata?: Record<string, any>
}

export interface CreatePlanRequest {
  plan_id: string
  name: string
  description?: string
  price_monthly: number
  price_yearly?: number
  currency?: string
  interval_type?: string
  features?: string[]
  limits?: Record<string, any>
  is_active?: boolean
}

export interface CreateSubscriptionRequest {
  price_id: string
  plan_id: string
  trial_days?: number
  metadata?: Record<string, any>
}

export interface CreateInvoiceRequest {
  tenant_id: string
  subscription_id?: string
  description?: string
  items: {
    description: string
    quantity: number
    unit_price: number
    period_start?: string
    period_end?: string
  }[]
  metadata?: Record<string, any>
}

export interface ApplyCouponRequest {
  subscription_id: string
  code: string
}

export interface PaymentIntentRequest {
  amount: number
  currency?: string
  description?: string
  metadata?: Record<string, any>
}

export interface UsageRecordRequest {
  resource_type: string
  resource_id?: string
  quantity: number
  unit: string
  period_start: string
  period_end: string
  source: string
  metadata?: Record<string, any>
}
