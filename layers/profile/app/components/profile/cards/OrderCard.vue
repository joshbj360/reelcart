<template>
    <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
                <p class="text-sm text-gray-500 dark:text-neutral-400">
                    Order {{ order.orderNumber }}
                </p>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                    {{ formatDate(order.placedAt) }}
                </p>
            </div>
            <div>
                <span 
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="statusClasses[order.status]"
                >
                    {{ order.status }}
                </span>
            </div>
        </div>

        <!-- Items -->
        <div class="p-4 space-y-3">
            <div 
                v-for="item in order.items" 
                :key="item.id"
                class="flex gap-3"
            >
                <img 
                    :src="item.image"
                    :alt="item.name"
                    class="w-16 h-16 rounded-lg object-cover"
                />
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-neutral-100 truncate">
                        {{ item.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-neutral-400">
                        Qty: {{ item.quantity }} × ${{ item.price }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-gray-50 dark:bg-neutral-800 flex items-center justify-between">
            <div class="text-sm">
                <span class="text-gray-500 dark:text-neutral-400">Total:</span>
                <span class="ml-2 font-bold text-gray-900 dark:text-neutral-100">
                    ${{ order.total.toFixed(2) }}
                </span>
            </div>

            <div class="flex gap-2">
                <!-- Track Button (if shipped) -->
                <button 
                    v-if="['SHIPPED', 'PROCESSING'].includes(order.status)"
                    @click="$emit('track', order.id)"
                    class="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-[#d81b36] transition-colors"
                >
                    Track Order
                </button>

                <!-- Review Button (if delivered) -->
                <button 
                    v-if="order.status === 'DELIVERED'"
                    @click="$emit('review', order.id)"
                    class="px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
                >
                    Write Review
                </button>

                <!-- Reorder Button -->
                <button 
                    @click="$emit('reorder', order.id)"
                    class="px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
                >
                    Reorder
                </button>

                <!-- Cancel Button (if pending) -->
                <button 
                    v-if="order.status === 'PENDING'"
                    @click="$emit('cancel', order.id)"
                    class="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    order: any
}>()

defineEmits(['track', 'review', 'reorder', 'cancel'])

const statusClasses = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    PROCESSING: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    SHIPPED: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    DELIVERED: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    CANCELLED: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}
</script>