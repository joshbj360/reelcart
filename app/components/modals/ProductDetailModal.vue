<template>
  <Teleport to="body">
    <div v-if="product" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div class="relative bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">{{ product.title }}</h3>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-neutral-400">
            <Icon name="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        <div class="aspect-square bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden mb-4">
          <img
            v-if="product.media?.length"
            :src="product.media[0].url"
            :alt="product.title"
            class="w-full h-full object-cover"
          />
        </div>
        <p v-if="product.description" class="text-gray-600 dark:text-neutral-300 text-sm">{{ product.description }}</p>
        <p class="text-lg font-bold text-gray-900 dark:text-neutral-100 mt-3">{{ formatPrice(product.price) }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ product: any }>()
defineEmits(['close'])

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price / 100)
</script>
