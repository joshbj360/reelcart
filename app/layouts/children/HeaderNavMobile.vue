<template>
    <header class="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 md:hidden">
        <div class="flex items-center justify-between h-14 px-4">
            <!-- Logo -->
            <NuxtLink to="/" class="flex items-center gap-2">
                <div class="w-8 h-8 bg-gradient-to-br from-[#f02c56] to-purple-600 rounded-full flex items-center justify-center">
                    <Icon name="mdi:store-fashion" class="w-4 h-4 text-white" />
                </div>
                <span class="text-lg font-bold text-gray-900 dark:text-neutral-100">Fitsy</span>
            </NuxtLink>

            <!-- Actions -->
            <div class="flex items-center gap-2">
                <button @click="$emit('open-search')" class="header-button">
                    <Icon name="mdi:magnify" size="24" />
                </button>
                
                <button 
                    v-if="profileStore.isLoggedIn" 
                    @click="$emit('open-notifications')" 
                    class="header-button relative"
                >
                    <Icon name="mdi:bell-outline" size="24" />
                    <span v-if="unreadCount > 0" class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-brand"></span>
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store';
defineEmits(['open-search', 'open-notifications']);

const profileStore = useProfileStore();

// TODO: Connect to actual store
const unreadCount = computed(() => 0);
</script>

<style scoped>
.header-button {
    @apply p-2 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors;
}
</style>