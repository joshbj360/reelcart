<template>
    <Teleport to="body">
        <div 
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="$emit('close')"
        >
            <div class="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                    <button @click="$emit('close')">
                        <Icon name="mdi:arrow-left" size="24" />
                    </button>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">Add Story</h2>
                    <button class="text-brand font-semibold">Share</button>
                </div>

                <!-- Content -->
                <div class="p-6 text-center text-gray-500 dark:text-neutral-400">
                    <Icon name="mdi:camera-plus-outline" size="64" class="mb-4 mx-auto" />
                    <p>Story Upload UI Coming Soon</p>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
defineProps<{
    isOpen: boolean;
}>();

defineEmits(['close', 'posted']);
</script>