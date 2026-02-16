<template>
    <div class="space-y-6">
        <!-- Suggestions For You -->
        <div v-if="profileStore.isLoggedIn">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-500 dark:text-neutral-400">Suggested For You</h3>
                <NuxtLink to="/discover/people" class="text-xs font-semibold text-brand hover:text-[#d81b36]">
                    See All
                </NuxtLink>
            </div>
            <div class="space-y-3">
                <div v-for="i in 5" :key="i" class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800"></div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 dark:text-neutral-100 truncate">User {{ i }}</p>
                        <p class="text-xs text-gray-500 dark:text-neutral-400">Suggested</p>
                    </div>
                    <button class="text-xs font-semibold text-brand hover:text-[#d81b36]">
                        Follow
                    </button>
                </div>
            </div>
        </div>

        <!-- Top Sellers -->
        <div v-if="topSellers && topSellers.length > 0">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-neutral-400 mb-3">Top Sellers</h3>
            <div class="space-y-3">
                <NuxtLink 
                    v-for="seller in topSellers.slice(0, 5)" 
                    :key="seller.id"
                    :to="`/sellers/profile/${seller.store_slug}`"
                    class="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg p-2 -mx-2 transition-colors"
                >
                    <img 
                        :src="seller.store_logo || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'"
                        class="w-10 h-10 rounded-full object-cover"
                    />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 dark:text-neutral-100 truncate">
                            {{ seller.store_name }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-neutral-400">
                            {{ seller.products_count || 0 }} products
                        </p>
                    </div>
                </NuxtLink>
            </div>
        </div>

        <!-- Categories -->
        <div v-if="categories && categories.length > 0">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-neutral-400 mb-3">Categories</h3>
            <div class="flex flex-wrap gap-2">
                <NuxtLink 
                    v-for="category in categories.slice(0, 8)" 
                    :key="category.id"
                    :to="`/category/${category.slug}`"
                    class="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                    {{ category.name }}
                </NuxtLink>
            </div>
        </div>

        <!-- Footer Links -->
        <div class="text-xs text-gray-500 dark:text-neutral-400 space-y-2 pt-4 border-t border-gray-200 dark:border-neutral-800">
            <div class="flex flex-wrap gap-2">
                <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
                <span>•</span>
                <NuxtLink to="/help" class="hover:underline">Help</NuxtLink>
                <span>•</span>
                <NuxtLink to="/terms" class="hover:underline">Terms</NuxtLink>
                <span>•</span>
                <NuxtLink to="/privacy" class="hover:underline">Privacy</NuxtLink>
            </div>
            <p class="text-gray-400 dark:text-neutral-500">© 2024 Fitsy</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store';
defineProps<{
    topSellers?: any[];
    categories?: any[];
}>();

const profileStore = useProfileStore()

</script>