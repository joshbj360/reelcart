<template>
    <div class="bg-white dark:bg-neutral-950 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-neutral-800 w-full mx-auto transition-shadow hover:shadow-md">
        <!-- Author Header -->
        <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-3 min-w-0">
                <NuxtLink :to="`/profile/${post.author?.username}`" class="shrink-0">
                    <img 
                        :src="post.author?.avatar || formatAvatarUrl(post.author?.username)" 
                        class="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-neutral-700"
                    />
                </NuxtLink>
                <div class="min-w-0 flex flex-col">
                    <div class="flex items-center gap-2">
                        <NuxtLink :to="`/profile/${post.author?.username}`" class="font-semibold text-sm text-gray-900 dark:text-neutral-100 truncate hover:underline">
                            {{ post.author?.username }}
                        </NuxtLink>
                        
                        <!-- Follow Button -->
                        <template v-if="profileStore.userId && profileStore.userId !== post.author.id">
                            <span class="text-neutral-300 dark:text-neutral-600">•</span>
                            <FollowButton :user-id="post.author.id" :username="post.author?.username" />
                        </template>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-neutral-400">{{ timeAgo(post?.created_at) }}</div>
                </div>
            </div>
            
            <!-- Content Type Badge -->
            <div class="shrink-0">
                <span 
                    class="text-[10px] font-medium px-2 py-1 rounded"
                    :class="contentTypeBadgeClass"
                >
                    {{ contentTypeLabel }}
                </span>
            </div>
        </div>

        <!-- Post Media -->
        <div v-if="post.media" class="relative w-full cursor-pointer group media-container" @click="$emit('open-details', post)">
            <div class="media-wrapper">
                <video
                    v-if="post.media && post.contentType?.includes('video')"
                    ref="videoRef"
                    :src="post.media.url"
                    class="media-content"
                    muted
                    loop
                    playsinline
                ></video>
                <img 
                    v-else-if="post.content"
                    :src="post.media.url" 
                    class="media-content" 
                    :alt="post.caption || 'Post'"
                />
            </div>
        </div>

        <!-- Actions & Info -->
        <div class="px-4 py-3">
            <!-- Action Buttons -->
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-5">
                    <!-- Like -->
                    <button @click.stop="handleLike" class="group flex items-center gap-1.5 focus:outline-none">
                        <Icon 
                            :name="isLiked ? 'mdi:heart' : 'mdi:heart-outline'" 
                            size="26" 
                            class="transition-transform group-active:scale-75"
                            :class="isLiked ? 'text-brand' : 'text-gray-900 dark:text-neutral-100 hover:text-gray-600 dark:hover:text-neutral-300'" 
                        />
                        <span class="text-sm font-medium text-gray-900 dark:text-neutral-100">{{ likeCountFormatted }}</span>
                    </button>
                    
                    <!-- Comment -->
                    <button @click.stop="$emit('open-comments', post)" class="group flex items-center gap-1.5 focus:outline-none">
                        <Icon name="mdi:chat-outline" size="26" class="text-gray-900 dark:text-neutral-100 hover:text-gray-600 dark:hover:text-neutral-300 transition-transform group-active:scale-75" />
                        <span class="text-sm font-medium text-gray-900 dark:text-neutral-100">{{ commentCountFormatted }}</span>
                    </button>
                    
                    <!-- Share -->
                    <button @click.stop="sharePost" class="group focus:outline-none">
                        <Icon name="mdi:share-variant-outline" size="26" class="text-gray-900 dark:text-neutral-100 hover:text-gray-600 dark:hover:text-neutral-300 transition-transform group-active:scale-75" />
                    </button>
                </div>
                
                <!-- Bookmark -->
                <button class="group focus:outline-none">
                    <Icon name="mdi:bookmark-outline" size="26" class="text-gray-900 dark:text-neutral-100 hover:text-gray-600 dark:hover:text-neutral-300" />
                </button>
            </div>

            <!-- Caption with Hashtags -->
            <div class="mb-3 space-y-2">
                <p class="text-sm text-gray-900 dark:text-neutral-100">
                    <span class="font-semibold mr-1">{{ post.author?.username }}</span>
                    <span class="text-gray-800 dark:text-neutral-200">{{ cleanCaption }}</span>
                </p>
                
                <!-- Hashtags -->
                <div v-if="hashtags.length > 0" class="flex flex-wrap gap-1.5">
                    <span 
                        v-for="(tag, index) in hashtags" 
                        :key="index"
                        class="text-xs text-brand dark:text-pink-400 font-medium hover:underline cursor-pointer"
                    >
                        {{ tag }}
                    </span>
                </div>
            </div>

            <!-- Tagged Products Display (Based on Content Type) -->
            <TaggedProductsDisplay 
                v-if="hasTaggedProducts"
                :products="taggedProducts"
                :content-type="post.contentType"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

import { usePostStore } from '../store/post.store';

//import { formatAvatarUrl } from '../utils/formatters';
import { notify } from '@kyvg/vue3-notification';
import FollowButton from '~~/layers/profile/app/components/FollowButton.vue';
import TaggedProductsDisplay from './TaggedProductsDisplay.vue';
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types';
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store';

const props = defineProps<{ post: IFeedItem }>();
const emit = defineEmits(['open-comments', 'open-details']);

const profileStore = useProfileStore();
const postStore = usePostStore();
const videoRef = ref<HTMLVideoElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const isLiked = computed(() => postStore.likedPostIds?.has(props.post.id) || false);

const likeCountFormatted = computed(() => {
    const baseLikes = props.post.likeCount || 0;
    return isLiked.value ? baseLikes + 1 : baseLikes;
});

const commentCountFormatted = computed(() => props.post.commentCount|| 0);

const contentTypeLabel = computed(() => {
    const types: Record<string, string> = {
        'EXPERIENCE': 'Review',
        'INSPIRATION': 'Style',
        'EDUCATIONAL': 'Tutorial',
        'ENTERTAINMENT': 'Fun'
    };
    return types[props.post.contentType] || 'Post';
});

const contentTypeBadgeClass = computed(() => {
    const classes: Record<string, string> = {
        'EXPERIENCE': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'INSPIRATION': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        'EDUCATIONAL': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'ENTERTAINMENT': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return classes[props.post.contentType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
});

const cleanCaption = computed(() => {
    if (!props.post.caption) return '';
    const captionWithoutHashtags = props.post.caption.replace(/#\w+/g, '').trim();
    
    if (typeof document !== 'undefined') {
        const temp = document.createElement('div');
        temp.innerHTML = captionWithoutHashtags;
        const text = temp.textContent || temp.innerText || '';
        return text.replace(/\s+/g, ' ').trim();
    } else {
        const text = captionWithoutHashtags.replace(/<[^>]*>/g, '');
        return text.replace(/\s+/g, ' ').trim();
    }
});

const hashtags = computed(() => {
    if (!props.post.caption) return [];
    const matches = props.post.caption.match(/#\w+/g);
    return matches || [];
});

const hasTaggedProducts = computed(() => {
    // Check if post has tagged products (you'll need to add this to your IPost type)
    return false; // Update based on your data structure
});

const taggedProducts = computed(() => {
    // Return tagged products from post
    return []; // Update based on your data structure
});

const handleLike = async () => {
    if (!profileStore.userId) {
        notify({ type: 'warn', text: 'Please log in to like posts' });
        return;
    }
    // Toggle like using your composable
    // await usePost().likePost(props.post.id);
};

const sharePost = async () => {
    const shareUrl = `${window.location.origin}/post/${props.post.id}`;
    try {
        if (navigator.share) {
            await navigator.share({ url: shareUrl, title: props.post.caption || 'Check out this post' });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            notify({ type: 'success', text: 'Link copied!' });
        }
    } catch {}
};

const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'JUST NOW';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
};

// Video autoplay on scroll
onMounted(() => {
    if (videoRef.value) {
        observer.value = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.value?.play().catch(() => {});
                } else {
                    videoRef.value?.pause();
                }
            },
            { threshold: 0.5 }
        );
        observer.value.observe(videoRef.value);
    }
});

onUnmounted(() => {
    if (observer.value) observer.value.disconnect();
});
</script>

<style scoped>
.media-container {
    width: 100%;
    aspect-ratio: 4 / 5;
    background-color: #f3f4f6;
    overflow: hidden;
    position: relative;
}

.dark .media-container {
    background-color: #171717;
}

.media-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.media-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}
</style>