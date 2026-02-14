<template>
    <div class="p-6 space-y-6">
        <!-- Wallet Balance Card -->
        <div class="bg-gradient-to-br from-brand to-[#d81b36] rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <p class="text-white/80 text-sm">Available Balance</p>
                    <h2 class="text-4xl font-bold">${{ balance.toFixed(2) }}</h2>
                </div>
                <Icon name="mdi:wallet" size="48" class="text-white/20" />
            </div>
            <div class="flex gap-3">
                <button 
                    @click="showAddFundsModal = true"
                    class="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                    Add Funds
                </button>
                <button 
                    @click="showWithdrawModal = true"
                    class="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                    Withdraw
                </button>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                <Icon name="mdi:trending-up" size="24" class="text-green-500 mb-2" />
                <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                    ${{ stats.earned.toFixed(2) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-neutral-400">Total Earned</p>
            </div>

            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                <Icon name="mdi:trending-down" size="24" class="text-red-500 mb-2" />
                <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                    ${{ stats.spent.toFixed(2) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-neutral-400">Total Spent</p>
            </div>

            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                <Icon name="mdi:gift" size="24" class="text-brand mb-2" />
                <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                    {{ stats.rewards }}
                </p>
                <p class="text-xs text-gray-500 dark:text-neutral-400">Rewards Points</p>
            </div>

            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                <Icon name="mdi:cash-refund" size="24" class="text-blue-500 mb-2" />
                <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                    ${{ stats.cashback.toFixed(2) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-neutral-400">Cashback</p>
            </div>
        </div>

        <!-- Transaction History -->
        <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-neutral-800">
                <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
                    Transaction History
                </h3>
            </div>

            <div class="divide-y divide-gray-200 dark:divide-neutral-800">
                <div 
                    v-for="transaction in transactions" 
                    :key="transaction.id"
                    class="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                    <div class="flex items-center gap-3">
                        <div 
                            class="w-10 h-10 rounded-full flex items-center justify-center"
                            :class="transaction.type === 'CREDIT' 
                                ? 'bg-green-100 dark:bg-green-900/20' 
                                : 'bg-red-100 dark:bg-red-900/20'"
                        >
                            <Icon 
                                :name="transaction.type === 'CREDIT' ? 'mdi:arrow-down' : 'mdi:arrow-up'"
                                size="20"
                                :class="transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'"
                            />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">
                                {{ transaction.description }}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-neutral-400">
                                {{ formatDate(transaction.createdAt) }}
                            </p>
                        </div>
                    </div>
                    <div 
                        class="text-right"
                        :class="transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'"
                    >
                        <p class="font-semibold">
                            {{ transaction.type === 'CREDIT' ? '+' : '-' }}${{ transaction.amount.toFixed(2) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Funds Modal -->
    <AddFundsModal 
        v-if="showAddFundsModal"
        @close="showAddFundsModal = false"
        @success="handleFundsAdded"
    />

    <!-- Withdraw Modal -->
    <WithdrawModal 
        v-if="showWithdrawModal"
        :balance="balance"
        @close="showWithdrawModal = false"
        @success="handleWithdrawSuccess"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AddFundsModal from '../modals/AddFundsModal.vue'
import WithdrawModal from '../modals/WithdrawModal.vue'

const showAddFundsModal = ref(false)
const showWithdrawModal = ref(false)

// TODO: Fetch from API
const balance = ref(1234.56)
const stats = ref({
    earned: 5678.90,
    spent: 3456.78,
    rewards: 1250,
    cashback: 234.56
})

const transactions = ref([
    {
        id: '1',
        type: 'CREDIT',
        description: 'Refund from Order #ORD-2024-001',
        amount: 99.99,
        createdAt: '2024-01-20T10:30:00Z'
    },
    {
        id: '2',
        type: 'DEBIT',
        description: 'Purchase Order #ORD-2024-002',
        amount: 149.99,
        createdAt: '2024-01-19T15:45:00Z'
    }
])

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
const handleFundsAdded = (amount: number) => {
    // Refresh wallet balance
    balance.value += amount
    showAddFundsModal.value = false
    // Show success toast
}

const handleWithdrawSuccess = (amount: number) => {
    // Refresh wallet balance
    balance.value -= amount
    showWithdrawModal.value = false
    // Show success toast
}
</script>