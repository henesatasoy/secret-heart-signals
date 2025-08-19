import { useCallback, useRef } from 'react'

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  backoffMultiplier: 2
}

// Enhanced retry logic hook
export const useConnectionRetry = (config: Partial<RetryConfig> = {}) => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  const retryCountRef = useRef(0)

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt)
    return Math.min(delay, retryConfig.maxDelay)
  }, [retryConfig])

  const shouldRetry = useCallback((error: any, attempt: number): boolean => {
    if (attempt >= retryConfig.maxRetries) return false
    
    // Check if error is retryable
    const errorMessage = error?.message || ''
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('fetch')
    )
  }, [retryConfig.maxRetries])

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    retryCountRef.current = 0
    
    const attemptOperation = async (): Promise<T> => {
      try {
        const result = await operation()
        retryCountRef.current = 0 // Reset on success
        return result
      } catch (error) {
        const currentAttempt = retryCountRef.current
        
        if (shouldRetry(error, currentAttempt)) {
          retryCountRef.current++
          const delay = calculateDelay(currentAttempt)
          
          console.log(
            `🔄 Retry attempt ${currentAttempt + 1}/${retryConfig.maxRetries} for ${context || 'operation'} in ${delay}ms`,
            error
          )
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return attemptOperation()
        }
        
        console.error(`❌ Max retries exceeded for ${context || 'operation'}:`, error)
        throw error
      }
    }
    
    return attemptOperation()
  }, [shouldRetry, calculateDelay, retryConfig.maxRetries])

  const resetRetryCount = useCallback(() => {
    retryCountRef.current = 0
  }, [])

  return {
    executeWithRetry,
    resetRetryCount,
    getCurrentAttempt: () => retryCountRef.current
  }
}