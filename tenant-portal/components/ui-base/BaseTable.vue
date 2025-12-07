<template>
  <UCard :ui="{ base: 'overflow-hidden' }">
    <template v-if="showHeader" #header>
      <div class="flex items-center justify-between">
        <div>
          <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ description }}
          </p>
        </div>
        <div v-if="$slots.actions" class="flex space-x-2">
          <slot name="actions" />
        </div>
      </div>
    </template>

    <div class="overflow-x-auto">
      <UTable
        :rows="rows"
        :columns="columns"
        :loading="loading"
        :empty-state="{ icon: emptyIcon, label: emptyLabel }"
        v-bind="$attrs"
      >
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </UTable>
    </div>

    <template v-if="showFooter && total > 0" #footer>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Showing {{ start }} to {{ end }} of {{ total }} results
        </div>
        <UPagination
          v-if="showPagination"
          v-model="currentPage"
          :total="total"
          :page-size="pageSize"
          @update:model-value="handlePageChange"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  rows: any[]
  columns: any[]
  title?: string
  description?: string
  loading?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showPagination?: boolean
  total?: number
  pageSize?: number
  currentPage?: number
  emptyIcon?: string
  emptyLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true,
  showPagination: true,
  total: 0,
  pageSize: 10,
  currentPage: 1,
  emptyIcon: 'i-heroicons-magnifying-glass',
  emptyLabel: 'No items found',
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const start = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const end = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.total)
})

const handlePageChange = (page: number) => {
  emit('page-change', page)
}
</script>
