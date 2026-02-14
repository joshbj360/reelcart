<template>
    <div class="p-6">
        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-3 gap-1">
            <div 
                v-for="i in 9" 
                :key="i"
                class="aspect-square bg-gray-200 dark:bg-neutral-800 animate-pulse rounded"
            ></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="taggedPosts.length === 0" class="text-center py-20">
            <Icon 
                name="mdi:account-tag-outline" 
                size="64" 
                class="text-gray-300 dark:text-neutral-700 mx-auto mb-4" 
            />
            <p class="text-gray-500 dark:text-neutral-400">
                No tagged posts yet
            </p>
        </div>

        <!-- Tagged Posts Grid -->
        <div v-else>
            <div class="grid grid-cols-3 gap-1">
                <button
                    v-for="post in taggedPosts"
                    :key="post.id"
                    @click="openPost(post)"
                    class="aspect-square relative group overflow-hidden rounded"
                >
                    <!-- Post Image/Video -->
                    <img 
                        v-if="post.media?.[0]?.type === 'image'"
                        :src="post.media[0].url"
                        :alt="post.caption"
                        class="w-full h-full object-cover"
                    />
                    <video 
                        v-else-if="post.media?.[0]?.type === 'video'"
                        :src="post.media[0].url"
                        class="w-full h-full object-cover"
                        muted
                    ></video>

                    <!-- Overlay on Hover -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <div class="flex items-center gap-1 text-white">
                            <Icon name="mdi:heart" size="24" />
                            <span class="font-semibold">{{ formatNumber(post._count?.likes || 0) }}</span>
                        </div>
                        <div class="flex items-center gap-1 text-white">
                            <Icon name="mdi:comment" size="24" />
                            <span class="font-semibold">{{ formatNumber(post._count?.comments || 0) }}</span>
                        </div>
                    </div>

                    <!-- Tagged Badge -->
                    <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Icon name="mdi:account-tag" size="16" class="text-white" />
                    </div>
                </button>
            </div>

            <!-- Load More -->
            <div v-if="hasMore" class="text-center mt-6">
                <button 
                    @click="loadMore"
                    :disabled="isLoadingMore"
                    class="px-6 py-2 text-brand font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                >
                    {{ isLoadingMore ? 'Loading...' : 'Load More' }}
                </button>
            </div>
        </div>

        <!-- Post Detail Modal -->
        <PostDetailModal 
            v-if="selectedPost"
            :post="selectedPost"
            @close="selectedPost = null"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { IPost } from '../../../../../post/app/types/post.types'
import PostDetailModal from '../../../../../post/app/components/modals/PostDetailModal.vue'

const props = defineProps<{
    username: string
}>()

const taggedPosts = ref<IPost[]>([])
const selectedPost = ref<IPost | null>(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(false)
const page = ref(1)

onMounted(() => {
    fetchTaggedPosts()
})

const fetchTaggedPosts = async () => {
    isLoading.value = true
    try {
        // TODO: Replace with actual API call
        const response = await $fetch(`/api/posts/tagged?username=${props.username}&limit=9`)
        taggedPosts.value = response.items
        hasMore.value = response.meta.hasMore
    } catch (error) {
        console.error('Failed to fetch tagged posts:', error)
    } finally {
        isLoading.value = false
    }
}

const loadMore = async () => {
    isLoadingMore.value = true
    try {
        page.value++
        const response = await $fetch(`/api/posts/tagged?username=${props.username}&limit=9&page=${page.value}`)
        taggedPosts.value.push(...response.items)
        hasMore.value = response.meta.hasMore
    } catch (error) {
        console.error('Failed to load more posts:', error)
    } finally {
        isLoadingMore.value = false
    }
}

const openPost = (post: IPost) => {
    selectedPost.value = post
}

const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
}
</script>