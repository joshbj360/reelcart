<template>
  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-neutral-800">
    <div class="aspect-square bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
      <img
        v-if="product.media?.length"
        :src="product.media[0].url"
        :alt="product.title"
        class="w-full h-full object-cover"
      />
      <Icon v-else name="mdi:image-outline" class="w-12 h-12 text-gray-400" />
    </div>
    <div class="p-4">
      <h3 class="font-medium text-gray-900 dark:text-neutral-100 truncate">{{ product.title }}</h3>
      <p class="text-sm text-gray-500 dark:text-neutral-400 mt-1">{{ formatPrice(product.price) }}</p>
      <div class="flex items-center gap-3 mt-3">
        <button @click="$emit('open-comments', product)" class="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200">
          <Icon name="mdi:comment-outline" class="w-5 h-5" />
        </button>
        <button @click="$emit('open-details', product)" class="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200">
          <Icon name="mdi:eye-outline" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ product: any }>()
defineEmits(['open-comments', 'open-details'])

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price / 100)
</script>
