<template>
    <div class="flex flex-col h-full">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-950">
            <NuxtLink :to="`/profile/${otherUser?.username}`" class="flex items-center gap-3 flex-1">
                <img 
                    :src="otherUser?.avatar || formatAvatarUrl(otherUser?.username)" 
                    :alt="otherUser?.username"
                    class="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <p class="font-semibold text-gray-900 dark:text-neutral-100">{{ otherUser?.username }}</p>
                    <p v-if="isOnline" class="text-xs text-green-500">Active now</p>
                </div>
            </NuxtLink>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-neutral-900">
            <div v-if="isLoading" class="flex items-center justify-center h-full">
                <Icon name="eos-icons:loading" size="32" class="text-brand" />
            </div>
            <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-neutral-400">
                <Icon name="mdi:message-outline" size="48" class="mb-3" />
                <p>No messages yet. Say hi! 👋</p>
            </div>
            <div v-else>
                <MessageBubble 
                    v-for="(message, index) in messages" 
                    :key="message.id"
                    :message="message"
                    :show-avatar="shouldShowAvatar(index)"
                />
            </div>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <form @submit.prevent="sendMessage" class="flex items-center gap-2">
                <button 
                    type="button"
                    class="text-gray-500 dark:text-neutral-400 hover:text-brand transition-colors"
                >
                    <Icon name="mdi:emoticon-outline" size="24" />
                </button>
                <input 
                    v-model="messageText"
                    type="text"
                    placeholder="Message..."
                    class="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-sm text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none"
                />
                <button 
                    type="submit"
                    :disabled="!messageText.trim() || isSending"
                    class="text-brand font-semibold text-sm disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useChat } from '~~/layers/profile/app/composables/useChat';
import { useChatStore } from '../../stores/chat.store';
import { useProfileStore } from '../../stores/profile.store';
import { formatAvatarUrl } from '~/utils/formatters';
import MessageBubble from '~~/layers/profile/app/components/MessageBubble.vue';

const route = useRoute();
const chatStore = useChatStore();
const profileStore = useProfileStore();
const { sendMessage: sendMsg, isLoading } = useChat();

const conversationId = computed(() => route.params.conversationId as string);
const conversation = computed(() => 
    chatStore.conversations?.find(c => c.id === conversationId.value)
);
const messages = computed(() => chatStore.getConversationMessages(conversationId.value) || []);
const otherUser = computed(() => conversation.value?.otherUser);

const messageText = ref('');
const isSending = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const isOnline = ref(false); // TODO: Implement real-time online status

watch(messages, async () => {
    await nextTick();
    scrollToBottom();
});

onMounted(() => {
    scrollToBottom();
});

const shouldShowAvatar = (index: number) => {
    if (index === 0) return true;
    const currentMessage = messages.value[index];
    const previousMessage = messages.value[index - 1];
    return currentMessage.senderId !== previousMessage.senderId;
};

const sendMessage = async () => {
    if (!messageText.value.trim()) return;
    
    isSending.value = true;
    try {
        await sendMsg(conversationId.value, messageText.value);
        messageText.value = '';
        await nextTick();
        scrollToBottom();
    } catch (error) {
        console.error('Failed to send message:', error);
    } finally {
        isSending.value = false;
    }
};

const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};
</script>