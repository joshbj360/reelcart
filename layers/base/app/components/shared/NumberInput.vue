<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-neutral-300">
      {{ label }}
      <span v-if="required" class="text-brand">*</span>
    </label>
    <div class="relative rounded-md shadow-sm">
      <input
        :type="inputType"
        :value="input"
        @input="handleInput"
        :class="[
          'block w-full rounded-md border py-2 px-3 focus:outline-none sm:text-sm',
          'bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100', // Theme-aware bg and text
          'placeholder-gray-500 dark:placeholder-neutral-400', // Theme-aware placeholder
          error 
            ? 'border-red-500 text-red-900 focus:ring-red-500' 
            : 'border-gray-300 dark:border-neutral-700 focus:ring-brand' // Theme-aware border
        ]"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  input: {
    type: [Number, String],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  inputType: {
    type: String,
    default: 'number'
  }
});

const emit = defineEmits(['update:input']);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value: number | string = target.value;
  
  if (props.inputType === 'number') {
    value = value === '' ? '' : Number(value);
    if (isNaN(value as number)) value = '';
  }
  
  emit('update:input', value);
};
</script>