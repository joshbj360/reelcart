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
        <div v-else-if="posts.length === 0" class="text-center py-20">
            <Icon 
                name="mdi:camera-off" 
                size="64" 
                class="text-gray-300 dark:text-neutral-700 mx-auto mb-4" 
            />
            <p class="text-gray-500 dark:text-neutral-400 mb-4">
                {{ isOwnProfile ? 'No posts yet. Share your first moment!' : 'No posts yet' }}
            </p>
            <button 
                v-if="isOwnProfile"
                @click="createPost"
                class="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-[#d81b36] transition-colors"
            >
                <Icon name="mdi:plus" size="20" class="inline mr-1" />
                Create Post
            </button>
        </div>

        <!-- Posts Grid -->
        <div v-else>
            <div class="grid grid-cols-3 gap-1">
                <button
                    v-for="post in posts"
                    :key="post.id"
                    @click="openPost(post)"
                    class="aspect-square relative group overflow-hidden rounded"
                >
                    <!-- Post Image/Video -->
                    <img 
                        v-if="post.media?.[0]?.type === 'IMAGE'"
                        :src="post.media[0].url"
                        :alt="post.caption || 'Post Image'"
                        class="w-full h-full object-cover"
                    />
                    <video 
                        v-else-if="post.media?.[0]?.type === 'VIDEO'"
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

                    <!-- Multiple Media Indicator -->
                    <div 
                        v-if="post.media && post.media.length > 1"
                        class="absolute top-2 right-2"
                    >
                        <Icon name="mdi:layers" size="20" class="text-white drop-shadow-lg" />
                    </div>

                    <!-- Video Indicator -->
                    <div 
                        v-if="post.media?.[0]?.type === 'VIDEO'"
                        class="absolute top-2 left-2"
                    >
                        <Icon name="mdi:play-circle" size="20" class="text-white drop-shadow-lg" />
                    </div>
                </button>
            </div>

            <!-- Load More -->
            <div v-if="hasMore" class="text-center mt-6">
                <button 
                    @click="loadMore"
                    :disabled="isLoading"
                    class="px-6 py-2 text-brand font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
                >
                    {{ isLoading ? 'Loading...' : 'Load More' }}
                </button>
            </div>
        </div>

        <!-- Post Detail Modal -->
        <PostDetailModal 
            v-if="selectedPost"
            :post="selectedPost"
            @close="selectedPost = null"
            @deleted="onPostDeleted($event)"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePostStore } from '~~/layers/post/app/store/post.store';


const props = defineProps<{
    username: string
    isOwnProfile: boolean
}>()

const postStore = usePostStore()
const { fetchUserPosts, isLoading } = usePost() // Updated composable method

const selectedPost = ref(null)
const hasMore = ref(false)
const offset = ref(0)
const limit = 9

// Reactive list filtered by username from the store's Map
const posts = computed(() => postStore.getPostsByUsername(props.username))

onMounted(async () => {
    // Only fetch if we don't have posts for this user yet
    if (posts.value.length === 0) {
        await handleFetch()
    }
})

async function handleFetch() {
    const result = await fetchUserPosts(props.username, limit, offset.value)
    hasMore.value = result.meta.hasMore
}

const loadMore = async () => {
    offset.value += limit
    await handleFetch()
}

const openPost = (post: any) => {
    selectedPost.value = post
}

const createPost = () => {
    // Emit event to open create post modal
    // Or navigate to create post page
    navigateTo('/create/post')
}

const onPostDeleted = (postId: string) => {
    postStore.deletePost(postId, props.username)
    selectedPost.value = null
}

const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
}
</script>