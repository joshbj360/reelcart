<template>
    <div class="p-6 space-y-6">
        <!-- Filter Tabs -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
            <button 
                v-for="filter in orderFilters" 
                :key="filter.id"
                @click="activeFilter = filter.id"
                class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                :class="activeFilter === filter.id 
                    ? 'bg-brand text-white' 
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'"
            >
                {{ filter.label }}
                <span v-if="filter.count > 0" class="ml-1">({{ filter.count }})</span>
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
            <Icon name="eos-icons:loading" size="32" class="text-brand animate-spin" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
            <Icon name="mdi:package-variant-closed" size="64" class="text-gray-300 dark:text-neutral-700 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-neutral-400 mb-4">No orders found</p>
            <button 
                @click="goToShop"
                class="px-6 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-[#d81b36] transition-colors"
            >
                Start Shopping
            </button>
        </div>

        <!-- Orders List -->
        <div v-else class="space-y-4">
            <OrderCard 
                v-for="order in filteredOrders" 
                :key="order.id"
                :order="order"
                @track="trackOrder"
                @review="reviewOrder"
                @reorder="reorderItems"
                @cancel="cancelOrder"
            />

            <!-- Load More -->
            <button 
                v-if="hasMore"
                @click="loadMore"
                class="w-full py-3 text-brand font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
                Load More Orders
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import OrderCard from '../cards/OrderCard.vue'

const router = useRouter()

const activeFilter = ref('all')
const isLoading = ref(false)
const hasMore = ref(false)

// TODO: Fetch from API
const orders = ref([
    {
        id: '1',
        orderNumber: 'ORD-2024-001',
        status: 'DELIVERED',
        total: 299.99,
        items: [
            { id: '1', name: 'Product 1', image: 'https://picsum.photos/80', quantity: 2, price: 99.99 },
            { id: '2', name: 'Product 2', image: 'https://picsum.photos/80', quantity: 1, price: 100.01 }
        ],
        placedAt: '2024-01-15T10:30:00Z',
        deliveredAt: '2024-01-20T14:45:00Z'
    }
])

const orderFilters = computed(() => [
    { id: 'all', label: 'All Orders', count: orders.value.length },
    { id: 'pending', label: 'Pending', count: orders.value.filter(o => o.status === 'PENDING').length },
    { id: 'processing', label: 'Processing', count: orders.value.filter(o => o.status === 'PROCESSING').length },
    { id: 'shipped', label: 'Shipped', count: orders.value.filter(o => o.status === 'SHIPPED').length },
    { id: 'delivered', label: 'Delivered', count: orders.value.filter(o => o.status === 'DELIVERED').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.value.filter(o => o.status === 'CANCELLED').length }
])

const filteredOrders = computed(() => {
    if (activeFilter.value === 'all') return orders.value
    return orders.value.filter(o => o.status.toLowerCase() === activeFilter.value)
})

const goToShop = () => {
    router.push('/discover')
}

const trackOrder = (orderId: string) => {
    router.push(`/orders/${orderId}/track`)
}

const reviewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}/review`)
}

const reorderItems = (orderId: string) => {
    // TODO: Add items to cart
    console.log('Reorder:', orderId)
}

const cancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
        // TODO: Cancel order API
        console.log('Cancel:', orderId)
    }
}

const loadMore = () => {
    // TODO: Fetch more orders
}
</script>