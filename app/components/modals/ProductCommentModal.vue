<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">Comments</h3>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-neutral-400">
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        <p class="text-gray-500 dark:text-neutral-400 text-sm">Comments for {{ product?.title || 'this product' }}</p>
        <p class="text-gray-400 dark:text-neutral-500 text-sm mt-4 text-center">Coming soon</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean; product: any }>()
defineEmits(['close'])
</script>
