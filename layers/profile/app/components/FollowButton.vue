<template>
    <button 
        @click.stop="handleFollow" 
        :disabled="isLoading"
        class="text-xs font-semibold transition-colors disabled:opacity-50"
        :class="isFollowing ? 'text-gray-400 dark:text-neutral-500' : 'text-brand hover:text-[#d81b36]'"
    >
        {{ buttonText }}
    </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFollow } from '../composables/useFollow';
import { useFollowStore } from '../stores/follow.store';
import { useProfileStore } from '../stores/profile.store';
import { notify } from '@kyvg/vue3-notification';

const props = defineProps<{
    userId: string;
    username: string;
}>();

const followStore = useFollowStore();
const profileStore = useProfileStore();
const { followUser, unfollowUser, isLoading } = useFollow();

const isFollowing = computed(() => followStore.followedUserIds?.has(props.userId) || false);

const buttonText = computed(() => {
    if (isLoading.value) return 'Loading...';
    return isFollowing.value ? 'Following' : 'Follow';
});

const handleFollow = async () => {
    if (!profileStore.userId) {
        notify({ type: 'warn', text: 'Please log in to follow users' });
        return;
    }

    try {
        if (isFollowing.value) {
            await unfollowUser(props.username);
            followStore.removeFollowedUser(props.userId);
        } else {
            await followUser(props.username);
            followStore.addFollowedUser(props.userId);
        }
    } catch (error: any) {
        notify({ type: 'error', text: error.message || 'Failed to update follow status' });
    }
};
</script>