<template>
    <HomeLayout>
        <div class="max-w-5xl mx-auto">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-20">
                <Icon name="eos-icons:loading" size="32" class="text-brand" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-20">
                <p class="text-brand-dark dark:text-brand-light">Post not found</p>
            </div>

            <!-- Post Content -->
            <div v-else-if="post" class="bg-white dark:bg-neutral-950 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
                <div class="md:flex">
                    <!-- Left: Media -->
                    <div class="md:w-3/5 bg-black flex items-center justify-center">
                        <div class="w-full aspect-square">
                            <video
                                v-if="post.content && post.contentType?.includes('video')"
                                :src="post.content"
                                class="w-full h-full object-contain"
                                controls
                            ></video>
                            <img 
                                v-else-if="post.content"
                                :src="post.content" 
                                :alt="post.caption"
                                class="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <!-- Right: Details & Comments -->
                    <div class="md:w-2/5 flex flex-col max-h-[80vh]">
                        <!-- Post Header -->
                        <div class="p-4 border-b border-gray-200 dark:border-neutral-800">
                            <div class="flex items-center gap-3">
                                <NuxtLink :to="`/profile/${post.author?.username}`">
                                    <img 
                                        :src="post.author?.avatar || formatAvatarUrl(post.author?.username)" 
                                        class="w-10 h-10 rounded-full object-cover"
                                    />
                                </NuxtLink>
                                <div class="flex-1">
                                    <NuxtLink :to="`/profile/${post.author?.username}`" class="font-semibold text-gray-900 dark:text-neutral-100 hover:underline">
                                        {{ post.author?.username }}
                                    </NuxtLink>
                                </div>
                                <FollowButton 
                                    v-if="profileStore.userId !== post.authorId"
                                    :user-id="post.authorId" 
                                    :username="post.author?.username || ''"
                                />
                            </div>
                        </div>

                        <!-- Comments Section -->
                        <div class="flex-1 overflow-y-auto p-4 space-y-4">
                            <!-- Caption as first comment -->
                            <div v-if="post.caption" class="flex items-start gap-3">
                                <img 
                                    :src="post.author?.avatar || formatAvatarUrl(post.author?.username)" 
                                    class="w-8 h-8 rounded-full object-cover"
                                />
                                <div class="flex-1">
                                    <p class="text-sm">
                                        <NuxtLink :to="`/profile/${post.author?.username}`" class="font-semibold mr-1">
                                            {{ post.author?.username }}
                                        </NuxtLink>
                                        <span class="text-gray-800 dark:text-neutral-200">{{ post.caption }}</span>
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                                        {{ timeAgo(post.createdAt) }}
                                    </p>
                                </div>
                            </div>

                            <!-- Comments List -->
                            <div v-for="comment in comments" :key="comment.id" class="flex items-start gap-3">
                                <img 
                                    :src="comment.author?.avatar || formatAvatarUrl(comment.author?.username)" 
                                    class="w-8 h-8 rounded-full object-cover"
                                />
                                <div class="flex-1">
                                    <p class="text-sm">
                                        <NuxtLink :to="`/profile/${comment.author?.username}`" class="font-semibold mr-1">
                                            {{ comment.author?.username }}
                                        </NuxtLink>
                                        <span class="text-gray-800 dark:text-neutral-200">{{ comment.text }}</span>
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                                        {{ timeAgo(comment.createdAt) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Actions & Add Comment -->
                        <div class="border-t border-gray-200 dark:border-neutral-800">
                            <!-- Actions -->
                            <div class="flex items-center justify-between p-4">
                                <div class="flex items-center gap-4">
                                    <button @click="handleLike" class="group">
                                        <Icon 
                                            :name="isLiked ? 'mdi:heart' : 'mdi:heart-outline'" 
                                            size="26" 
                                            :class="isLiked ? 'text-brand' : 'text-gray-900 dark:text-neutral-100'"
                                        />
                                    </button>
                                    <button>
                                        <Icon name="mdi:chat-outline" size="26" class="text-gray-900 dark:text-neutral-100" />
                                    </button>
                                    <button @click="sharePost">
                                        <Icon name="mdi:share-variant-outline" size="26" class="text-gray-900 dark:text-neutral-100" />
                                    </button>
                                </div>
                                <button>
                                    <Icon name="mdi:bookmark-outline" size="26" class="text-gray-900 dark:text-neutral-100" />
                                </button>
                            </div>

                            <!-- Likes Count -->
                            <div class="px-4 pb-2">
                                <p class="font-semibold text-sm text-gray-900 dark:text-neutral-100">
                                    {{ likeCount }} {{ likeCount === 1 ? 'like' : 'likes' }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                                    {{ formatDate(post.createdAt) }}
                                </p>
                            </div>

                            <!-- Add Comment -->
                            <form @submit.prevent="addComment" class="p-4 border-t border-gray-200 dark:border-neutral-800">
                                <div class="flex items-center gap-2">
                                    <input 
                                        v-model="commentText"
                                        type="text"
                                        placeholder="Add a comment..."
                                        class="flex-1 bg-transparent text-sm text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none"
                                    />
                                    <button 
                                        type="submit"
                                        :disabled="!commentText.trim()"
                                        class="text-brand font-semibold text-sm disabled:opacity-50"
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePost } from '../../composables/usePost';
import { useComment } from '../../../../posts/app/composables/useComment';
import { useProfileStore } from '../../stores/profile.store';
import { usePostStore } from '../../stores/post.store';
import { formatAvatarUrl } from '~/utils/formatters';
import { notify } from '@kyvg/vue3-notification';
import HomeLayout from '~/layouts/HomeLayout.vue';
import FollowButton from '../../components/FollowButton.vue';

const route = useRoute();
const profileStore = useProfileStore();
const postStore = usePostStore();
const { isLoading, error } = usePost();
const { createComment, fetchPostComments } = useComment();

const postId = computed(() => route.params.id as string);
const post = ref(null);
const comments = ref([]);
const commentText = ref('');

const isLiked = computed(() => postStore.likedPostIds?.has(postId.value) || false);
const likeCount = computed(() => post.value?._count?.likes || 0);

watch(postId, async (id) => {
    if (id) {
        // TODO: Fetch post by ID
        // post.value = await fetchPost(id);
        const result = await fetchPostComments(id);
        comments.value = result.data;
    }
}, { immediate: true });

const handleLike = async () => {
    if (!profileStore.userId) {
        notify({ type: 'warn', text: 'Please log in to like posts' });
        return;
    }
    // TODO: Toggle like
};

const addComment = async () => {
    if (!commentText.value.trim()) return;
    
    try {
        const newComment = await createComment(postId.value, { text: commentText.value });
        comments.value.push(newComment);
        commentText.value = '';
    } catch (error) {
        notify({ type: 'error', text: 'Failed to post comment' });
    }
};

const sharePost = async () => {
    const shareUrl = `${window.location.origin}/post/${postId.value}`;
    try {
        if (navigator.share) {
            await navigator.share({ url: shareUrl });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            notify({ type: 'success', text: 'Link copied!' });
        }
    } catch {}
};

const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
};
</script>