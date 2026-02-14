<template>
    <div class="fixed top-14 left-0 right-0 z-10 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 md:hidden">
        <div class="flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
            <NuxtLink 
                to="/" 
                class="category-pill"
                :class="{ 'active': currentCategory === 'all' }"
            >
                All
            </NuxtLink>
            
            <!-- <NuxtLink 
                v-for="category in categories" 
                :key="category.id"
                :to="`/category/${category.slug}`"
                class="category-pill"
                :class="{ 'active': currentCategory === category.slug }"
            >
                {{ category.name }}
            </NuxtLink> -->
            
            <NuxtLink to="/thrift" class="category-pill">
                <Icon name="mdi:hanger" size="16" class="mr-1" />
                Thrift
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

//const categories = computed(() => categoryStore.categories?.slice(0, 8) || []);
const currentCategory = computed(() => route.params.slug || 'all');
</script>

<style scoped>
.scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.category-pill {
    @apply inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors;
}

.category-pill.active {
    @apply bg-red-500 text-white;
}
</style>