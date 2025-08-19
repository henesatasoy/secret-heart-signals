import { useMemo } from 'react'

// UUID validation utility
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)
}

// Connection validation hook
export const useConnectionValidation = (connectionId: string) => {
  const isValidConnection = useMemo(() => {
    return connectionId && connectionId.length > 0 && isValidUUID(connectionId)
  }, [connectionId])

  const validatePartnerConnection = (partnerId: string | null): boolean => {
    if (!partnerId) return false
    return isValidUUID(partnerId) && partnerId !== connectionId
  }

  const isSelfConnection = (partnerId: string): boolean => {
    return partnerId === connectionId
  }

  return {
    isValidConnection,
    validatePartnerConnection,
    isSelfConnection,
    isValidUUID
  }
}