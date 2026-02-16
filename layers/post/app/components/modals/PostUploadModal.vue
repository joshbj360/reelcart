<template>
    <Teleport to="body">
        <Transition name="modal">
            <div 
                v-if="isOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                @click.self="handleClose"
            >
                <div class="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
                        <button 
                            @click="handleClose"
                            class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                        >
                            <Icon name="mdi:arrow-left" size="24" class="text-gray-900 dark:text-neutral-100" />
                        </button>
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">Create Post</h2>
                        <button 
                            @click="handlePost"
                            :disabled="!canPost || isPosting"
                            class="px-4 py-2 bg-brand text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d81b36] transition-colors"
                        >
                            {{ isPosting ? 'Posting...' : 'Share' }}
                        </button>
                    </div>

                    <!-- Content -->
                    <div class="overflow-y-auto max-h-[calc(90vh-120px)]">
                        <!-- Author Info -->
                        <div class="flex items-center gap-3 p-4">
                            <img 
                                :src="profileStore?.me.avatar ? profileStore.me.avatar : ``"
                                class="w-10 h-10 rounded-full object-cover"
                                alt="Your avatar"
                            />
                            <div>
                                <p class="font-semibold text-gray-900 dark:text-neutral-100">
                                    {{ profileStore?.me.username }}
                                </p>
                                <button 
                                    @click="showContentTypeSelector = true"
                                    class="flex items-center gap-1 text-sm text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
                                >
                                    <Icon name="mdi:label-outline" size="16" />
                                    {{ contentTypeLabel }}
                                    <Icon name="mdi:chevron-down" size="16" />
                                </button>
                            </div>
                        </div>

                        <!-- Caption Input -->
                        <div class="px-4 pb-4">
                            <textarea
                                v-model="caption"
                                placeholder="What's on your mind?"
                                class="w-full min-h-[120px] p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                                @input="extractHashtags"
                            ></textarea>
                            
                            <!-- Hashtags Preview -->
                            <div v-if="hashtags.length > 0" class="flex flex-wrap gap-2 mt-2">
                                <span 
                                    v-for="tag in hashtags" 
                                    :key="tag"
                                    class="text-sm text-brand font-medium"
                                >
                                    #{{ tag }}
                                </span>
                            </div>
                        </div>

                        <!-- Media Upload Area -->
                        <div class="px-4 pb-4">
                            <!-- Upload Button (when no media) -->
                            <div 
                                v-if="!mediaPreview"
                                class="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:border-brand hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                @click="triggerFileInput"
                                @dragover.prevent="isDragging = true"
                                @dragleave.prevent="isDragging = false"
                                @drop.prevent="handleDrop"
                            >
                                <Icon name="mdi:image-plus-outline" size="48" class="mx-auto mb-2 text-gray-400 dark:text-neutral-500" />
                                <p class="text-gray-600 dark:text-neutral-400 mb-1">
                                    Click to upload or drag and drop
                                </p>
                                <p class="text-sm text-gray-500 dark:text-neutral-500">
                                    Photos or videos (max 50MB)
                                </p>
                            </div>

                            <!-- Media Preview -->
                            <div v-else class="relative rounded-xl overflow-hidden bg-black">
                                <!-- Image Preview -->
                                <img 
                                    v-if="mediaType === 'image'"
                                    :src="mediaPreview"
                                    class="w-full max-h-[400px] object-contain"
                                    alt="Preview"
                                />

                                <!-- Video Preview -->
                                <video 
                                    v-else
                                    :src="mediaPreview"
                                    controls
                                    class="w-full max-h-[400px]"
                                ></video>

                                <!-- Remove Button -->
                                <button 
                                    @click="removeMedia"
                                    class="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                                >
                                    <Icon name="mdi:close" size="20" class="text-white" />
                                </button>
                            </div>

                            <!-- Hidden File Input -->
                            <input 
                                ref="fileInput"
                                type="file"
                                accept="image/*,video/*"
                                class="hidden"
                                @change="handleFileSelect"
                            />
                        </div>

                        <!-- Product Tagging (if applicable) -->
                        <div v-if="showProductTagging" class="px-4 pb-4">
                            <button 
                                @click="showProductSelector = true"
                                class="flex items-center gap-2 text-brand hover:text-[#d81b36] font-medium"
                            >
                                <Icon name="mdi:tag-outline" size="20" />
                                Tag Products
                                <span v-if="taggedProducts.length > 0" class="text-sm text-gray-600 dark:text-neutral-400">
                                    ({{ taggedProducts.length }} tagged)
                                </span>
                            </button>

                            <!-- Tagged Products Preview -->
                            <div v-if="taggedProducts.length > 0" class="flex flex-wrap gap-2 mt-2">
                                <div 
                                    v-for="product in taggedProducts" 
                                    :key="product.id"
                                    class="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full"
                                >
                                    <span class="text-sm text-gray-900 dark:text-neutral-100">
                                        {{ product.name }}
                                    </span>
                                    <button @click="removeProduct(product.id)">
                                        <Icon name="mdi:close-circle" size="16" class="text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Options -->
                        <div class="px-4 pb-4 space-y-2">
                            <button 
                                @click="showAdvancedOptions = !showAdvancedOptions"
                                class="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <div class="flex items-center gap-2">
                                    <Icon name="mdi:tune" size="20" class="text-gray-600 dark:text-neutral-400" />
                                    <span class="text-gray-900 dark:text-neutral-100">Advanced Options</span>
                                </div>
                                <Icon 
                                    name="mdi:chevron-down" 
                                    size="20" 
                                    class="text-gray-600 dark:text-neutral-400 transition-transform"
                                    :class="{ 'rotate-180': showAdvancedOptions }"
                                />
                            </button>

                            <!-- Advanced Options Panel -->
                            <Transition name="expand">
                                <div v-if="showAdvancedOptions" class="space-y-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                    <!-- Visibility -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                                            Who can see this?
                                        </label>
                                        <select 
                                            v-model="visibility"
                                            class="w-full p-2 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand"
                                        >
                                            <option value="PUBLIC">Everyone</option>
                                            <option value="FOLLOWERS">Followers only</option>
                                            <option value="PRIVATE">Only me</option>
                                        </select>
                                    </div>

                                    <!-- Disable Comments -->
                                    <label class="flex items-center justify-between cursor-pointer">
                                        <span class="text-sm text-gray-700 dark:text-neutral-300">
                                            Allow comments
                                        </span>
                                        <input 
                                            v-model="allowComments"
                                            type="checkbox"
                                            class="w-5 h-5 text-brand rounded focus:ring-brand"
                                        />
                                    </label>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </div>

                <!-- Content Type Selector Modal -->
                <ContentTypeSelector 
                    v-if="showContentTypeSelector"
                    :current="contentType"
                    @select="handleContentTypeSelect"
                    @close="showContentTypeSelector = false"
                />

                <!-- Product Selector Modal -->
                <ProductSelector 
                    v-if="showProductSelector"
                    :selected="taggedProducts"
                    @select="handleProductSelect"
                    @close="showProductSelector = false"
                />
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import { usePost } from '../../composables/usePost'
import ContentTypeSelector from './ContentTypeSelector.vue'
import ProductSelector from './ProductSelector.vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store';

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close', 'posted'])

const profileStore = useProfileStore()
const { createPost } = usePost()

// Form state
const caption = ref('')
const contentType = ref<'EXPERIENCE' | 'INSPIRATION' | 'EDUCATIONAL' | 'ENTERTAINMENT'>('EXPERIENCE')
const mediaFile = ref<File | null>(null)
const mediaPreview = ref<string | null>(null)
const mediaType = ref<'image' | 'video' | null>(null)
const hashtags = ref<string[]>([])
const taggedProducts = ref<any[]>([])
const visibility = ref<'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'>('PUBLIC')
const allowComments = ref(true)

// UI state
const isPosting = ref(false)
const isDragging = ref(false)
const showAdvancedOptions = ref(false)
const showContentTypeSelector = ref(false)
const showProductSelector = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Computed
const canPost = computed(() => {
    return (caption.value.trim().length > 0 || mediaFile.value !== null) && !isPosting.value
})

const contentTypeLabel = computed(() => {
    const labels = {
        'EXPERIENCE': 'Experience/Review',
        'INSPIRATION': 'Style Inspiration',
        'EDUCATIONAL': 'Tutorial/Guide',
        'ENTERTAINMENT': 'Fun/Entertainment'
    }
    return labels[contentType.value]
})

const showProductTagging = computed(() => {
    return ['EXPERIENCE', 'INSPIRATION', 'EDUCATIONAL'].includes(contentType.value)
})

// Methods
const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        processFile(file)
    }
}

const handleDrop = (event: DragEvent) => {
    isDragging.value = false
    const file = event.dataTransfer?.files[0]
    if (file) {
        processFile(file)
    }
}

const processFile = (file: File) => {
    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB')
        return
    }

    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please upload an image or video file')
        return
    }

    mediaFile.value = file
    mediaType.value = file.type.startsWith('image/') ? 'image' : 'video'
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
        mediaPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const removeMedia = () => {
    mediaFile.value = null
    mediaPreview.value = null
    mediaType.value = null
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const extractHashtags = () => {
    const matches = caption.value.match(/#[\w]+/g)
    hashtags.value = matches ? matches.map(tag => tag.slice(1)) : []
}

const handleContentTypeSelect = (type: string) => {
    contentType.value = type as any
    showContentTypeSelector.value = false
}

const handleProductSelect = (products: any[]) => {
    taggedProducts.value = products
    showProductSelector.value = false
}

const removeProduct = (productId: string) => {
    taggedProducts.value = taggedProducts.value.filter(p => p.id !== productId)
}

const handlePost = async () => {
    if (!canPost.value) return

    isPosting.value = true

    try {
        // Upload media first if exists
        let mediaUrl = null
        if (mediaFile.value) {
            // TODO: Implement media upload
            //mediaUrl = await uploadMedia(mediaFile.value)
        }

        // Create post
        await createPost({
            caption: caption.value,
            contentType: contentType.value,
            content: mediaUrl,
            contentType: mediaType.value || undefined,
            visibility: visibility.value,
            allowComments: allowComments.value,
            taggedProducts: taggedProducts.value.map(p => p.id)
        })

        // Success
        emit('posted')
        handleClose()
        
        // Reset form
        resetForm()
    } catch (error) {
        console.error('Failed to create post:', error)
        alert('Failed to create post. Please try again.')
    } finally {
        isPosting.value = false
    }
}

const resetForm = () => {
    caption.value = ''
    contentType.value = 'EXPERIENCE'
    removeMedia()
    hashtags.value = []
    taggedProducts.value = []
    visibility.value = 'PUBLIC'
    allowComments.value = true
    showAdvancedOptions.value = false
}

const handleClose = () => {
    if (isPosting.value) return
    
    if (caption.value.trim() || mediaFile.value) {
        if (confirm('Discard post?')) {
            resetForm()
            emit('close')
        }
    } else {
        emit('close')
    }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
    transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
    transform: scale(0.9);
}

.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
    max-height: 500px;
    opacity: 1;
}
</style>