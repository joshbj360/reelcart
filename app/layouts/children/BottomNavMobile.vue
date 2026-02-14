<template>
    <nav class="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
        <div class="flex items-center justify-around h-14 px-2">
            <NuxtLink to="/" class="nav-item" active-class="active">
                <Icon name="mdi:home" size="28" />
            </NuxtLink>
            
            <NuxtLink to="/discover" class="nav-item" active-class="active">
                <Icon name="mdi:compass-outline" size="28" />
            </NuxtLink>
            
            <button 
                v-if="profileStore.isLoggedIn" 
                @click="$emit('create')" 
                class="nav-item"
            >
                <div class="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                    <Icon name="mdi:plus" size="24" class="text-white" />
                </div>
            </button>
            <NuxtLink v-else to="/auth/login" class="nav-item">
                <Icon name="mdi:plus-circle-outline" size="28" />
            </NuxtLink>
            
            <NuxtLink to="/reels" class="nav-item" active-class="active">
                <Icon name="mdi:play-box-outline" size="28" />
            </NuxtLink>
            
            <NuxtLink 
                v-if="profileStore.isLoggedIn" 
                :to="profileStore.me?.role === 'buyer' ? '/buyer/profile'  : profileStore.me?.role === 'seller' ? '/sellers/dashboard' : '/buyer/profile'" 
                class="nav-item relative" 
                active-class="active"
            >
                <img 
                    :src="profileStore.me?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d' "
                    class="w-7 h-7 rounded-full border-2 border-transparent"
                    :class="{ 'border-brand': isProfileActive }"
                />
            </NuxtLink>
            <NuxtLink v-else to="/auth/login" class="nav-item">
                <Icon name="mdi:account-circle-outline" size="28" />
            </NuxtLink>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store';


defineEmits(['create']);

const route = useRoute();
const profileStore = useProfileStore();

const isProfileActive = computed(() => {
    return route.path.includes('/profile') || 
           route.path.includes('/sellers/dashboard') || 
           route.path.includes('/buyer/profile');
});
</script>

<style scoped>
.nav-item {
    @apply flex items-center justify-center w-12 h-12 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors;
}

.nav-item.active {
    @apply text-gray-900 dark:text-neutral-100;
}
</style>