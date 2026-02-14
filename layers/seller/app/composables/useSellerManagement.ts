// FILE PATH: layers/seller/app/composables/useSellerManagement.ts

import { useSellerApi } from "../services/seller.services"
import { useSellerStore } from "../store/seller.store"

/**
 * Seller Management Composable
 * Provides seller functionality to components
 * Uses seller store and API service
 * 
 * Pattern matches: useAuth composable
 */

export function useSellerManagement() {
  const sellerStore = useSellerStore()
  const sellerApi = useSellerApi()
  const router = useRouter()

  // ==================== CREATE SELLER ====================

  const createSeller = async (data: {
    store_name: string
    store_slug: string
    store_description?: string
    store_location?: string
    store_phone?: string
    store_website?: string
    store_logo?: string
    store_banner?: string
    store_socials?: Record<string, any>
  }) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.createSellerProfile(data)
      
      sellerStore.addSeller(result.data)
      sellerStore.setMessage('Seller profile created successfully!')
      
      // Navigate to seller dashboard
      await router.push(`/seller/${result.data.id}/dashboard`)
      
      return result
    } catch (error: any) {
      const message = error.response?.data?.statusMessage || error.message || 'Failed to create seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== GET SELLERS ====================

  const loadUserSellers = async () => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.getUserSellerProfiles()
      sellerStore.setSellers(result.data)
      return result
    } catch (error: any) {
      const message = error.response?.data?.statusMessage || error.message || 'Failed to load sellers'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  const loadPublicSeller = async (slug: string) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.getSellerBySlug(slug)
      sellerStore.setCurrentSeller(result.data)
      return result
    } catch (error: any) {
      const message = error.response?.data?.statusMessage || error.message || 'Seller not found'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== UPDATE SELLER ====================

  const updateSeller = async (
    sellerId: string,
    data: {
      store_name?: string
      store_description?: string
      store_location?: string
      store_phone?: string
      store_website?: string
      store_logo?: string
      store_banner?: string
      store_socials?: Record<string, any>
      auto_answer_enabled?: boolean
    }
  ) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.updateSellerProfile(sellerId, data)
      
      sellerStore.updateSeller(sellerId, result.data)
      sellerStore.setCurrentSeller(result.data)
      sellerStore.setMessage('Seller profile updated successfully!')
      
      return result
    } catch (error: any) {
      const message = error.response?.data?.statusMessage || error.message || 'Failed to update seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== ACTIVATE / DEACTIVATE ====================

  const activateSeller = async (sellerId: string) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.activateSellerProfile(sellerId)
      
      sellerStore.updateSeller(sellerId, { is_active: true })
      sellerStore.setMessage('Seller profile activated successfully!')
      
      return result
    } catch (error: any) {
      const message = error.response?.data?.statusMessage || error.message || 'Failed to activate seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  const deactivateSeller = async (sellerId: string) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.deactivateSellerProfile(sellerId)
      
      sellerStore.updateSeller(sellerId, { is_active: false })
      sellerStore.setMessage('Seller profile deactivated successfully!')
      
      return result
    } catch (error: any) {
      const message = error.response?.data?.statusMessage || error.message || 'Failed to deactivate seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== SLUG MANAGEMENT ====================

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    try {
      const result = await sellerApi.checkSlugAvailability(slug)
      return result.available
    } catch (error) {
      console.error('Error checking slug:', error)
      return false
    }
  }

  const suggestSlugs = async (baseName: string): Promise<string[]> => {
    try {
      const result = await sellerApi.suggestSlugs(baseName)
      return result.suggestions
    } catch (error) {
      console.error('Error suggesting slugs:', error)
      return []
    }
  }

  // ==================== GETTERS ====================

  return {
    // State
    sellers: computed(() => sellerStore.sellers),
    currentSeller: computed(() => sellerStore.currentSeller),
    isLoading: computed(() => sellerStore.isLoading),
    error: computed(() => sellerStore.error),
    message: computed(() => sellerStore.message),
    hasSellers: computed(() => sellerStore.hasSellers),
    sellerCount: computed(() => sellerStore.sellerCount),
    activeSellers: computed(() => sellerStore.activeSellers),
    inactiveSellers: computed(() => sellerStore.inactiveSellers),

    // Methods
    createSeller,
    loadUserSellers,
    loadPublicSeller,
    updateSeller,
    activateSeller,
    deactivateSeller,
    checkSlugAvailability,
    suggestSlugs
  }
}