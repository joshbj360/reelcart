<template>
    <div 
        class="flex mb-4"
        :class="isOwnMessage ? 'justify-end' : 'justify-start'"
    >
        <!-- Other User Avatar -->
        <img 
            v-if="!isOwnMessage && showAvatar"
            :src="message.sender?.avatar || formatAvatarUrl(message.sender?.username)" 
            :alt="message.sender?.username"
            class="w-8 h-8 rounded-full object-cover mr-2 shrink-0"
        />
        <div v-else-if="!isOwnMessage" class="w-8 mr-2"></div>

        <!-- Message Content -->
        <div 
            class="max-w-[70%] rounded-2xl px-4 py-2"
            :class="isOwnMessage 
                ? 'bg-brand text-white rounded-br-sm' 
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-bl-sm'"
        >
            <p class="text-sm whitespace-pre-wrap break-words">{{ message.text }}</p>
            <p 
                class="text-xs mt-1"
                :class="isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-neutral-400'"
            >
                {{ formatTime(message.createdAt) }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProfileStore } from '~/stores/profile.store';
import type { IMessage } from '~/layers/profile/app/types/profile.types';
import { formatAvatarUrl } from '~/utils/formatters';

const props = defineProps<{
    message: IMessage;
    showAvatar?: boolean;
}>();

const profileStore = useProfileStore();

const isOwnMessage = computed(() => props.message.senderId === profileStore.userId);

const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
};
</script>