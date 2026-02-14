<template>
    <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
        <div class="flex flex-col md:flex-row gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0">
                <img 
                    :src="profile.avatar || `https://avatar.iran.liara.run/public/boy?username=${profile.username}`"
                    :alt="profile.username || 'User Avatar'"
                    class="w-32 h-32 rounded-full object-cover border-4 border-gray-100 dark:border-neutral-800"
                />
            </div>

            <!-- Info -->
            <div class="flex-1 space-y-4">
                <!-- Username & Actions -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                            {{ profile.username }}
                        </h1>
                        <p v-if="profile.role === 'SELLER'" class="text-sm text-brand font-medium">
                            <Icon name="mdi:store" size="16" class="inline" />
                            Verified Seller
                        </p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2 sm:ml-auto">
                        <!-- Own Profile -->
                        <template v-if="isOwnProfile">
                            <button 
                                @click="$emit('edit')"
                                class="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <Icon name="mdi:pencil" size="16" class="inline mr-1" />
                                Edit Profile
                            </button>
                            <button 
                                @click="$emit('settings')"
                                class="p-2 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <Icon name="mdi:cog" size="20" />
                            </button>
                        </template>

                        <!-- Other User's Profile -->
                        <template v-else>
                            <button 
                                @click="isFollowing ? $emit('unfollow') : $emit('follow')"
                                class="px-6 py-2 rounded-lg font-semibold transition-colors"
                                :class="isFollowing 
                                    ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-neutral-700' 
                                    : 'bg-brand text-white hover:bg-[#d81b36]'"
                            >
                                {{ isFollowing ? 'Following' : 'Follow' }}
                            </button>
                            <button 
                                @click="$emit('message')"
                                class="px-6 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                Message
                            </button>
                            <button 
                                class="p-2 bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <Icon name="mdi:dots-horizontal" size="20" />
                            </button>
                        </template>
                    </div>
                </div>

                <!-- Stats -->
                <div class="flex gap-8">
                    <button class="text-center hover:opacity-80 transition-opacity">
                        <div class="text-xl font-bold text-gray-900 dark:text-neutral-100">
                            {{ formatNumber(stats.postsCount) }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-neutral-400">
                            Posts
                        </div>
                    </button>

                    <button 
                        @click="$emit('show-followers')"
                        class="text-center hover:opacity-80 transition-opacity"
                    >
                        <div class="text-xl font-bold text-gray-900 dark:text-neutral-100">
                            {{ formatNumber(stats.followersCount) }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-neutral-400">
                            Followers
                        </div>
                    </button>

                    <button 
                        @click="$emit('show-following')"
                        class="text-center hover:opacity-80 transition-opacity"
                    >
                        <div class="text-xl font-bold text-gray-900 dark:text-neutral-100">
                            {{ formatNumber(stats.followingCount) }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-neutral-400">
                            Following
                        </div>
                    </button>
                </div>

                <!-- Bio -->
                <div v-if="profile.bio" class="text-gray-700 dark:text-neutral-300">
                    {{ profile.bio }}
                </div>

                <!-- Links -->
                <div v-if="profile.profileUrl || profile.stateOfResidence" class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-neutral-400">
                    <a 
                        v-if="profile.profileUrl"
                        :href="profile.profileUrl"
                        target="_blank"
                        class="flex items-center gap-1 hover:text-brand transition-colors"
                    >
                        <Icon name="mdi:link" size="16" />
                        {{ profile.profileUrl.replace(/^https?:\/\//, '') }}
                    </a>
                    <div v-if="profile.stateOfResidence" class="flex items-center gap-1">
                        <Icon name="mdi:map-marker" size="16" />
                        {{ profile.stateOfResidence }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IProfile, IProfileStats } from '../../types/profile.types'

defineProps<{
    profile: IProfile 
    stats: IProfileStats
    isOwnProfile: boolean
    isFollowing: boolean
}>()

defineEmits(['edit', 'settings', 'message', 'follow', 'unfollow', 'show-followers', 'show-following'])

const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
}
</script>