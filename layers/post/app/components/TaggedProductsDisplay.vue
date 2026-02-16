<template>
    <div v-if="products && products.length > 0" class="mt-3">
        <!-- Single Product (Type B - Experience/Review) -->
        <NuxtLink 
            v-if="contentType === 'EXPERIENCE' && products.length === 1"
            :to="`/product/${products[0].slug}`" 
            class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors border border-gray-100 dark:border-neutral-700"
        >
            <div class="w-8 h-8 rounded bg-gray-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
                <Icon name="mdi:shopping" size="16" class="text-gray-500 dark:text-neutral-400" />
            </div>
            <span class="text-xs font-semibold text-gray-700 dark:text-neutral-200 truncate">
                Tagged: {{ products[0].title }}
            </span>
            <Icon name="mdi:chevron-right" class="w-4 h-4 text-gray-400 ml-auto shrink-0" />
        </NuxtLink>

        <!-- Multiple Products Carousel (Type C - Inspiration) -->
        <div v-else-if="contentType === 'INSPIRATION' && products.length > 1" class="space-y-2">
            <p class="text-xs font-semibold text-gray-600 dark:text-neutral-400">Shop this look:</p>
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <NuxtLink 
                    v-for="product in products" 
                    :key="product.id"
                    :to="`/product/${product.slug}`"
                    class="shrink-0 w-24"
                >
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 mb-1">
                        <img 
                            :src="product.image || '/placeholder.png'" 
                            :alt="product.title"
                            class="w-full h-full object-cover"
                        />
                    </div>
                    <p class="text-xs text-gray-700 dark:text-neutral-300 truncate">{{ product.title }}</p>
                    <p class="text-xs font-bold text-gray-900 dark:text-neutral-100">{{ formatPrice(product.price) }}</p>
                </NuxtLink>
            </div>
        </div>

        <!-- Tutorial Products (Type D - Educational) -->
        <div v-else-if="contentType === 'EDUCATIONAL'" class="space-y-2">
            <p class="text-xs font-semibold text-gray-600 dark:text-neutral-400">Products used:</p>
            <div class="space-y-2">
                <NuxtLink 
                    v-for="product in products" 
                    :key="product.id"
                    :to="`/product/${product.slug}`"
                    class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                >
                    <img 
                        :src="product.image || '/placeholder.png'" 
                        :alt="product.title"
                        class="w-10 h-10 rounded object-cover"
                    />
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-gray-700 dark:text-neutral-200 truncate">{{ product.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-neutral-400">{{ formatPrice(product.price) }}</p>
                    </div>
                    <Icon name="mdi:chevron-right" class="w-4 h-4 text-gray-400 shrink-0" />
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
//import { formatPrice } from '~/utils/formatters';

defineProps<{
    products: any[];
    contentType: string;
}>();
</script>

<style scoped>
.scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>