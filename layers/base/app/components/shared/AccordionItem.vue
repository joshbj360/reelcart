<template>
  <!-- 
    This component is now fully theme-aware, defaulting to light mode
    and using `dark:` prefixes for dark mode.
  -->
  <div class="border-b border-gray-200 dark:border-neutral-700">
    <button
      @click="isOpen = !isOpen"
      class="w-full flex justify-between items-center py-4 text-left"
    >
      <span class="font-medium text-gray-800 dark:text-neutral-100">{{ title }}</span>
      <Icon 
        name="mdi:chevron-down" 
        class="transition-transform duration-300 text-gray-500 dark:text-neutral-400"
        :class="{ 'transform rotate-180': isOpen }"
      />
    </button>
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-2 max-h-0"
      enter-to-class="opacity-100 translate-y-0 max-h-screen"
      leave-from-class="opacity-100 translate-y-0 max-h-screen"
      leave-to-class="opacity-0 -translate-y-2 max-h-0"
    >
      <!-- 
        This wrapper is "dumb" and applies no styles to the content,
        allowing the parent to control all styling.
      -->
      <div v-if="isOpen" class="pb-4">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  startOpen?: boolean;
}>();

const isOpen = ref(props.startOpen || false);
</script>

