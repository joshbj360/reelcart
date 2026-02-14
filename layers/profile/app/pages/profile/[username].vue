<template>
    <HomeLayout>
        <div class="max-w-5xl mx-auto space-y-6 pb-20">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-20">
                <Icon name="eos-icons:loading" size="48" class="text-brand animate-spin" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-20">
                <div class="space-y-4">
                    <Icon name="mdi:alert-circle" size="48" class="text-red-500" />
                    <p class="text-gray-900 dark:text-neutral-100 font-semibold">{{ error }}</p>
                    <button 
                        @click="retryFetch"
                        class="px-6 py-2 bg-brand text-white rounded-lg hover:bg-[#d81b36] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>

            <!-- Profile Content -->
            <template v-else-if="profile">
                <!-- Profile Header -->
                <ProfileHeader 
                    :profile="profile" 
                    :stats="stats"
                    :is-own-profile="isOwnProfile"
                    :is-following="isFollowing"
                    @edit="showEditModal = true"
                    @message="startConversation"
                    @follow="handleFollow"
                    @unfollow="handleUnfollow"
                    @settings="goToSettings"
                    @show-followers="showFollowersModal = true"
                    @show-following="showFollowingModal = true"
                />

                <!-- Navigation Tabs -->
                <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
                    <!-- Tab Headers -->
                    <div class="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-neutral-800">
                        <button 
                            v-for="tab in availableTabs" 
                            :key="tab.id"
                            @click="activeTab = tab.id"
                            class="flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors relative"
                            :class="activeTab === tab.id 
                                ? 'text-gray-900 dark:text-neutral-100' 
                                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'"
                        >
                            <Icon :name="tab.icon" size="20" />
                            <span>{{ tab.label }}</span>
                            
                            <!-- Badge (for orders, notifications) -->
                            <span 
                                v-if="tab.badge && tab.badge > 0"
                                class="px-2 py-0.5 text-xs bg-brand text-white rounded-full"
                            >
                                {{ tab.badge }}
                            </span>

                            <!-- Active Indicator -->
                            <div 
                                v-if="activeTab === tab.id"
                                class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
                            ></div>
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div class="min-h-[400px]">
                        <!-- Posts Tab -->
                        <PostsTab 
                            v-if="activeTab === 'posts'"
                            :username="username"
                            :is-own-profile="isOwnProfile"
                        />

                        <!-- Orders Tab (Own profile only) -->
                        <OrdersTab 
                            v-else-if="activeTab === 'orders' && isOwnProfile"
                        />

                        <!-- Wallet Tab (Own profile only) -->
                        <WalletTab 
                            v-else-if="activeTab === 'wallet' && isOwnProfile"
                        />

                        <!-- Affiliate Tab (Own profile only) -->
                        <AffiliateTab 
                            v-else-if="activeTab === 'affiliate' && isOwnProfile"
                        />

                        <!-- Tagged Tab -->
                        <TaggedTab 
                            v-else-if="activeTab === 'tagged'"
                            :username="username"
                        />

                        <!-- Saved Tab (Own profile only) -->
                        <SavedTab 
                            v-else-if="activeTab === 'saved' && isOwnProfile"
                        />

                        <!-- About Tab -->
                        <AboutTab 
                            v-else-if="activeTab === 'about'"
                            :profile="profile"
                        />
                    </div>
                </div>
            </template>
        </div>

        <!-- Modals -->
        <EditProfileModal 
            v-if="showEditModal"
            :profile="profile"
            @close="showEditModal = false"
            @updated="handleProfileUpdated"
        />

        <FollowListModal 
            v-if="showFollowersModal"
            type="followers"
            :username="username"
            @close="showFollowersModal = false"
        />

        <FollowListModal 
            v-if="showFollowingModal"
            type="following"
            :username="username"
            @close="showFollowingModal = false"
        />
    </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '../../stores/profile.store'
import { useProfile } from '../../composables/useProfile'
import { useFollow } from '../../composables/useFollow'

// Components
import HomeLayout from '~/layouts/HomeLayout.vue'
import ProfileHeader from '../../components/profile/ProfileHeader.vue'
import PostsTab from '../../components/profile/tabs/PostTab.vue'
import OrdersTab from '../../components/profile/tabs/OrdersTab.vue'
import WalletTab from '../../components/profile/tabs/WalletTab.vue'
import AffiliateTab from '../../components/profile/tabs/AffiliateTab.vue'
import TaggedTab from '../../components/profile/tabs/TaggedTab.vue'
import SavedTab from '../../components/profile/tabs/SavedTab.vue'
import AboutTab from '../../components/profile/tabs/AboutTab.vue'
import EditProfileModal from '../../components/profile/modals/EditProfileModal.vue'
import FollowListModal from '../../components/profile/modals/FollowListModal.vue'
import { useFollowStore } from '../../stores/follow.store'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const followStore = useFollowStore()

const { fetchPublicProfile, fetchMyProfile, isLoading, error } = useProfile()
const { followUser, unfollowUser} = useFollow()

// ==================== STATE ====================

const username = computed(() => route.params.username as string)
const activeTab = ref('posts')
const showEditModal = ref(false)
const showFollowersModal = ref(false)
const showFollowingModal = ref(false)
const isFollowing = ref(false)

// Get profile from store
const profile = computed(() => {
    // If viewing own profile, use me
    if (isOwnProfile.value) {
        return profileStore.me
    }
    // Otherwise get public profile
    return profileStore.publicProfiles.get(username.value)
})

const isOwnProfile = computed(() => {
    return profileStore.me?.username === username.value
})

const stats = profileStore.getProfileStats(username.value)
// ==================== TABS CONFIGURATION ====================

const availableTabs = computed(() => {
    const publicTabs = [
        { id: 'posts', label: 'Posts', icon: 'mdi:grid' },
        { id: 'tagged', label: 'Tagged', icon: 'mdi:account-tag' },
        { id: 'about', label: 'About', icon: 'mdi:information' }
    ]

    if (isOwnProfile.value) {
        return [
            { id: 'posts', label: 'Posts', icon: 'mdi:grid' },
            { 
                id: 'orders', 
                label: 'Orders', 
                icon: 'mdi:package-variant',
                badge: pendingOrdersCount.value
            },
            { 
                id: 'wallet', 
                label: 'Wallet', 
                icon: 'mdi:wallet'
            },
            { 
                id: 'affiliate', 
                label: 'Affiliate', 
                icon: 'mdi:cash-multiple',
                badge: 0 // TODO: Add affiliate earnings badge
            },
            { id: 'saved', label: 'Saved', icon: 'mdi:bookmark' },
            { id: 'about', label: 'About', icon: 'mdi:information' }
        ]
    }

    return publicTabs
})

// TODO: Fetch pending orders count
const pendingOrdersCount = computed(() => 0)

// ==================== METHODS ====================

const retryFetch = async () => {
    if (isOwnProfile.value) {
        await fetchMyProfile()
    } else {
        await fetchPublicProfile(username.value)
    }
}

const handleFollow = async () => {
    await followUser(username.value)
    isFollowing.value = true
    profileStore.updateStat(username.value, 'followersCount', 1)
}

const handleUnfollow = async () => {
    await unfollowUser(username.value)
    isFollowing.value = false
    profileStore.updateStat(username.value, 'followersCount', -1)
}

const startConversation = () => {
    if (profile.value) {
        router.push(`/messages/new?user=${profile.value.id}`)
    }
}

const goToSettings = () => {
    router.push('/settings')
}

const handleProfileUpdated = () => {
    showEditModal.value = false
    retryFetch()
}

// ==================== LIFECYCLE ====================

// Fetch profile on mount and when username changes
watch(username, async (newUsername) => {
    if (!newUsername) return

    // Check if viewing own profile
    if (profileStore.me?.username === newUsername) {
        // Fetch own profile if not loaded
        if (!profileStore.me) {
            await fetchMyProfile()
//alert(JSON.stringify(stats))

        }
    } else {
        // Fetch public profile
        await fetchPublicProfile(newUsername)

        
        // Check if following
        isFollowing.value = followStore.isFollowing(profileStore.me?.id || '')
    }
}, { immediate: true })

// Set default tab from query params
onMounted(() => {
    const tabFromQuery = route.query.tab as string
    if (tabFromQuery && availableTabs.value.some(t => t.id === tabFromQuery)) {
        activeTab.value = tabFromQuery
    }
})

// Update URL when tab changes
watch(activeTab, (newTab) => {
    router.replace({ 
        query: { ...route.query, tab: newTab }
    })
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>