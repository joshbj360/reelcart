<template>
    <HomeLayout>
        <div class="max-w-5xl mx-auto">
            <div class="bg-white dark:bg-neutral-950 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
                <div class="md:flex h-[80vh]">
                    <!-- Left: Conversations List -->
                    <div class="md:w-2/5 border-r border-gray-200 dark:border-neutral-800 flex flex-col">
                        <!-- Header -->
                        <div class="p-4 border-b border-gray-200 dark:border-neutral-800">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-xl font-bold text-gray-900 dark:text-neutral-100">Messages</h2>
                                <NuxtLink to="/messages/new" class="text-brand hover:text-[#d81b36]">
                                    <Icon name="mdi:pencil" size="24" />
                                </NuxtLink>
                            </div>
                            <!-- Search -->
                            <input 
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search messages..."
                                class="w-full px-3 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-sm text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none"
                            />
                        </div>

                        <!-- Conversations List -->
                        <div class="flex-1 overflow-y-auto">
                            <div v-if="isLoading" class="flex items-center justify-center py-20">
                                <Icon name="eos-icons:loading" size="32" class="text-brand" />
                            </div>
                            <div v-else-if="filteredConversations.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-neutral-400">
                                <Icon name="mdi:message-outline" size="48" class="mb-3" />
                                <p>No messages yet</p>
                                <NuxtLink to="/messages/new" class="text-brand hover:underline mt-2">
                                    Start a conversation
                                </NuxtLink>
                            </div>
                            <div v-else>
                                <ConversationItem 
                                    v-for="conversation in filteredConversations" 
                                    :key="conversation.id"
                                    :conversation="conversation"
                                    :is-active="selectedConversationId === conversation.id"
                                    @click="selectConversation(conversation.id)"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Right: Chat Window (Desktop) -->
                    <div class="hidden md:flex md:w-3/5 items-center justify-center bg-gray-50 dark:bg-neutral-900">
                        <div v-if="!selectedConversationId" class="text-center text-gray-500 dark:text-neutral-400">
                            <Icon name="mdi:message-text-outline" size="64" class="mb-4 mx-auto" />
                            <p class="text-lg font-semibold">Your Messages</p>
                            <p class="text-sm mt-2">Send private messages to a friend</p>
                            <NuxtLink 
                                to="/messages/new"
                                class="inline-block mt-4 px-4 py-2 bg-brand text-white rounded-lg font-semibold text-sm hover:bg-[#d81b36] transition-colors"
                            >
                                Send Message
                            </NuxtLink>
                        </div>
                        <NuxtPage v-else />
                    </div>
                </div>
            </div>
        </div>
    </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useChat } from '../../composables/useChat';
import { useChatStore } from '../../stores/chat.store';
import HomeLayout from '~/layouts/HomeLayout.vue';
import ConversationItem from '../../components/ConversationItem.vue';

const router = useRouter();
const chatStore = useChatStore();
const { fetchConversations, isLoading } = useChat();

const searchQuery = ref('');
const selectedConversationId = ref<string | null>(null);

const conversations = computed(() => chatStore.conversations || []);

const filteredConversations = computed(() => {
    if (!searchQuery.value) return conversations.value;
    
    const query = searchQuery.value.toLowerCase();
    return conversations.value.filter(conv => 
        conv.otherUser?.username?.toLowerCase().includes(query)
    );
});

onMounted(async () => {
    await fetchConversations();
});

const selectConversation = (id: string) => {
    selectedConversationId.value = id;
    router.push(`/messages/${id}`);
};
</script>