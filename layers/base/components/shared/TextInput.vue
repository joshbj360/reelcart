<template>
    <div>
        <client-only>
            <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300">{{ label }}</label>
            <input 
                 :maxlength="max"
                class="
                    w-full
                    bg-white dark:bg-neutral-800
                    text-gray-900 dark:text-neutral-100
                    border
                    text-sm
                    rounded-lg
                    p-3
                    placeholder-gray-500 dark:placeholder-neutral-400
                    focus:outline-none
                    focus:ring-2
                " 
                :class="
                    error 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-neutral-700 focus:ring-brand'
                "
                :type="inputType"
                v-model="inputComputed"
                autocomplete="off"
                :placeholder="placeholder"
            >
        </client-only>
        <span v-if="error" class="text-brand dark:text-brand-light text-[14px] font-semibold">
             {{ error }}
        </span>
    </div>
                    
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from 'vue';

const emit = defineEmits(['update:input'])
const props = defineProps(['input', 'label', 'max', 'inputType', 'error', 'placeholder'])
const { input, label, max, inputType, error, placeholder } = toRefs(props)

const inputComputed = computed({
    get: () => input?.value,
    set: (val) => emit('update:input', val)
})
</script>