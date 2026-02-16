<template>
    <div>
        <!-- Floating Button -->
        <button 
            v-if="!isOpen"
            @click="$emit('open')"
            class="fixed bottom-20 right-4 z-40 md:hidden w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
            <Icon name="mdi:robot-outline" size="28" />
        </button>

        <!-- Chat Modal (Placeholder) -->
        <Teleport to="body">
            <div 
                v-if="isOpen"
                class="fixed inset-0 z-50 md:hidden bg-white dark:bg-neutral-950"
            >
                <div class="flex flex-col h-full">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">AI Assistant</h2>
                        <button @click="$emit('close')" class="p-2">
                            <Icon name="mdi:close" size="24" />
                        </button>
                    </div>

                    <!-- Chat Content (Placeholder) -->
                    <div class="flex-1 flex items-center justify-center text-gray-500 dark:text-neutral-400">
                        <div class="text-center">
                            <Icon name="mdi:robot-outline" size="64" class="mb-4 mx-auto" />
                            <p>AI Chat Coming Soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    isOpen: boolean;
}>();

defineEmits(['open', 'close']);
</script>