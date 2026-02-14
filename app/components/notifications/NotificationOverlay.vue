<template>
    <Teleport to="body">
        <div 
            v-if="isOpen"
            class="fixed inset-0 z-50 bg-white dark:bg-neutral-950 md:left-auto md:w-96 md:border-l md:border-gray-200 md:dark:border-neutral-800"
        >
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                    <button @click="$emit('close')" class="md:hidden">
                        <Icon name="mdi:arrow-left" size="24" />
                    </button>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">Notifications</h2>
                    <button class="text-brand text-sm font-semibold">Mark all read</button>
                </div>

                <!-- Notifications List -->
                <div class="flex-1 overflow-y-auto">
                    <div class="text-center text-gray-500 dark:text-neutral-400 py-20">
                        <Icon name="mdi:bell-outline" size="48" class="mb-3 mx-auto" />
                        <p>No notifications yet</p>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
defineProps<{
    isOpen: boolean;
}>();

defineEmits(['close']);
</script>