<template>
  <UFormGroup
    :label="label"
    :required="required"
    :hint="hint"
    :error="error"
    :ui="{ label: 'form-label', container: 'space-y-2' }"
  >
    <div class="relative">
      <UInput
        v-model="modelValue"
        :type="type"
        :placeholder="placeholder"
        :size="size"
        :variant="variant"
        :color="color"
        :disabled="disabled"
        :loading="loading"
        :icon="icon"
        :trailing-icon="trailingIcon"
        class="base-input"
        v-bind="$attrs"
      />
      <slot name="trailing" />
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'outline' | 'soft' | 'bd' | 'shadow'
  color?: 'primary' | 'gray' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'
  required?: boolean
  disabled?: boolean
  loading?: boolean
  hint?: string
  error?: string
  icon?: string
  trailingIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'outline',
  color: 'primary',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped>
.base-input {
  @apply transition-all duration-200;
}

.base-input:focus-within {
  @apply ring-2 ring-primary-500 ring-offset-2;
}
</style>
