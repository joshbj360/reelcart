<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div class="relative bg-white dark:bg-neutral-900 rounded-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">Create Story</h3>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-neutral-400">
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        <p class="text-gray-400 dark:text-neutral-500 text-sm text-center py-8">Story upload coming soon</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean }>()
defineEmits(['close', 'posted'])
</script>
