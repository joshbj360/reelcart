<template>
    <NuxtLink 
        :to="`/messages/${conversation.id}`"
        class="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors border-b border-gray-100 dark:border-neutral-800"
        :class="{ 'bg-gray-50 dark:bg-neutral-900': isActive }"
    >
        <!-- Avatar -->
        <div class="relative shrink-0">
            <img 
                :src="conversation.otherUser?.avatar || formatAvatarUrl(conversation.otherUser?.username)" 
                :alt="conversation.otherUser?.username"
                class="w-14 h-14 rounded-full object-cover"
            />
            <!-- Online Indicator (if you have online status) -->
            <div v-if="isOnline" class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></div>
        </div>

        <!-- Message Info -->
        <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
                <p class="font-semibold text-gray-900 dark:text-neutral-100 truncate">
                    {{ conversation.otherUser?.username }}
                </p>
                <p class="text-xs text-gray-500 dark:text-neutral-400 shrink-0 ml-2">
                    {{ formatTime(conversation.lastMessageAt) }}
                </p>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600 dark:text-neutral-400 truncate">
                    {{ conversation.lastMessage || 'Start a conversation...' }}
                </p>
                <div v-if="conversation.unreadCount > 0" class="shrink-0 ml-2">
                    <span class="bg-brand text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {{ conversation.unreadCount }}
                    </span>
                </div>
            </div>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// import type { IConversation } from '~/layers/profile/app/types/profile.types';
// import { formatAvatarUrl } from '~/utils/formatters';

const props = defineProps<{
    conversation: IConversation;
    isActive?: boolean;
}>();

const isOnline = computed(() => {
    // Implement online status check
    return false;
});

const formatTime = (date: string) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return messageDate.toLocaleDateString();
};
</script>