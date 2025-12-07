<template>
  <UModal v-model="isOpen" :ui="{ width: width }">
    <UCard
      :ui="{
        base: 'border-0 shadow-xl',
        background: 'bg-white dark:bg-gray-900',
        ring: 'ring-0'
      }"
    >
      <template v-if="showHeader" #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ title }}
            </h3>
            <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ description }}
            </p>
          </div>
          <UButton
            variant="ghost"
            color="gray"
            icon="i-heroicons-x-mark"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="space-y-4">
        <slot />
      </div>

      <template v-if="showFooter" #footer>
        <div class="flex items-center justify-end space-x-2">
          <UButton
            v-if="showCancel"
            variant="outline"
            color="gray"
            @click="closeModal"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            v-if="showConfirm"
            :color="confirmColor"
            :loading="confirmLoading"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  description?: string
  width?: string
  showHeader?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmColor?: string
  confirmLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 'max-w-md',
  showHeader: true,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmColor: 'primary',
  confirmLoading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  confirm: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const closeModal = () => {
  isOpen.value = false
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>
