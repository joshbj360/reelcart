export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, isSeller } = useAuth()
  
  if (!isAuthenticated.value) {
    return navigateTo('/auth/user-login')  // Redirect to login
  }
  
  if (!isSeller.value) {
    return navigateTo('/sellers/register')  // Redirect to seller registration
  }
})