/**
 * Fetch global layout data (top sellers, categories)
 * Cached across all pages
 */
export const useLayoutData = () => {
    return useLazyAsyncData(
        'layout-data',
        async () => {
            try {
                const [sellersResponse] = await Promise.all([
                    $fetch('/api/seller/list', { method: 'GET' }).catch(() => ({ data: [] })),
                ])

                return {
                    topSellers: (sellersResponse as any)?.data || [],
                }
            } catch (error) {
                console.error('Failed to fetch layout data:', error)
                return {
                    topSellers: [],
                }
            }
        },
        {
            server: true,
            lazy: true,
            default: () => ({
                topSellers: [],
            })
        }
    )
}
