import { useCategoryStore,  useUserStore, useLikeStore, useFollowStore } from '~/stores';
import { useApiService } from '~/services/api/apiService';
import { onMounted, onUnmounted } from 'vue';

/**
 * @description Fetches ALL shared layout data (public and private) in one go.
 * This runs on the server (or client) and uses the apiService,
 * which now correctly forwards auth.
 */
export const useLayoutData = () => {
    const categoryStore = useCategoryStore();
    const apiService = useApiService();
    const userStore = useUserStore();
    const likeStore = useLikeStore();
    const followStore = useFollowStore();

    const { data, pending, error, refresh } = useAsyncData(
        'layout-data', 
        async () => {
            console.log('Fetching fresh layout data via apiService...');
            
            const promises: Promise<any>[] = [
                apiService.getTopSellers(),
                categoryStore.fetchCategories() // This action has its own smart cache
            ];

            // If the user is logged in, add their private data to the parallel fetch
            if (userStore.isLoggedIn) {
                promises.push(likeStore.fetchUserLikes());
                promises.push(followStore.fetchUserFollows());
            }

            // Promise.all runs all fetches in parallel
            // The `apiService` will correctly handle auth for the private calls
            const [topSellers, categories] = await Promise.all(promises);
            
            // The like/follow stores are now populated by their own actions.
            
            return { topSellers, categories };
        }, {
        default: () => ({
            topSellers: [],
            categories: [],
        })
    });

    // Auto-refresh interval
    let refreshInterval: NodeJS.Timeout | null = null;
    onMounted(() => {
        refreshInterval = setInterval(() => {
            if (userStore.isLoggedIn) {
                refresh();
            }
        }, 300000); // 5 minutes
    });
    onUnmounted(() => {
        if (refreshInterval) clearInterval(refreshInterval);
    });

    return { data, pending, error, refresh };
};