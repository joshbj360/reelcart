<template>
    <div class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
        <NuxtLink :to="`/profile/${user.username}`" class="flex items-center gap-3 flex-1 min-w-0">
            <img 
                :src="user.avatar || formatAvatarUrl(user.username)" 
                :alt="user.username"
                class="w-12 h-12 rounded-full object-cover"
            />
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 dark:text-neutral-100 truncate">{{ user.username }}</p>
                <p v-if="user.bio" class="text-sm text-gray-500 dark:text-neutral-400 truncate">{{ user.bio }}</p>
            </div>
        </NuxtLink>
        
        <FollowButton 
            v-if="!hideFollow && user.id !== profileStore.userId"
            :user-id="user.id" 
            :username="user.username"
            class="px-4 py-1.5 rounded-lg font-semibold text-sm"
        />
    </div>
</template>

<script setup lang="ts">
import { useProfileStore } from '~/stores/profile.store';
import type { IProfile } from '~/layers/profile/app/types/profile.types';
import { formatAvatarUrl } from '~/utils/formatters';
import FollowButton from './FollowButton.vue';

defineProps<{
    user: IProfile;
    hideFollow?: boolean;
}>();

const profileStore = useProfileStore();
</script>