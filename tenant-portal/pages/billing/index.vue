<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        Billing
      </h1>
      <p class="mt-1 text-sm text-gray-500">
        View invoices, manage payment methods, and download receipts
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">
              This Month
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              ${{ billingStore.stats?.monthlySpend?.toFixed(2) || '0.00' }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <UIcon
              name="i-heroicons-banknotes"
              class="w-6 h-6 text-blue-600"
            />
          </div>
        </div>
      </UCard>

      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Total Invoices
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ billingStore.stats?.totalInvoices || 0 }}
            </p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <UIcon
              name="i-heroicons-document-text"
              class="w-6 h-6 text-purple-600"
            />
          </div>
        </div>
      </UCard>

      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Paid
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              {{ billingStore.stats?.paidInvoices || 0 }}
            </p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-green-600"
            />
          </div>
        </div>
      </UCard>

      <UCard class="stat-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Amount Due
            </p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              ${{ billingStore.totalAmountDue.toFixed(2) }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <UIcon
              name="i-heroicons-clock"
              class="w-6 h-6 text-yellow-600"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Alerts -->
    <div class="mb-6 space-y-3">
      <UAlert
        v-if="billingStore.overdueInvoices.length > 0"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        :title="`${billingStore.overdueInvoices.length} Overdue Invoice(s)`"
        description="You have overdue invoices. Please pay them to avoid service interruption."
      >
        <template #actions>
          <UButton
            color="red"
            variant="solid"
            @click="payOverdueInvoices"
          >
            Pay Now
          </UButton>
        </template>
      </UAlert>

      <UAlert
        v-if="billingStore.unpaidInvoices.length > 0"
        icon="i-heroicons-information-circle"
        color="blue"
        variant="subtle"
        title="Outstanding Invoices"
        description="You have unpaid invoices. Please review and complete payment."
      >
        <template #actions>
          <UButton
            color="blue"
            variant="outline"
            @click="navigateTo('#invoices')"
          >
            View Invoices
          </UButton>
        </template>
      </UAlert>
    </div>

    <!-- Payment methods -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Payment Methods
          </h3>
          <UButton
            color="primary"
            icon="i-heroicons-plus"
            @click="showAddPaymentModal = true"
          >
            Add Payment Method
          </UButton>
        </div>
      </template>

      <div
        v-if="billingStore.paymentMethods.length > 0"
        class="space-y-3"
      >
        <div
          v-for="method in billingStore.paymentMethods"
          :key="method.method_id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-gray-100 rounded-full">
              <UIcon
                :name="getPaymentMethodIcon(method.type)"
                class="w-6 h-6 text-gray-600"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ method.brand ? method.brand.toUpperCase() : method.type }} •••• {{ method.last_four }}
              </p>
              <p
                v-if="method.exp_month && method.exp_year"
                class="text-xs text-gray-500"
              >
                Expires {{ method.exp_month }}/{{ method.exp_year }}
              </p>
            </div>
            <UBadge
              v-if="method.is_default"
              label="Default"
              color="green"
              variant="subtle"
            />
          </div>

          <div class="flex items-center space-x-2">
            <UButton
              v-if="!method.is_default"
              color="gray"
              variant="ghost"
              size="sm"
              @click="setDefaultPaymentMethod(method.method_id)"
            >
              Set Default
            </UButton>
            <UButton
              color="red"
              variant="ghost"
              size="sm"
              @click="deletePaymentMethod(method.method_id)"
            >
              Remove
            </UButton>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center py-8"
      >
        <UIcon
          name="i-heroicons-credit-card"
          class="w-12 h-12 text-gray-400 mx-auto"
        />
        <p class="text-sm text-gray-500 mt-4">
          No payment methods added
        </p>
        <UButton
          color="primary"
          class="mt-4"
          @click="showAddPaymentModal = true"
        >
          Add Payment Method
        </UButton>
      </div>
    </UCard>

    <!-- Invoices -->
    <UCard id="invoices">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Invoices
          </h3>
          <UButton
            color="gray"
            variant="outline"
            icon="i-heroicons-arrow-down-tray"
            @click="exportInvoices"
          >
            Export
          </UButton>
        </div>
      </template>

      <UTable
        :rows="billingStore.invoices"
        :columns="invoiceColumns"
        :loading="billingStore.loading"
        :empty-state="{ icon: 'i-heroicons-document-text', label: 'No invoices found' }"
      >
        <template #invoice_number-data="{ row }">
          <div class="font-mono text-sm">
            {{ row.invoice_number }}
          </div>
        </template>

        <template #total-data="{ row }">
          <div class="font-medium">
            ${{ row.total.toFixed(2) }}
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :label="row.status"
            :color="getInvoiceStatusColor(row.status)"
            variant="subtle"
          />
        </template>

        <template #invoice_date-data="{ row }">
          <div class="text-sm text-gray-500">
            {{ formatDate(row.invoice_date) }}
          </div>
        </template>

        <template #due_date-data="{ row }">
          <div class="text-sm text-gray-500">
            {{ row.due_date ? formatDate(row.due_date) : '-' }}
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex space-x-2">
            <UButton
              v-if="row.pdf_url"
              color="gray"
              variant="ghost"
              size="sm"
              icon="i-heroicons-document-arrow-down"
              @click="downloadInvoicePDF(row.invoice_id)"
            >
              PDF
            </UButton>
            <UButton
              v-if="row.status === 'open'"
              color="primary"
              variant="solid"
              size="sm"
              @click="payInvoice(row.invoice_id)"
            >
              Pay Now
            </UButton>
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
              @click="viewInvoice(row.invoice_id)"
            >
              View
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Add payment method modal -->
    <UModal v-model="showAddPaymentModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            Add Payment Method
          </h3>
        </template>

        <div class="space-y-4">
          <UAlert
            icon="i-heroicons-information-circle"
            color="blue"
            variant="subtle"
            description="Payment method integration will be implemented with Stripe Elements"
          />

          <p class="text-sm text-gray-600">
            This is a demo. In a real implementation, you would integrate with Stripe Elements
            to securely collect payment method information.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton
              color="gray"
              variant="ghost"
              @click="showAddPaymentModal = false"
            >
              Close
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useBillingStore } from '~/stores/billing'
import { format } from 'date-fns'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const billingStore = useBillingStore()
const toast = useToast()

const showAddPaymentModal = ref(false)

const invoiceColumns = [
  { key: 'invoice_number', label: 'Invoice #' },
  { key: 'total', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'invoice_date', label: 'Date' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'actions', label: 'Actions' },
]

const getPaymentMethodIcon = (type: string) => {
  const icons: Record<string, string> = {
    card: 'i-heroicons-credit-card',
    bank_account: 'i-heroicons-banknotes',
    paypal: 'i-heroicons-globe-alt',
  }
  return icons[type] || 'i-heroicons-credit-card'
}

const getInvoiceStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: 'green',
    open: 'yellow',
    void: 'gray',
    uncollectible: 'red',
  }
  return colors[status] || 'gray'
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const downloadInvoicePDF = async (id: string) => {
  try {
    await billingStore.downloadInvoicePDF(id)
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to download invoice',
      color: 'red',
    })
  }
}

const viewInvoice = (id: string) => {
  navigateTo(`/billing/invoices/${id}`)
}

const payInvoice = async (id: string) => {
  try {
    await billingStore.payInvoice(id)
    toast.add({
      title: 'Success',
      description: 'Invoice paid successfully',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to pay invoice',
      color: 'red',
    })
  }
}

const payOverdueInvoices = async () => {
  try {
    for (const invoice of billingStore.overdueInvoices) {
      await billingStore.payInvoice(invoice.invoice_id)
    }
    toast.add({
      title: 'Success',
      description: 'All overdue invoices paid',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: 'Failed to pay some invoices',
      color: 'red',
    })
  }
}

const setDefaultPaymentMethod = async (id: string) => {
  try {
    await billingStore.setDefaultPaymentMethod(id)
    toast.add({
      title: 'Success',
      description: 'Default payment method updated',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to set default payment method',
      color: 'red',
    })
  }
}

const deletePaymentMethod = async (id: string) => {
  if (!confirm('Are you sure you want to remove this payment method?')) return

  try {
    await billingStore.deletePaymentMethod(id)
    toast.add({
      title: 'Success',
      description: 'Payment method removed',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to remove payment method',
      color: 'red',
    })
  }
}

const exportInvoices = async () => {
  try {
    await billingStore.exportInvoices('csv')
    toast.add({
      title: 'Success',
      description: 'Invoices exported successfully',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to export invoices',
      color: 'red',
    })
  }
}

onMounted(async () => {
  await Promise.all([
    billingStore.fetchStats(),
    billingStore.fetchInvoices(),
    billingStore.fetchPaymentMethods(),
  ])
})
</script>
