import { useAuthStore } from "../stores/auth.store"
import type { ILoginCredentials, IRegisterData } from "../types/auth.types"

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  
  const login = async (credentials: ILoginCredentials) => {
    try {
      const res = await authStore.login(credentials)
      router.push('/')  // Navigate after login
      return res
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const register = async (credentials: IRegisterData) => {
    try {
        const res = await authStore.register(credentials)
        router.push('/auth/login')
        return res
    } catch (error) {
        console.log(error)
    }
  }

  const loginWithOAuth = async (provider: "facebook" | "google") => {
    try {
        await authStore.loginWithOAuth(provider)
        router.push('/auth/login')
    } catch (error) {
        console.log(error)
    }
  }

  
  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    login,
    register,
    loginWithOAuth,
    loading: authStore.isLoading,
    error: authStore.error,
    logout: authStore.logout,
  }
}