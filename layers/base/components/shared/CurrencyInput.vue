<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-neutral-300">
      {{ label }} ({{ currencySymbol }})
      <span v-if="required" class="text-brand">*</span>
    </label>
    <div class="relative rounded-md shadow-sm">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      </div>
      <input
        type="text"
        :value="formattedValue"
        @input="handleInput"
        @blur="handleBlur"
        :placeholder="'0.00'"
        :class="[
          'block w-full rounded-md border py-2 pl-7 pr-3 focus:outline-none sm:text-sm',
          'bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100',
          'placeholder-gray-500 dark:placeholder-neutral-400',
          error 
            ? 'border-red-500 text-red-900 focus:ring-red-500' 
            : 'border-gray-300 dark:border-neutral-700 focus:ring-brand'
        ]"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-if="showNairaValue" class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
      {{ formatForDisplay(input) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
  input: {
    type: Number as () => number | null, // Allow null
    default: null
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '0.00'
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  showNairaValue: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:input']);

const rawInput = ref('');

const currencySymbol = computed(() => {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: props.currency,
    });
    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : props.currency;
  } catch (e) {
    return props.currency;
  }
});

const formattedValue = computed(() => {
  if (rawInput.value !== '') {
    return rawInput.value;
  }
  // Handle null or 0
  return props.input === null || props.input === 0 ? '' : (props.input / 100).toFixed(2);
});

const formatForDisplay = (cents: number | null) => {
  if (cents === null || cents === 0) return ''; // Don't show "₦0.00" if null or 0
  try {
    const value = cents / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: props.currency,
    }).format(value);
  } catch (e) {
    return `${(cents / 100).toFixed(2)} ${props.currency}`;
  }
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  rawInput.value = target.value;
  
  const cleanedValue = target.value.replace(/[^0-9.]/g, '');
  const nairaValue = parseFloat(cleanedValue);
  
  // --- THE FIX ---
  // Emit null if empty/invalid/zero, otherwise emit cents
  if (isNaN(nairaValue) || nairaValue <= 0) {
    emit('update:input', null);
  } else {
    emit('update:input', Math.round(nairaValue * 100));
  }
};

const handleBlur = () => {
  // Format correctly on blur
  rawInput.value = props.input === null || props.input === 0 ? '' : (props.input / 100).toFixed(2);
};
</script>