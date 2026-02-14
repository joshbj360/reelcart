<template>
    <!-- Mobile Header -->
    <HeaderNavMobile 
        @open-search="showSearchOverlay = true" 
        @open-notifications="showNotificationOverlay = true" 
    />
    
    <!-- Mobile Category Bar (Optional - only on specific pages) -->
    <CategoryListMobile v-if="showCategoryBar" />

    <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300">
        
        <!-- Left Sidebar (Desktop) -->
        <aside class="hidden md:block w-20 xl:w-72 fixed top-0 left-0 h-full z-20 bg-white border-r border-gray-200 dark:bg-neutral-900 dark:border-neutral-800 scrollbar-hide">
            <SideNav 
                @create="showCreateModal = true" 
                @open-search="showSearchOverlay = true" 
                @open-notifications="showNotificationOverlay = true" 
            />
        </aside>

        <!-- Main Content Area -->
        <main class="md:ml-20 xl:ml-72">
            <div class="flex max-w-[1500px] mx-auto">
                
                <!-- MAIN FEED/CONTENT AREA -->
                <div
                    class="flex-1 min-w-0 h-[100vh] overflow-y-auto scrollbar-hide px-2 sm:px-6 py-6"
                    :class="mainContentClasses"
                >
                    <div class="pb-20 md:pb-0">
                        <!-- Page Content Slot -->
                        <slot />
                    </div>
                </div>

                <!-- RIGHT SIDEBAR (Desktop) -->
                <aside
                    v-if="showRightSidebar"
                    class="hidden lg:block w-[420px] shrink-0 p-4 h-[100vh] overflow-y-auto bg-white border-l border-gray-200 dark:bg-neutral-900 dark:border-neutral-800 scrollbar-hide"
                >
                    <!-- Right Sidebar Slot -->
                    <slot name="right-sidebar">
                        <RightSideNav 

                        />
                    </slot>
                </aside>
            </div>
        </main>
        
        <!-- Bottom Navigation (Mobile) -->
        <BottomNavMobile @create="showCreateModal = true" />

        <!-- Mobile AI Chat Floating Button -->
        <MobileAIChatButton 
            :is-open="showAI" 
            @open="showAI = true" 
            @close="showAI = false" 
        />

        <!-- MODALS -->
        <!-- Create Modal (Main) -->
        <CreateModal 
            :is-open="showCreateModal" 
            @close="showCreateModal = false" 
            @open-post-modal="openPostUploader"
            @open-story-modal="openStoryUploader"
            @open-product-modal="openQuickProductUploader"
        />
        
        <!-- Post Upload Modal -->
        <PostUploadModal 
            :is-open="showPostModal" 
            @close="showPostModal = false" 
            @posted="handlePost" 
        />
        
        <!-- Story Upload Modal -->
        <StoryUploadModal 
            :is-open="showStoryModal" 
            @close="showStoryModal = false" 
            @posted="handlePost" 
        />
        
        <!-- Quick Product Modal -->
        <QuickProductModal
            :is-open="showQuickProductModal"
            @close="showQuickProductModal = false"
            @posted="handlePost"
        />
        
        <!-- Search Overlay -->
        <SearchOverlay 
            :is-open="showSearchOverlay" 
            @close="showSearchOverlay = false" 
        />
        
        <!-- Notification Overlay -->
        <NotificationOverlay 
            :is-open="showNotificationOverlay" 
            @close="showNotificationOverlay = false" 
        />
    </div>
</template>

<script setup lang="ts">
import BottomNavMobile from '~/layouts/children/BottomNavMobile.vue';
import CategoryListMobile from '~/layouts/children/TopMobileCategory.vue';
import SideNav from '~/layouts/children/SideNav.vue';
import HeaderNavMobile from '~/layouts/children/HeaderNavMobile.vue';
import RightSideNav from '~/layouts/children/RightSideNav.vue';
import MobileAIChatButton from '../../layers/AI/chat/MobileAIChat.vue';
import CreateModal from '~/components/home/CreateModal.vue';
import PostUploadModal from '../../layers/post/app/components/modals/PostUploadModal.vue';
// import StoryUploadModal from '~/components/stories/StoryModal.vue';
// import QuickProductModal from '~/components/product/QuickProductModal.vue';
import SearchOverlay from '~/components/search/SearchOverLay.vue';
//import NotificationOverlay from '~/components/notifications/NotificationOverlay.vue';
import { useLayoutData } from '~/composables/useLayoutData';

const route = useRoute();

// Props for layout customization
const props = defineProps<{
    // Layout options
    narrowFeed?: boolean;           // True for centered narrow feed (homepage, reels)
    hideRightSidebar?: boolean;     // Hide right sidebar
    hideCategoryBar?: boolean;      // Hide mobile category bar
    customPadding?: boolean;        // Use custom padding instead of defaults
}>();

// Determine layout type based on route or props
const isNarrowFeed = computed(() => {
    if (props.narrowFeed !== undefined) return props.narrowFeed;
    // Auto-detect narrow feed pages
    return ['index', 'reels', 'profile-username', 'post-id'].includes(route.name as string);
});

const showCategoryBar = computed(() => {
    if (props.hideCategoryBar) return false;
    // Show category bar on commerce-heavy pages
    return isNarrowFeed.value && ['index', 'discover', 'thrift'].includes(route.name as string);
});

const showRightSidebar = computed(() => {
    if (props.hideRightSidebar) return false;
    // Show on narrow feed pages by default
    return isNarrowFeed.value;
});

// Dynamic main content classes
const mainContentClasses = computed(() => {
    const classes = [];
    
    // Mobile top spacing
    if (showCategoryBar.value) {
        classes.push('pt-28 md:pt-6'); // Extra space for header + category bar
    } else {
        classes.push('pt-16 md:pt-6'); // Space for header only
    }
    
    // Desktop centering and max width
    if (isNarrowFeed.value) {
        classes.push('max-w-2xl mx-auto lg:px-20');
    } else {
        classes.push('lg:px-6');
    }
    
    return classes.join(' ');
});

// Layout data
const { data: layoutData, refresh } = useLayoutData();
const topSellers = computed(() => layoutData.value?.topSellers || []);
const categories = computed(() => layoutData.value?.categories || []);

// Modal states
const showCreateModal = ref(false);
const showPostModal = ref(false);
const showStoryModal = ref(false);
const showQuickProductModal = ref(false);
const showSearchOverlay = ref(false);
const showNotificationOverlay = ref(false);
const showAI = ref(false);

// Modal handlers
const openPostUploader = () => {
    showCreateModal.value = false;
    showPostModal.value = true;
};

const openStoryUploader = () => {
    showCreateModal.value = false;
    showStoryModal.value = true;
};

const openQuickProductUploader = () => {
    showCreateModal.value = false;
    showQuickProductModal.value = true;
};

const handlePost = async () => {
    showPostModal.value = false;
    showStoryModal.value = false;
    showQuickProductModal.value = false;

    // Refresh all data
    await Promise.all([
        refreshNuxtData('layout-data'),
        refreshNuxtData('homepage-main'),
        refreshNuxtData('profile-data'),
    ]);
};

// Auto-refresh layout data periodically
let refreshInterval: NodeJS.Timeout | null = null;
onMounted(() => {
    // Refresh every 5 minutes
    refreshInterval = setInterval(() => { 
        refresh(); 
    }, 300000);
});

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
});
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