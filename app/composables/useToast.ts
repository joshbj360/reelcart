export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    // Implementation depends on the toast library you are using.   

    console.log(`[${type.toUpperCase()}] ${message} (Duration: ${duration}ms)`)
    // Example: Using a hypothetical toast library
    // toastLibrary.show({ message, type, duration })
  } 
    return { showToast }
}