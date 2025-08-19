import { useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

// Network failure detection and retry mechanism
export const useNetworkRetry = () => {
  const { toast } = useToast()

  const handleNetworkFailure = useCallback((error: any, context: string) => {
    console.error(`🌐 Network failure in ${context}:`, error)
    
    const errorMessage = error?.message || error?.toString() || ''
    
    // Enhanced network error detection
    const isNetworkError = (
      errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('NETWORK_ERROR') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
      error?.name === 'AbortError' ||
      error?.code === 'NETWORK_ERROR'
    )
    
    if (isNetworkError) {
      // Only show toast on first attempt to avoid spam
      if (!context.includes('retry')) {
        toast({
          title: "Bağlantı sorunu",
          description: "İnternet bağlantınızı kontrol edin",
          variant: "destructive"
        })
      }
      
      return true // Indicates network failure
    }
    
    return false // Not a network failure
  }, [toast])

  const executeWithNetworkRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T> => {
    let lastError: any = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        return result // Success, return immediately
      } catch (error) {
        lastError = error
        console.log(`🔄 Network retry ${attempt + 1}/${maxRetries + 1} for ${context}`, error)
        
        // Check if we should retry
        if (attempt < maxRetries) {
          const isNetworkError = handleNetworkFailure(error, context)
          
          if (isNetworkError) {
            // Wait before retry with exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
            console.log(`⏱️ Waiting ${delay}ms before retry...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          } else {
            // Not a network error, throw immediately
            throw error
          }
        }
        
        // Max retries exceeded
        console.error(`❌ All retries exhausted for ${context}`)
        throw error
      }
    }
    
    // This should never be reached, but for TypeScript
    throw lastError
  }, [handleNetworkFailure])

  return {
    handleNetworkFailure,
    executeWithNetworkRetry
  }
}