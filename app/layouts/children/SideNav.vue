<template>
    <div class="flex flex-col h-full p-4">
        <!-- Logo -->
        <NuxtLink to="/" class="mb-6 flex justify-center xl:justify-start">
            <!-- Desktop Logo -->
            <!-- <img src="~/assets/images/logo2.png" alt="Logo" class="hidden xl:block h-10 w-auto" /> -->

            <!-- Mobile Icon -->
            <div class="xl:hidden w-10 h-10 bg-gradient-to-br from-[#f02c56] to-purple-600 rounded-full flex items-center justify-center">
                <Icon name="mdi:store-fashion" class="w-5 h-5 text-white" />
            </div>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="flex flex-col space-y-2">
            <NuxtLink to="/" class="nav-button" active-class="active">
                <Icon name="mdi:home" size="26" />
                <span class="nav-text">Home</span>
            </NuxtLink>

            <button @click="$emit('open-search')" class="nav-button">
                <Icon name="mdi:magnify" size="26" />
                <span class="nav-text">Search</span>
            </button>

            <NuxtLink to="/discover" class="nav-button" active-class="active">
                <Icon name="mdi:view-grid-outline" size="26" />
                <span class="nav-text">Discover</span>
            </NuxtLink>
            
            <NuxtLink to="/thrift" class="nav-button" active-class="active">
                <Icon name="mdi:tshirt-crew-outline" size="26" />
                <span class="nav-text">Thrift</span>
            </NuxtLink>

            <NuxtLink to="/reels" class="nav-button" active-class="active">
                <Icon name="mdi:play-box-outline" size="26" />
                <span class="nav-text">Reels</span>
            </NuxtLink>

            <button v-if="profileStore.isLoggedIn" @click="$emit('create')" class="nav-button">
                <Icon name="mdi:plus-circle-outline" size="26" />
                <span class="nav-text">Create</span>
            </button>
            
            <button v-if="profileStore.isLoggedIn" @click="$emit('open-notifications')" class="nav-button relative">
                <div class="relative">
                    <Icon name="mdi:bell-outline" size="26" />
                    <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-brand"></span>
                </div>
                <span class="nav-text">Notifications</span>
            </button>

            <NuxtLink to="/messages" class="nav-button relative" active-class="active">
                <div class="relative">
                    <Icon name="mdi:message-outline" size="26" />
                    <span v-if="messageCount > 0" class="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-brand"></span>
                </div>
                <span class="nav-text">Messages</span>
            </NuxtLink>
        </nav>

        <!-- Profile Link (at the bottom) -->
        <div class="mt-auto">
            <ClientOnly>
                <NuxtLink 
                    v-if="profileStore.isLoggedIn" 
                    :to="profileStore.me?.role === 'buyer' ? '/buyer/profile' : profileStore.me?.role === 'seller' ? '/sellers/dashboard' : '/profile/' + profileStore.me?.username"
                    class="nav-button w-full"
                    active-class="active"
                >
                    <img 
                        :src="profileStore.me?.avatar || ''"
                        class="w-7 h-7 rounded-full ring-2 ring-transparent hover:ring-[#f02c56]" 
                    />
                    <span class="nav-text">Profile</span>
                </NuxtLink>
                
                <!-- Login Button (if not logged in) -->
                <NuxtLink v-else to="/user-login" class="nav-button">
                    <Icon name="mdi:login-variant" size="26" />
                    <span class="nav-text">Sign In</span>
                </NuxtLink>
            </ClientOnly>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store';

defineEmits(['create', 'open-search', 'open-notifications']);

const profileStore = useProfileStore();
// TODO: Connect to actual stores
const unreadCount = computed(() => 0);
const messageCount = computed(() => 0);
</script>

<style scoped>
.nav-button {
    @apply flex items-center gap-4 p-3 rounded-lg text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white transition-colors;
}

.nav-button.active {
    @apply text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-neutral-800;
}

.nav-text {
    @apply hidden xl:inline;
}
</style>