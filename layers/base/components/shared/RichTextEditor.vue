<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-neutral-300">
      {{ label }}
      <span v-if="required" class="text-brand">*</span>
    </label>
     
    <div class="border border-gray-300 dark:border-neutral-700 rounded-lg overflow-hidden">
      
      <!-- Toolbar -->
      <div v-if="editor" class="flex flex-wrap items-center gap-1 border-b border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 p-2">
        
        <!-- Mark Buttons (Bold, Italic, Strike) -->
        <button
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="['toolbar-button', { 'active': editor.isActive('bold') }]"
          title="Bold"
        >
          <Icon name="mdi:format-bold" class="w-5 h-5" />
        </button>

        <button
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="['toolbar-button', { 'active': editor.isActive('italic') }]"
          title="Italic"
        >
          <Icon name="mdi:format-italic" class="w-5 h-5" />
        </button>

        <button
          type="button"
          @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="['toolbar-button', { 'active': editor.isActive('strike') }]"
          title="Strike"
        >
          <Icon name="mdi:format-strikethrough-variant" class="w-5 h-5" />
        </button>
        
        <!-- Divider -->
        <div class="w-px h-6 bg-gray-300 dark:bg-neutral-700 mx-1"></div>

        <!-- Heading Buttons (Customized to H3 only) -->
        <button
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="['toolbar-button', { 'active': editor.isActive('heading', { level: 3 }) }]"
          title="Heading 3"
        >
          <Icon name="mdi:format-header-3" class="w-5 h-5" />
        </button>
        
        <!-- List Buttons (Bullet, Ordered) -->
        <button
          type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="['toolbar-button', { 'active': editor.isActive('bulletList') }]"
          title="Bullet List"
        >
          <Icon name="mdi:format-list-bulleted" class="w-5 h-5" />
        </button>

        <button
          type="button"
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="['toolbar-button', { 'active': editor.isActive('orderedList') }]"
          title="Ordered List"
        >
          <Icon name="mdi:format-list-numbered" class="w-5 h-5" />
        </button>

        <!-- Blockquote -->
        <button
          type="button"
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="['toolbar-button', { 'active': editor.isActive('blockquote') }]"
          title="Blockquote"
        >
          <Icon name="mdi:format-quote-open" class="w-5 h-5" />
        </button>
        
        <!-- Divider -->
        <div class="w-px h-6 bg-gray-300 dark:bg-neutral-700 mx-1"></div>

        <!-- Utility Buttons (Undo, Redo) -->
        <button
          type="button"
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().chain().focus().undo().run()"
          class="toolbar-button"
          title="Undo"
        >
          <Icon name="mdi:undo" class="w-5 h-5" />
        </button>
        <button
          type="button"
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().chain().focus().redo().run()"
          class="toolbar-button"
          title="Redo"
        >
          <Icon name="mdi:redo" class="w-5 h-5" />
        </button>

      </div>
      
      <!-- Editor Content -->
      <EditorContent
        v-if="editor"
        :editor="editor"
        class="min-h-[150px] p-3 focus:outline-none bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100"
        :class="{ 'border-red-300': error }"
      />
      <div v-else class="min-h-[150px] p-3 text-gray-400 dark:text-neutral-500">
        Loading editor...
      </div>
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading'; 
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
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
  }
});

const emit = defineEmits(['update:modelValue']);

// Tiptap and UI State
const editor = ref<Editor>();

// Initialize editor safely
onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
        // FIX: Configure StarterKit overrides
        StarterKit.configure({
            heading: false, // Override the default H1-H6 functionality
        }),
        // Register necessary overrides
        Heading.configure({ levels: [3] }), // Only allow H3 for product description
    ],
    editorProps: {
      attributes: {
        'data-placeholder': 'Write your product description...',
      },
    },
    onUpdate: () => {
      emit('update:modelValue', editor.value?.getHTML() || '');
    },
  });
});

// Cleanup editor safely
onBeforeUnmount(() => {
  editor.value?.destroy();
});

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue;
  if (!isSame) {
    editor.value?.commands.setContent(newValue, { emitUpdate: false });
  }
});
</script>

<style>
/* THE FIX: These global styles are now theme-aware */
.ProseMirror {
  min-height: 150px;
  outline: none;
  /* Add default text color for consistency */
  color: #1f2937; /* dark text */
}

/* Light mode placeholder */
html:not(.dark) .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af; /* gray-400 */
  pointer-events: none;
  height: 0;
}

/* Dark mode placeholder */
.dark .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #737373; /* neutral-500 */
  pointer-events: none;
  height: 0;
}

/* NEW: Scoped Styles for Toolbar Buttons */
.toolbar-button {
    @apply p-1 rounded transition-colors text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700;
}

.toolbar-button.active {
    @apply bg-brand/20 dark:bg-brand/50 text-brand-dark dark:text-white;
}
</style>