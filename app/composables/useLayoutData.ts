

/**
 * Fetch global layout data (top sellers, categories)
 * Cached across all pages
 */
export const useLayoutData = () => {

    
    return useLazyAsyncData(
        'layout-data',
        async () => {
            try {
                // TODO: Replace with actual API calls
                const [topSellers] = await Promise.all([
                    // $fetch('/api/sellers/top'),
                    Promise.resolve([]), // Placeholder
                    //categoryStore.fetchCategories()
                ])

                return {
                    topSellers: topSellers || [],
                   // categories: categoryStore.categories || []
                }
            } catch (error) {
                console.error('Failed to fetch layout data:', error)
                return {
                    topSellers: [],
                    categories: []
                }
            }
        },
        {
            server: true,
            lazy: true,
            default: () => ({
                topSellers: [],
                categories: []
            })
        }
    )
}