<template>
    <Teleport to="body">
        <div 
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="$emit('close')"
        >
            <div class="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                    <button @click="$emit('close')">
                        <Icon name="mdi:arrow-left" size="24" />
                    </button>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">List Product</h2>
                    <button class="text-brand font-semibold">Publish</button>
                </div>

                <!-- Content -->
                <div class="p-6 text-center text-gray-500 dark:text-neutral-400">
                    <Icon name="mdi:shopping-outline" size="64" class="mb-4 mx-auto" />
                    <p>Product Upload UI Coming Soon</p>
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