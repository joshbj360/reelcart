<template>
    <div class="space-y-3">
        <p class="text-sm font-medium text-gray-700 dark:text-neutral-300">
            Uploaded Media ({{ media.length }}/10)
        </p>
        <div class="grid grid-cols-3 gap-3">
            <div 
                v-for="(item, index) in media" 
                :key="item.public_id ?? index" 
                class="relative aspect-square rounded-lg overflow-hidden border-2"
                :class="item.public_id === mainPublicId ? 'border-[#f02c56]' : 'border-gray-200 dark:border-neutral-700'"
            >
                <img v-if="item.type === 'IMAGE'" :src="item.url" class="w-full h-full object-cover" />
                <video v-else :src="item.url" class="w-full h-full object-cover" muted playsinline></video>
                
                <!-- Main Badge -->
                <div v-if="item.public_id === mainPublicId" class="absolute top-1 left-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    MAIN
                </div>

                <!-- Remove Button -->
                <button @click="$emit('remove', index)" class="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/80">
                    <Icon name="mdi:close" size="16" />
                </button>

                <!-- Set as Main Button -->
                <button 
                    v-if="item.public_id !== mainPublicId" 
                    @click="$emit('set-main', item.public_id)" 
                    class="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 text-white text-xs rounded-md hover:bg-black/80"
                >
                    Set as Main
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IMedia } from '~/models';
import { computed } from 'vue';

const props = defineProps<{
    media: IMedia[];
}>();

const emit = defineEmits(['remove', 'set-main']);

// The main image is always the first one in the parent's array
const mainPublicId = computed(() => props.media[0]?.public_id || null);
</script>
