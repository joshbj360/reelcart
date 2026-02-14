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
        <div v-else-if="savedPosts.length === 0" class="text-center py-20">
            <Icon 
                name="mdi:bookmark-outline" 
                size="64" 
                class="text-gray-300 dark:text-neutral-700 mx-auto mb-4" 
            />
            <p class="text-gray-500 dark:text-neutral-400">
                No saved posts yet
            </p>
            <p class="text-sm text-gray-400 dark:text-neutral-500 mt-2">
                Bookmark posts to save them for later
            </p>
        </div>

        <!-- Saved Posts Grid -->
        <div v-else>
            <div class="grid grid-cols-3 gap-1">
                <button
                    v-for="post in savedPosts"
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

                    <!-- Saved Badge -->
                    <div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
                        <Icon name="mdi:bookmark" size="16" class="text-white" />
                    </div>

                    <!-- Remove from Saved (on hover) -->
                    <button
                        @click.stop="unsavePost(post.id)"
                        class="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Icon name="mdi:bookmark-remove" size="16" />
                    </button>
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
import { ref, computed, onMounted } from 'vue'
import { usePost } from '~~/layers/post/app/composables/usePost'
import { usePostStore } from '~~/layers/post/app/store/post.store'

const postStore = usePostStore()
const { fetchSavedPosts, unsavePost, isLoading } = usePost()

const posts = computed(() => postStore.mySavedPosts)
const selectedPost = ref(null)
const hasMore = ref(false)
const offset = ref(0)
const limit = 9

onMounted(async () => {
    if (posts.value.length === 0) await handleFetch()
})

async function handleFetch() {
    const result = await fetchSavedPosts(limit, offset.value)
    hasMore.value = result.meta.hasMore
}

const loadMore = async () => {
    offset.value += limit
    await handleFetch()
}

const handleUnsave = async (id: string) => {
    await unsavePost(id)
    postStore.removeSavedPost(id)
}

const openPost = (post: any) => selectedPost.value = post
const formatNumber = (n: number) => n >= 1000 ? (n/1000).toFixed(1) + 'k' : n
</script>