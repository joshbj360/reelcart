<template>
  <div>
    <client-only>
      <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">{{ label }}</label>

      <!-- 
        THE FIX: Container is now w-full, theme-aware, and has a focus ring.
      -->
      <div 
        id="tag-input-container" 
        class="flex flex-wrap items-center border p-2 rounded-lg w-full mt-1
               bg-white dark:bg-neutral-800 
               border-gray-300 dark:border-neutral-700
               focus-within:ring-2 focus-within:ring-brand"
        :class="{ 'border-gray-900': isFocused, 'border-red-500': error }"
      >
        <!-- Render tags -->
        <div id="tags" class="flex flex-wrap gap-2">
          <div
            v-for="(tag, index) in modelValue"
            :key="index"
            class="tag-pill"
          >
            <span class="text-sm">{{ tag }}</span>
            <span class="close-icon" @click="removeTag(index)">×</span>
          </div>
        </div>

        <!-- Input for adding tags -->
        <input
          v-model="inputValue"
          type="text"
          id="tag-input"
          class="flex-1 p-1 outline-none min-w-[100px]
                 bg-transparent 
                 text-gray-900 dark:text-neutral-100
                 placeholder-gray-500 dark:placeholder-neutral-400"
          :placeholder="placeholder"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown.tab.prevent="addTag"
          @keydown.enter.prevent="addTag"
        />
      </div>
    </client-only>
    <span v-if="error" class="text-brand dark:text-brand-light text-[14px] font-semibold">
        {{ error }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
// THE FIX: Removed unused ITag and defaultTag imports

const inputValue = ref<string>(''); // Local state for the input value
const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    default: () => [],
  },
  label: {
    type: String,
    default: 'Add tags...',
  },
  placeholder: {
    type: String,
    default: 'Add tags...',
  },
  error: { // Added error prop to match other inputs
    type: String,
    default: '',
  }
})
let isFocused = ref(false)

const emit = defineEmits<{
  (e: 'update:modelValue', newTags: string[]): void;
}>();

// Add a new tag
const addTag = () => {
  if (inputValue.value.trim() && !props.modelValue.includes(inputValue.value.trim())) {
    const newTags = [...props.modelValue, inputValue.value.trim()];
    emit('update:modelValue', newTags);
    inputValue.value = '';
  }
};

// Remove a tag by index
const removeTag = (index: number) => {
  const newTags = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', newTags);
};
</script>

<style scoped>
/* THE FIX: 
  Moved styles here to be theme-aware using @apply
*/
.tag-pill {
  @apply bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-neutral-100 
         px-2.5 py-1 rounded-full flex items-center gap-1.5;
}

.close-icon {
  @apply cursor-pointer text-gray-500 dark:text-neutral-400 font-bold 
         hover:text-black dark:hover:text-white;
  font-size: 16px;
  line-height: 1;
}
</style>