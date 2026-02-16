<template>
    <div class="p-6 space-y-6">
        <!-- Enrollment Status -->
        <div v-if="!isEnrolled" class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white text-center">
            <Icon name="mdi:cash-multiple" size="64" class="mx-auto mb-4" />
            <h2 class="text-2xl font-bold mb-2">Join Our Affiliate Program</h2>
            <p class="text-white/90 mb-6">
                Earn commission by sharing products you love. Get 10% on every sale!
            </p>
            <button 
                @click="enrollAffiliate"
                class="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
                Enroll Now
            </button>
        </div>

        <!-- Affiliate Dashboard -->
        <template v-else>
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                    <Icon name="mdi:cash" size="24" class="text-green-500 mb-2" />
                    <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                        ${{ affiliateStats.earnings.toFixed(2) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-neutral-400">Total Earnings</p>
                </div>

                <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                    <Icon name="mdi:mouse" size="24" class="text-blue-500 mb-2" />
                    <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                        {{ affiliateStats.clicks }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-neutral-400">Total Clicks</p>
                </div>

                <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                    <Icon name="mdi:cart-check" size="24" class="text-brand mb-2" />
                    <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                        {{ affiliateStats.conversions }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-neutral-400">Conversions</p>
                </div>

                <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-4">
                    <Icon name="mdi:percent" size="24" class="text-purple-500 mb-2" />
                    <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                        {{ affiliateStats.conversionRate.toFixed(2) }}%
                    </p>
                    <p class="text-xs text-gray-500 dark:text-neutral-400">Conversion Rate</p>
                </div>
            </div>

            <!-- Affiliate Link -->
            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6">
                <h3 class="font-semibold text-gray-900 dark:text-neutral-100 mb-4">
                    Your Affiliate Link
                </h3>
                <div class="flex gap-2">
                    <input 
                        :value="affiliateLink"
                        readonly
                        class="flex-1 px-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 font-mono text-sm"
                    />
                    <button 
                        @click="copyLink"
                        class="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-[#d81b36] transition-colors"
                    >
                        <Icon name="mdi:content-copy" size="20" />
                    </button>
                </div>
            </div>

            <!-- Recent Referrals -->
            <div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <div class="p-4 border-b border-gray-200 dark:border-neutral-800">
                    <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
                        Recent Referrals
                    </h3>
                </div>

                <div class="divide-y divide-gray-200 dark:divide-neutral-800">
                    <div 
                        v-for="referral in recentReferrals" 
                        :key="referral.id"
                        class="p-4 flex items-center justify-between"
                    >
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                                <Icon name="mdi:account" size="20" class="text-brand" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">
                                    {{ referral.productName }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-neutral-400">
                                    {{ formatDate(referral.date) }}
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-semibold text-green-600">
                                +${{ referral.commission.toFixed(2) }}
                            </p>
                            <span 
                                class="text-xs px-2 py-0.5 rounded-full"
                                :class="referral.status === 'PAID' 
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'"
                            >
                                {{ referral.status }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../../../../../../app/composables/useToast'

const toast = useToast()

// TODO: Fetch from API
const isEnrolled = ref(true)
const affiliateStats = ref({
    earnings: 1234.56,
    clicks: 5678,
    conversions: 234,
    conversionRate: 4.12
})

const affiliateLink = ref('https://fitsy.com/ref/username123')

const recentReferrals = ref([
    {
        id: '1',
        productName: 'Premium Sneakers',
        commission: 12.34,
        status: 'PAID',
        date: '2024-01-20T10:30:00Z'
    },
    {
        id: '2',
        productName: 'Designer Jacket',
        commission: 45.67,
        status: 'PENDING',
        date: '2024-01-19T15:45:00Z'
    }
])

const enrollAffiliate = async () => {
    // TODO: Enroll API
    isEnrolled.value = true
    toast.showToast('Successfully enrolled in affiliate program!','success')
}

const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink.value)
    toast.showToast('Affiliate link copied!','success')
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}
</script>