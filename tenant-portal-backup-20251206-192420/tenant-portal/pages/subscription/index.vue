<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Subscription</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage your subscription plan and billing
      </p>
    </div>

    <!-- Current subscription -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Current Plan</h3>
          <UBadge
            :label="subscriptionStore.currentSubscription?.status || 'inactive'"
            :color="getStatusColor(subscriptionStore.currentSubscription?.status)"
            variant="subtle"
          />
        </div>
      </template>

      <div v-if="subscriptionStore.currentSubscription" class="space-y-6">
        <!-- Plan info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-2xl font-bold text-gray-900 capitalize">
              {{ subscriptionStore.currentSubscription.plan_id }}
            </h4>
            <p class="text-sm text-gray-500 mt-1">
              Active since {{ formatDate(subscriptionStore.currentSubscription.created_at) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Renews on</p>
            <p class="text-xl font-semibold text-gray-900">
              {{ formatDate(subscriptionStore.currentSubscription.current_period_end) }}
            </p>
            <p class="text-sm text-gray-500">
              {{ subscriptionStore.daysUntilRenewal }} days remaining
            </p>
          </div>
        </div>

        <!-- Trial info -->
        <div
          v-if="subscriptionStore.currentSubscription.trial_end"
          class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-center">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p class="text-sm font-medium text-blue-900">
                Trial Period
              </p>
              <p class="text-xs text-blue-700">
                Your trial ends on {{ formatDate(subscriptionStore.currentSubscription.trial_end) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-4">
          <UButton
            color="primary"
            @click="showChangePlanModal = true"
          >
            Change Plan
          </UButton>

          <UButton
            v-if="!subscriptionStore.currentSubscription.cancelled_at"
            color="red"
            variant="outline"
            @click="showCancelModal = true"
          >
            Cancel Subscription
          </UButton>

          <UButton
            v-else
            color="green"
            @click="resumeSubscription"
          >
            Resume Subscription
          </UButton>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 text-gray-400 mx-auto" />
        <h4 class="text-lg font-medium text-gray-900 mt-4">No Active Subscription</h4>
        <p class="text-sm text-gray-500 mt-2">Choose a plan to get started</p>
        <UButton
          color="primary"
          class="mt-4"
          @click="showChangePlanModal = true"
        >
          Choose a Plan
        </UButton>
      </div>
    </UCard>

    <!-- Usage summary -->
    <UCard class="mb-8">
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">Usage Summary</h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- API Calls -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">API Calls</p>
            <p class="text-sm text-gray-500">
              {{ subscriptionStore.usage?.api_calls.current?.toLocaleString() || '0' }} /
              {{ subscriptionStore.usage?.api_calls.limit?.toLocaleString() || '0' }}
            </p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${Math.min(subscriptionStore.usage?.api_calls.percentage || 0, 100)}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ (subscriptionStore.usage?.api_calls.percentage || 0).toFixed(1) }}% used
          </p>
        </div>

        <!-- Storage -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">Storage</p>
            <p class="text-sm text-gray-500">
              {{ subscriptionStore.usage?.storage_gb.current?.toFixed(1) || '0' }} /
              {{ subscriptionStore.usage?.storage_gb.limit || '0' }} GB
            </p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${Math.min(subscriptionStore.usage?.storage_gb.percentage || 0, 100)}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ (subscriptionStore.usage?.storage_gb.percentage || 0).toFixed(1) }}% used
          </p>
        </div>

        <!-- Users -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">Users</p>
            <p class="text-sm text-gray-500">
              {{ subscriptionStore.usage?.users.current || '0' }} /
              {{ subscriptionStore.usage?.users.limit || '0' }}
            </p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${Math.min(subscriptionStore.usage?.users.percentage || 0, 100)}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ (subscriptionStore.usage?.users.percentage || 0).toFixed(1) }}% used
          </p>
        </div>

        <!-- Devices -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-gray-600">Devices</p>
            <p class="text-sm text-gray-500">
              {{ subscriptionStore.usage?.devices.current || '0' }} /
              {{ subscriptionStore.usage?.devices.limit || '0' }}
            </p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: `${Math.min(subscriptionStore.usage?.devices.percentage || 0, 100)}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            {{ (subscriptionStore.usage?.devices.percentage || 0).toFixed(1) }}% used
          </p>
        </div>
      </div>
    </UCard>

    <!-- Available plans -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900">Available Plans</h3>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="plan in subscriptionStore.availablePlans"
          :key="plan.plan_id"
          class="relative cursor-pointer hover:shadow-lg transition-shadow"
          :class="{ 'ring-2 ring-primary-500': plan.plan_id === subscriptionStore.currentSubscription?.plan_id }"
          @click="selectPlan(plan)"
        >
          <div v-if="plan.plan_id === 'professional'" class="absolute -top-3 -right-3">
            <UBadge color="purple" label="Popular" />
          </div>

          <div class="text-center">
            <h4 class="text-xl font-bold text-gray-900">{{ plan.name }}</h4>
            <p class="text-sm text-gray-500 mt-2">{{ plan.description }}</p>
            <div class="mt-4">
              <span class="text-4xl font-bold text-gray-900">
                ${{ plan.price_monthly }}
              </span>
              <span class="text-sm text-gray-500">/month</span>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <div
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-center text-sm"
            >
              <UIcon
                name="i-heroicons-check-circle"
                class="w-5 h-5 text-green-500 mr-2"
              />
              {{ feature }}
            </div>
          </div>

          <div class="mt-6">
            <UButton
              v-if="plan.plan_id !== subscriptionStore.currentSubscription?.plan_id"
              color="primary"
              block
              @click.stop="selectPlan(plan)"
            >
              Select Plan
            </UButton>
            <UButton
              v-else
              color="gray"
              variant="outline"
              block
              disabled
            >
              Current Plan
            </UButton>
          </div>
        </UCard>
      </div>
    </UCard>

    <!-- Change plan modal -->
    <UModal v-model="showChangePlanModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Change Plan</h3>
        </template>

        <div v-if="selectedPlan" class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-900">{{ selectedPlan.name }}</h4>
            <p class="text-sm text-gray-500">{{ selectedPlan.description }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">
              ${{ selectedPlan.price_monthly }}/month
            </p>
          </div>

          <p class="text-sm text-gray-600">
            Are you sure you want to change to this plan? The change will take effect immediately.
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton
              color="gray"
              variant="ghost"
              @click="showChangePlanModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="subscriptionStore.loading"
              @click="confirmPlanChange"
            >
              Confirm Change
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Cancel subscription modal -->
    <UModal v-model="showCancelModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Cancel Subscription</h3>
        </template>

        <div class="space-y-4">
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="red"
            variant="subtle"
            title="Are you sure?"
            description="Your subscription will be cancelled at the end of the current billing period. You will retain access to all features until then."
          />

          <UFormGroup label="Reason for cancellation (optional)">
            <UTextarea
              v-model="cancellationReason"
              placeholder="Tell us why you're cancelling..."
            />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton
              color="gray"
              variant="ghost"
              @click="showCancelModal = false"
            >
              Keep Subscription
            </UButton>
            <UButton
              color="red"
              :loading="subscriptionStore.loading"
              @click="confirmCancellation"
            >
              Confirm Cancellation
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useSubscriptionStore } from '~/stores/subscription'
import { format } from 'date-fns'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const subscriptionStore = useSubscriptionStore()
const toast = useToast()

const showChangePlanModal = ref(false)
const showCancelModal = ref(false)
const selectedPlan = ref(null)
const cancellationReason = ref('')

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'green',
    trialing: 'blue',
    cancelled: 'red',
    past_due: 'yellow',
  }
  return colors[status] || 'gray'
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const selectPlan = (plan: any) => {
  selectedPlan.value = plan
  showChangePlanModal.value = true
}

const confirmPlanChange = async () => {
  try {
    await subscriptionStore.changePlan(selectedPlan.value.plan_id)
    toast.add({
      title: 'Success',
      description: 'Plan changed successfully',
      color: 'green',
    })
    showChangePlanModal.value = false
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to change plan',
      color: 'red',
    })
  }
}

const confirmCancellation = async () => {
  try {
    await subscriptionStore.cancelSubscription(true)
    toast.add({
      title: 'Success',
      description: 'Subscription will be cancelled at the end of the billing period',
      color: 'green',
    })
    showCancelModal.value = false
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to cancel subscription',
      color: 'red',
    })
  }
}

const resumeSubscription = async () => {
  try {
    await subscriptionStore.resumeSubscription()
    toast.add({
      title: 'Success',
      description: 'Subscription resumed successfully',
      color: 'green',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to resume subscription',
      color: 'red',
    })
  }
}

onMounted(async () => {
  await Promise.all([
    subscriptionStore.fetchCurrentSubscription(),
    subscriptionStore.fetchAvailablePlans(),
    subscriptionStore.fetchUsage(),
  ])
})
</script>
