<template>
    <Teleport to="body">
        <div 
            v-if="isOpen"
            class="fixed inset-0 z-50 bg-white dark:bg-neutral-950"
        >
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-neutral-800">
                    <button @click="$emit('close')" class="md:hidden">
                        <Icon name="mdi:arrow-left" size="24" />
                    </button>
                    <div class="flex-1 relative">
                        <Icon name="mdi:magnify" size="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search..."
                            autofocus
                            class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none"
                        />
                    </div>
                    <button v-if="searchQuery" @click="searchQuery = ''" class="text-gray-500 dark:text-neutral-400">
                        <Icon name="mdi:close" size="20" />
                    </button>
                </div>

                <!-- Results -->
                <div class="flex-1 overflow-y-auto p-4">
                    <div v-if="!searchQuery" class="text-center text-gray-500 dark:text-neutral-400 py-20">
                        <Icon name="mdi:magnify" size="48" class="mb-3 mx-auto" />
                        <p>Search for users, products, or posts</p>
                    </div>
                    <div v-else class="text-center text-gray-500 dark:text-neutral-400 py-20">
                        <Icon name="mdi:alert-circle-outline" size="48" class="mb-3 mx-auto" />
                        <p>Search functionality coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    isOpen: boolean;
}>();

defineEmits(['close']);

const searchQuery = ref('');
</script>