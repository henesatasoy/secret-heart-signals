import { useState, useCallback } from 'react'

// Enhanced connection state interface
export interface ConnectionState {
  isConnected: boolean
  partnerId: string | null
  isLoading: boolean
  error: string | null
  lastUpdated?: number
}

// Connection state management hook
export const useConnectionState = (initialState?: Partial<ConnectionState>) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    partnerId: null,
    isLoading: false,
    error: null,
    lastUpdated: Date.now(),
    ...initialState
  })

  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => ({
      ...prev,
      ...updates,
      lastUpdated: Date.now()
    }))
  }, [])

  const resetConnectionState = useCallback(() => {
    setConnectionState({
      isConnected: false,
      partnerId: null,
      isLoading: false,
      error: null,
      lastUpdated: Date.now()
    })
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    updateConnectionState({ isLoading })
  }, [updateConnectionState])

  const setError = useCallback((error: string | null) => {
    updateConnectionState({ error, isLoading: false })
  }, [updateConnectionState])

  const setConnected = useCallback((partnerId: string | null, isConnected: boolean) => {
    updateConnectionState({ 
      partnerId, 
      isConnected, 
      isLoading: false, 
      error: null 
    })
  }, [updateConnectionState])

  return {
    connectionState,
    updateConnectionState,
    resetConnectionState,
    setLoading,
    setError,
    setConnected
  }
}