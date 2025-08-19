import { useState, useEffect, useMemo } from 'react';
import { isValidUUID } from '@/hooks/useConnectionValidation';

export const useConnectionLink = (connectionId: string) => {
  const [connectionLink, setConnectionLink] = useState("");

  // Validate connection ID
  const isValidConnection = useMemo(() => {
    return connectionId && connectionId.length > 0 && isValidUUID(connectionId);
  }, [connectionId]);

  // Generate connection link with enhanced safety checks
  useEffect(() => {
    if (isValidConnection && typeof window !== 'undefined') {
      try {
        const currentUrl = window.location.origin;
        const encodedConnectionId = encodeURIComponent(connectionId);
        setConnectionLink(`${currentUrl}?connect=${encodedConnectionId}`);
      } catch (error) {
        console.error('Error generating connection link:', error);
        setConnectionLink('');
      }
    } else {
      setConnectionLink('');
    }
  }, [connectionId, isValidConnection]);

  return {
    connectionLink,
    isValidConnection
  };
};