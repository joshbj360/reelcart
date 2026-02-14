// FILE PATH: layers/seller/app/stores/seller.store.ts

/**
 * Seller Store
 * Manages seller profile state using Pinia
 */

export const useSellerStore = defineStore('seller', () => {
  // State
  const sellers = ref<any[]>([])
  const currentSeller = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  // Getters
  const hasSellers = computed(() => sellers.value.length > 0)
  const sellerCount = computed(() => sellers.value.length)
  const activeSellers = computed(() => 
    sellers.value.filter(s => s.is_active)
  )
  const inactiveSellers = computed(() => 
    sellers.value.filter(s => !s.is_active)
  )

  // Actions - State Management
  const setSellers = (newSellers: any[]) => {
    sellers.value = newSellers
  }

  const addSeller = (seller: any) => {
    sellers.value.push(seller)
  }

  const updateSeller = (sellerId: string, updates: any) => {
    const index = sellers.value.findIndex(s => s.id === sellerId)
    if (index !== -1) {
      sellers.value[index] = { ...sellers.value[index], ...updates }
    }
  }

  const removeSeller = (sellerId: string) => {
    sellers.value = sellers.value.filter(s => s.id !== sellerId)
  }

  const setCurrentSeller = (seller: any) => {
    currentSeller.value = seller
  }

  const clearCurrentSeller = () => {
    currentSeller.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  const setMessage = (msg: string | null) => {
    message.value = msg
    if (msg) {
      // Auto-clear message after 5 seconds
      setTimeout(() => {
        message.value = null
      }, 5000)
    }
  }

  const clearAllSellers = () => {
    sellers.value = []
    currentSeller.value = null
  }

  return {
    // State
    sellers,
    currentSeller,
    isLoading,
    error,
    message,

    // Getters
    hasSellers,
    sellerCount,
    activeSellers,
    inactiveSellers,

    // Actions
    setSellers,
    addSeller,
    updateSeller,
    removeSeller,
    setCurrentSeller,
    clearCurrentSeller,
    setLoading,
    setError,
    setMessage,
    clearAllSellers
  }
})