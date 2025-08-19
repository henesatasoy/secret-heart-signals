import { useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

// Network failure detection and retry mechanism
export const useNetworkRetry = () => {
  const { toast } = useToast()

  const handleNetworkFailure = useCallback((error: any, context: string) => {
    console.error(`🌐 Network failure in ${context}:`, error)
    
    if (error?.message?.includes('Failed to fetch') || 
        error?.message?.includes('Network request failed')) {
      
      // Show user-friendly network error
      toast({
        title: "Bağlantı sorunu",
        description: "İnternet bağlantınızı kontrol edin",
        variant: "destructive"
      })
      
      return true // Indicates network failure
    }
    
    return false // Not a network failure
  }, [toast])

  const executeWithNetworkRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T | null> => {
    let lastError: any = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        console.log(`🔄 Network retry ${attempt + 1}/${maxRetries + 1} for ${context}`)
        
        if (attempt < maxRetries && handleNetworkFailure(error, context)) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)))
          continue
        }
        
        // If not a network failure or max retries exceeded, throw
        throw error
      }
    }
    
    throw lastError
  }, [handleNetworkFailure])

  return {
    handleNetworkFailure,
    executeWithNetworkRetry
  }
}