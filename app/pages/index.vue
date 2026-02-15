<template>
    <HomeLayout>
        <div class="max-w-xl mx-auto space-y-8">
            <!-- Loading Skeleton (Initial Load) -->
            <HomepageSkeleton v-if="pending && !mainFeed.length" />
            
            <!-- Error State -->
            <div v-else-if="error" class="text-center py-20">
                <p class="text-red-600 dark:text-red-400 mb-2">Failed to load feed</p>
                <button 
                    @click="refresh()"
                    class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#d81b36] transition-colors"
                >
                    Retry
                </button>
            </div>
            
            <!-- Content -->
            <div v-else>
                <!-- Stories Section -->
                <section v-if=" 0 || profileStore.isLoggedIn">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
                        Today's Inspo
                    </h2>
                    <div class="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        <!-- Add Story Button (Logged In Users) -->
                        <div v-if="profileStore.isLoggedIn" class="flex flex-col items-center space-y-2 min-w-[80px]">
                            <div 
                                @click="showUploadModal = true"
                                class="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors border-2 border-dashed border-gray-300 dark:border-neutral-600"
                            >
                                <Icon name="mdi:plus-thick" class="w-8 h-8 text-gray-500 dark:text-neutral-400" />
                            </div>
                            <span class="text-xs text-gray-600 dark:text-neutral-400">Your Story</span>
                        </div>

                        <!-- Login Prompt (Non-logged In) -->
                        <div v-else class="flex flex-col items-center space-y-2 min-w-[80px]">
                            <NuxtLink 
                                to="/auth/login"
                                class="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors border-2 border-dashed border-gray-300 dark:border-neutral-600"
                            >
                                <Icon name="mdi:login" class="w-8 h-8 text-gray-500 dark:text-neutral-400" />
                            </NuxtLink>
                            <span class="text-xs text-gray-600 dark:text-neutral-400">Log in to post</span>
                        </div>

                        <!-- Stories -->
                        <div 
                            v-for="story in stories" 
                            :key="story.id" 
                            @click="router.push(`/stories/${story.id}`)"
                            class="flex flex-col items-center space-y-2 min-w-[80px] cursor-pointer group"
                        >
                            <div class="relative">
                                <img 
                                    :src="getMediaThumbnailUrl(story.media)" 
                                    alt="Story"
                                    class="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-neutral-700 group-hover:ring-[#f02c56] transition-all" 
                                />
                            </div>
                            <span class="text-xs text-center text-gray-600 dark:text-neutral-400 truncate w-20">
                                {{ story.author?.username || 'A user' }}
                            </span>
                        </div>
                    </div>
                </section>

                <!-- Main Feed -->
                <section class="space-y-6">
                    <template v-for="item in mainFeed" :key="item.id">
                        <!-- Product Card (Type A) -->
                        <ProductCard 
                            v-if="item.type === 'PRODUCT' && item.product" 
                            :product="item.product"
                            @open-comments="openCommentsModal"
                            @open-details="openProductModal"
                        />
                        
                        <!-- Social Post Card (Types B, C, D, E) -->
                        <PostCard 
                            v-else-if="item.type === 'POST'" 
                            :post="item"
                            @open-comments="openPostCommentsModal"
                            @open-details="openPostModal"
                        />
                    </template>
                </section>

                <!-- Infinite Scroll Trigger -->
                <div ref="loadMoreTrigger" class="h-10"></div>
                
                <!-- Loading More Indicator -->
                <div v-if="feedStore.isLoading && mainFeed.length > 0" class="flex justify-center py-8">
                    <Icon name="eos-icons:loading" size="32" class="text-brand" />
                </div>
            </div>
        </div>

        <!-- Right Sidebar -->
        <template #right-sidebar>
            <RightSideNav 
               

            />
        </template>

        <!-- Modals -->
        <ProductCommentModal 
            :is-open="!!commentProduct" 
            :product="commentProduct" 
            @close="commentProduct = null" 
        />

        <PostCommentModal 
            :is-open="!!commentPost" 
            :post="commentPost" 
            @close="commentPost = null" 
        />

        <ProductDetailModal 
            :product="selectedProduct" 
            @close="selectedProduct = null" 
        />
        
        <PostDetailModal 
            :post="selectedPost" 
            @close="selectedPost = null" 
        />
        
        <StoryUploadModal 
            :is-open="showUploadModal" 
            @close="showUploadModal = false" 
            @posted="handleStoryPosted" 
        />
    </HomeLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import { useFeedStore } from '../../layers/feed/app/stores/feed.stores';
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store';


// Layouts & Components
import HomeLayout from '~/layouts/HomeLayout.vue';
import HomepageSkeleton from '~/components/home/HomePageSkeleton.vue';

import PostCard from '../../layers/post/app/components/PostCard.vue'
import RightSideNav from '~/layouts/children/RightSideNav.vue';
import { useFeedApi } from '../../layers/feed/app/services/feed.api';
import { getMediaThumbnailUrl } from '../../layers/base/app/utils/formatters';
import type { IFeedItem } from '../../layers/feed/app/types/feed.types';
import type { IProduct } from '../../layers/post/app/types/post.types';

// Stores & Services
const router = useRouter();
const feedStore = useFeedStore();
const profileStore = useProfileStore();

const feedApi = useFeedApi();

// Modal States
const commentProduct = ref<IProduct | null>(null);
const commentPost = ref<IFeedItem | null>(null);
const selectedProduct = ref<IProduct | null>(null);
const selectedPost = ref<IFeedItem | null>(null);
const showUploadModal = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);
//const observer = ref<IntersectionObserver | null>(null);

// 1. Fetch layout data (top sellers, categories)
//const { data: layoutData } = useLayoutData();
//const topSellers = computed(() => layoutData.value?.topSellers || []);

// 2. Fetch page-specific data with useLazyAsyncData
const { data: pageData, pending, error, refresh } = await useLazyAsyncData(
    'homepage-main', 
    async () => {
        try {
            // Fetch all data in parallel
            const [feedResponse, storiesData] = await Promise.all([
                feedApi.getHomeFeed({ limit: 20 }),
                // TODO: Add stories API
                Promise.resolve([]), // Placeholder for stories
                //categoryStore.fetchCategories()
            ]);

            // Populate feed store
            if (feedResponse && feedResponse.items) {
                feedStore.setInitialFeed(
                    feedResponse.items, 
                    feedResponse.meta,
                    'main'
                );
            }

            // Populate story store
            // if (storiesData && storiesData.length > 0) {
            //     //storyStore.setHomepageStories(storiesData);
            // }

            return {
                feedLoaded: true,
                //storiesCount: storiesData?.length || 0,
                //categoriesCount: categoryStore.categories?.length || 0
            };
        } catch (error: any) {
            console.error('Failed to fetch homepage data:', error);
            throw error;
        }
    },
    {
        // Options for useLazyAsyncData
        server: true,      // Fetch on server-side
        lazy: true,        // Non-blocking
        default: () => ({
            feedLoaded: false,
            // storiesCount: 0,
            // categoriesCount: 0
        })
    }
);

// 3. Use computed properties for reactive data
const stories = ref<any[]>([])
const mainFeed = computed(() => feedStore.mainFeed || []);
//const categories = computed(() => categoryStore.categories || []);

// 4. Infinite scroll setup
const loadMore = async () => {
    if (!feedStore.canLoadMore || feedStore.isLoading) return;
    
    try {
        const response = await feedApi.getHomeFeed({
            limit: 20,
            offset: feedStore.currentOffset
        });
        
        if (response && response.items) {
            feedStore.appendToFeed(response.items, response.meta, 'main');
        }
    } catch (error) {
        console.error('Failed to load more feed items:', error);
    }
};

// onMounted(() => {
//     // Setup intersection observer for infinite scroll
//     observer.value = new IntersectionObserver(
//         (entries) => {
//             if (entries[0]?.isIntersecting) {
//                 loadMore();
//             }
//         },
//         { rootMargin: '200px' }
//     );

//     if (loadMoreTrigger.value) {
//         observer.value.observe(loadMoreTrigger.value);
//     }
// });

// onUnmounted(() => {
//     if (observer.value) {
//         observer.value.disconnect();
//     }
// });

// Modal Handlers
const openCommentsModal = (product: IProduct) => {
    commentProduct.value = product;
};

const openPostCommentsModal = (post: IFeedItem) => {
    commentPost.value = post;
};

const openProductModal = (product: IProduct) => {
    selectedProduct.value = product;
};

const openPostModal = (post: IFeedItem) => {
    selectedPost.value = post;
};

const handleStoryPosted = async () => {
    showUploadModal.value = false;
    
    // Refresh all data
    await Promise.all([
        refreshNuxtData('layout-data'),
        refreshNuxtData('homepage-main'),
    ]);
};
</script>

<style scoped>
.scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>