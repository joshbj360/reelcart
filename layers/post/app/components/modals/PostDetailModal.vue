<template>
    <transition
        enter-active-class="transition-opacity duration-300 ease-out"
        leave-active-class="transition-opacity duration-300 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
    >
        <div v-if="product" class="fixed inset-0 bg-black/60 z-40" @click="$emit('close')"></div>
    </transition>
    
    <transition
        enter-active-class="transition-transform duration-300 ease-out"
        leave-active-class="transition-transform duration-300 ease-in"
        enter-from-class="translate-y-full sm:translate-y-0 sm:opacity-0"
        leave-to-class="translate-y-full sm:translate-y-0 sm:opacity-0"
    >
        <div 
            v-if="product" 
            class="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:max-w-2xl w-full z-50" 
            role="dialog" 
            aria-modal="true"
        >
            <div @click.stop class="bg-white dark:bg-neutral-900 w-full max-h-[85vh] sm:rounded-lg shadow-xl flex flex-col">
                <!-- Modal Header -->
                <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-neutral-800 shrink-0">
                    <h3 class="text-sm font-semibold text-gray-800 dark:text-neutral-200">Product Details</h3>
                    <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800">
                        <Icon name="mdi:close" size="20" class="text-gray-600 dark:text-neutral-300" />
                    </button>
                </div>
                
                <!-- 
                  THE FIX: 
                  - The `overflow-y-auto` wrapper div has been REMOVED.
                  - The `ProductDetails` component is now the direct child of the flex container.
                  - `flex-1` and `min-h-0` are applied so *it* becomes the scrolling area.
                -->
                <ProductDetails 
                    v-if="product.seller"
                    :product="product" 
                    :sellerStore="product.seller"
                    class="flex-1 min-h-0"
                />
                <div v-else class="p-4 text-center text-gray-500 dark:text-neutral-400">Loading details...</div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import type { IProduct } from '../../types/post.types';

// We are re-using the theme-compliant detailed info component

defineProps<{ product: IProduct | null }>();
defineEmits(['close']);
</script>

