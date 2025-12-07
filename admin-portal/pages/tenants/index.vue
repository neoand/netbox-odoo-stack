<template>
  <div>
    <!-- Page header -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tenants</h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage all tenants in the platform
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Add Tenant
      </UButton>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UFormGroup label="Search">
          <UInput
            v-model="searchQuery"
            placeholder="Search tenants..."
            icon="i-heroicons-magnifying-glass"
          />
        </UFormGroup>

        <UFormGroup label="Status">
          <USelectMenu
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="All statuses"
          />
        </UFormGroup>

        <UFormGroup label="Date Range">
          <USelectMenu
            v-model="dateRange"
            :options="dateRangeOptions"
            placeholder="All time"
          />
        </UFormGroup>

        <UFormGroup label="Actions">
          <UButton
            color="gray"
            variant="outline"
            icon="i-heroicons-arrow-path"
            @click="refreshData"
          >
            Refresh
          </UButton>
        </UFormGroup>
      </div>
    </UCard>

    <!-- Tenants table -->
    <UCard>
      <UTable
        :rows="filteredTenants"
        :columns="columns"
        :loading="tenantStore.loading"
        :empty-state="{ icon: 'i-heroicons-building-office', label: 'No tenants found' }"
      >
        <template #tenant_id-data="{ row }">
          <div class="font-mono text-xs">{{ row.tenant_id }}</div>
        </template>

        <template #name-data="{ row }">
          <div class="flex items-center">
            <UAvatar
              :alt="row.name"
              size="sm"
              class="mr-3"
            />
            <div>
              <div class="font-medium text-gray-900">{{ row.name }}</div>
              <div class="text-xs text-gray-500">{{ row.email }}</div>
            </div>
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :label="row.status"
            :color="getStatusColor(row.status)"
            variant="subtle"
          />
        </template>

        <template #created_at-data="{ row }">
          <div class="text-sm text-gray-500">
            {{ formatDate(row.created_at) }}
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center space-x-2">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-eye"
              @click="viewTenant(row.tenant_id)"
            />
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-pencil"
              @click="editTenant(row.tenant_id)"
            />
            <UDropdown :items="getDropdownItems(row)">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-vertical"
              />
            </UDropdown>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Create tenant modal -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create New Tenant</h3>
        </template>

        <UForm
          :schema="createSchema"
          :state="createForm"
          @submit="handleCreate"
        >
          <div class="space-y-4">
            <UFormGroup label="Name" name="name" required>
              <UInput v-model="createForm.name" />
            </UFormGroup>

            <UFormGroup label="Slug" name="slug" required>
              <UInput v-model="createForm.slug" />
            </UFormGroup>

            <UFormGroup label="Email" name="email" required>
              <UInput v-model="createForm.email" type="email" />
            </UFormGroup>

            <UFormGroup label="Status" name="status" required>
              <USelectMenu
                v-model="createForm.status"
                :options="statusOptions"
              />
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <UButton
                color="gray"
                variant="ghost"
                @click="showCreateModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="tenantStore.loading"
              >
                Create Tenant
              </UButton>
            </div>
          </template>
        </UForm>
      </UCard>
    </UModal>

    <!-- Edit tenant modal -->
    <UModal v-model="showEditModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit Tenant</h3>
        </template>

        <UForm
          :schema="editSchema"
          :state="editForm"
          @submit="handleEdit"
        >
          <div class="space-y-4">
            <UFormGroup label="Name" name="name" required>
              <UInput v-model="editForm.name" />
            </UFormGroup>

            <UFormGroup label="Email" name="email" required>
              <UInput v-model="editForm.email" type="email" />
            </UFormGroup>

            <UFormGroup label="Status" name="status" required>
              <USelectMenu
                v-model="editForm.status"
                :options="statusOptions"
              />
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <UButton
                color="gray"
                variant="ghost"
                @click="showEditModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="tenantStore.loading"
              >
                Update Tenant
              </UButton>
            </div>
          </template>
        </UForm>
      </UCard>
    </UModal>

    <!-- Delete confirmation modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Confirm Delete</h3>
        </template>

        <p class="text-sm text-gray-500">
          Are you sure you want to delete tenant <strong>{{ selectedTenant?.name }}</strong>?
          This action cannot be undone.
        </p>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton
              color="gray"
              variant="ghost"
              @click="showDeleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              @click="handleDelete"
              :loading="tenantStore.loading"
            >
              Delete Tenant
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useTenantStore } from '~/stores/tenants'
import { format } from 'date-fns'
import { z } from 'zod'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const tenantStore = useTenantStore()
const router = useRouter()
const toast = useToast()

const searchQuery = ref('')
const statusFilter = ref('all')
const dateRange = ref('all')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedTenant = ref(null)
const selectedTenantId = ref('')

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Trial', value: 'trial' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Cancelled', value: 'cancelled' },
]

const dateRangeOptions = [
  { label: 'All time', value: 'all' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
]

const columns = [
  { key: 'tenant_id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' },
  { key: 'actions', label: 'Actions' },
]

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  email: z.string().email('Invalid email'),
  status: z.enum(['active', 'trial', 'suspended', 'cancelled']),
})

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  status: z.enum(['active', 'trial', 'suspended', 'cancelled']),
})

const createForm = reactive({
  name: '',
  slug: '',
  email: '',
  status: 'active',
})

const editForm = reactive({
  name: '',
  email: '',
  status: 'active',
})

const filteredTenants = computed(() => {
  let filtered = tenantStore.tenants

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.email.toLowerCase().includes(query) ||
      t.slug.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(t => t.status === statusFilter.value)
  }

  return filtered
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    trial: 'blue',
    suspended: 'yellow',
    cancelled: 'red',
  }
  return colors[status] || 'gray'
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const getDropdownItems = (row: any) => [
  [
    {
      label: 'View Details',
      icon: 'i-heroicons-eye',
      click: () => viewTenant(row.tenant_id),
    },
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil',
      click: () => editTenant(row.tenant_id),
    },
  ],
  [
    {
      label: 'Activate',
      icon: 'i-heroicons-check',
      click: () => activateTenant(row.tenant_id),
    },
    {
      label: 'Suspend',
      icon: 'i-heroicons-pause',
      click: () => suspendTenant(row.tenant_id),
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => confirmDelete(row),
    },
  ],
]

const viewTenant = (id: string) => {
  router.push(`/tenants/${id}`)
}

const editTenant = async (id: string) => {
  try {
    const tenant = await tenantStore.fetchTenant(id)
    selectedTenantId.value = id
    selectedTenant.value = tenant
    editForm.name = tenant.name
    editForm.email = tenant.email
    editForm.status = tenant.status
    showEditModal.value = true
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to load tenant details',
      color: 'red',
    })
  }
}

const confirmDelete = (tenant: any) => {
  selectedTenant.value = tenant
  showDeleteModal.value = true
}

const activateTenant = async (id: string) => {
  try {
    await tenantStore.activateTenant(id)
    toast.add({
      title: 'Success',
      description: 'Tenant activated successfully',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to activate tenant',
      color: 'red',
    })
  }
}

const suspendTenant = async (id: string) => {
  try {
    await tenantStore.suspendTenant(id)
    toast.add({
      title: 'Success',
      description: 'Tenant suspended successfully',
      color: 'green',
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to suspend tenant',
      color: 'red',
    })
  }
}

const handleCreate = async () => {
  try {
    await tenantStore.createTenant(createForm)
    toast.add({
      title: 'Success',
      description: 'Tenant created successfully',
      color: 'green',
    })
    showCreateModal.value = false
    resetCreateForm()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to create tenant',
      color: 'red',
    })
  }
}

const handleEdit = async () => {
  try {
    await tenantStore.updateTenant(selectedTenantId.value, editForm)
    toast.add({
      title: 'Success',
      description: 'Tenant updated successfully',
      color: 'green',
    })
    showEditModal.value = false
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to update tenant',
      color: 'red',
    })
  }
}

const handleDelete = async () => {
  try {
    await tenantStore.deleteTenant(selectedTenant.value.tenant_id)
    toast.add({
      title: 'Success',
      description: 'Tenant deleted successfully',
      color: 'green',
    })
    showDeleteModal.value = false
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete tenant',
      color: 'red',
    })
  }
}

const resetCreateForm = () => {
  createForm.name = ''
  createForm.slug = ''
  createForm.email = ''
  createForm.status = 'active'
}

const refreshData = () => {
  tenantStore.fetchTenants()
}

onMounted(() => {
  tenantStore.fetchTenants()
})
</script>
