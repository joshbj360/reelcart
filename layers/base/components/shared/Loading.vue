<template>
  <div
    class="fixed inset-0 bg-gray-900 bg-opacity-50 w-full h-full z-50 flex items-center justify-center"
    role="alert"
    aria-label="Loading content"
    aria-busy="true"
  >
    <div class="p-4 sm:p-6 bg-white rounded-lg shadow-lg flex flex-col items-center">
      <Icon name="mdi:loading" size="48" class="text-brand-dark animate-spin" />
      <span class="mt-3 text-sm sm:text-base font-medium text-gray-800">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>