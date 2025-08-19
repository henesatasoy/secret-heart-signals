import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

// Connection interface for better type safety
interface ConnectionState {
  isConnected: boolean
  partnerId: string | null
  isLoading: boolean
  error: string | null
}

export const useConnection = (myConnectionId: string) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    partnerId: null,
    isLoading: false,
    error: null
  })
  const { toast } = useToast()
  
  // Memoized connection ID validation
  const isValidConnectionId = useMemo(() => {
    return myConnectionId && myConnectionId.length > 0 && 
           /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(myConnectionId)
  }, [myConnectionId])

  // Initialize and load connection state with proper error handling
  useEffect(() => {
    if (!isValidConnectionId) {
      console.log('Skipping connection init - invalid connection ID:', myConnectionId);
      setConnectionState(prev => ({ ...prev, error: 'Invalid connection ID' }))
      return;
    }

    const initConnection = async () => {
      console.log('Initializing connection for:', myConnectionId);
      setConnectionState(prev => ({ ...prev, isLoading: true, error: null }))
      
      try {
        // First check if connection exists with retry logic
        let retryCount = 0
        const maxRetries = 3
        
        const fetchWithRetry = async (): Promise<any> => {
          try {
            const { data: existing, error: fetchError } = await supabase
              .from('connections')
              .select('partner_id, is_connected')
              .eq('connection_id', myConnectionId)
              .maybeSingle()

            if (fetchError) {
              if (retryCount < maxRetries && fetchError.message.includes('network')) {
                retryCount++
                console.log(`Retrying connection fetch, attempt ${retryCount}`)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
                return fetchWithRetry()
              }
              throw fetchError
            }

            return existing
          } catch (error) {
            if (retryCount < maxRetries) {
              retryCount++
              console.log(`Retrying connection fetch due to error, attempt ${retryCount}`)
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
              return fetchWithRetry()
            }
            throw error
          }
        }

        const existing = await fetchWithRetry()

        if (existing) {
          console.log('Existing connection found:', existing);
          setConnectionState({
            isConnected: Boolean(existing.is_connected),
            partnerId: existing.partner_id || null,
            isLoading: false,
            error: null
          })
        } else {
          // Create new connection with proper error handling
          console.log('Creating new connection for:', myConnectionId);
          const { error: insertError } = await supabase
            .from('connections')
            .insert({ connection_id: myConnectionId })
          
          if (insertError) {
            console.error('Error creating connection:', insertError);
            setConnectionState({
              isConnected: false,
              partnerId: null,
              isLoading: false,
              error: insertError.message
            })
            toast({
              title: "Bağlantı hatası",
              description: `Bağlantı oluşturulamadı: ${insertError.message}`,
              variant: "destructive"
            });
          } else {
            console.log('New connection created successfully');
            setConnectionState({
              isConnected: false,
              partnerId: null,
              isLoading: false,
              error: null
            })
          }
        }
      } catch (error) {
        console.error('Connection initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
        setConnectionState({
          isConnected: false,
          partnerId: null,
          isLoading: false,
          error: errorMessage
        })
        toast({
          title: "Bağlantı hatası", 
          description: `Sistem hatası: ${errorMessage}`,
          variant: "destructive"
        });
      }
    }

    initConnection()
  }, [isValidConnectionId, myConnectionId, toast])

  // Listen for connection updates with improved error handling and debouncing
  useEffect(() => {
    if (!isValidConnectionId) return;
    
    console.log('Setting up realtime listener for:', myConnectionId);
    
    // Debounce state updates to prevent rapid successive changes
    let updateTimeout: NodeJS.Timeout | null = null
    
    const debouncedStateUpdate = (newState: Partial<ConnectionState>) => {
      if (updateTimeout) clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        setConnectionState(prev => ({ ...prev, ...newState }))
      }, 100)
    }
    
    const channel = supabase
      .channel(`connection_updates_${myConnectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        (payload) => {
          console.log('Connection update received:', payload)
          
          // Strict type checking for payload data
          const connection = payload.new as Record<string, any> | null
          const oldConnection = payload.old as Record<string, any> | null
          
          // Validate connection data structure
          const isValidConnection = (conn: any): conn is { connection_id: string; partner_id?: string; is_connected?: boolean } => {
            return conn && typeof conn.connection_id === 'string'
          }
          
          // Handle updates that affect my connection with better validation
          if ((connection && isValidConnection(connection) && 
               (connection.connection_id === myConnectionId || connection.partner_id === myConnectionId)) ||
              (oldConnection && isValidConnection(oldConnection) && 
               (oldConnection.connection_id === myConnectionId || oldConnection.partner_id === myConnectionId))) {
            
            // Deletion event
            if (payload.eventType === 'DELETE') {
              debouncedStateUpdate({
                partnerId: null,
                isConnected: false,
                error: null
              })
              toast({
                title: "Bağlantı koptu 💔",
                description: "Partner bağlantıyı sonlandırdı",
              })
              return
            }
            
            // Update or Insert event with proper validation
            if (connection && isValidConnection(connection)) {
              if (connection.connection_id === myConnectionId) {
                // My connection was updated
                if (connection.is_connected && connection.partner_id) {
                  debouncedStateUpdate({
                    partnerId: connection.partner_id,
                    isConnected: true,
                    error: null
                  })
                  // Only show toast if this is a new connection (not initial load)
                  if (payload.eventType === 'UPDATE') {
                    toast({
                      title: "Bağlantı kuruldu! 💕",
                      description: "Sevgilinle artık mesajlaşabilirsin",
                    })
                  }
                } else {
                  debouncedStateUpdate({
                    partnerId: null,
                    isConnected: false,
                    error: null
                  })
                }
              } else if (connection.partner_id === myConnectionId) {
                // Partner's connection includes me
                if (connection.is_connected && connection.connection_id) {
                  debouncedStateUpdate({
                    partnerId: connection.connection_id,
                    isConnected: true,
                    error: null
                  })
                  // Only show toast if this is a new connection (not initial load)
                  if (payload.eventType === 'UPDATE') {
                    toast({
                      title: "Biri sana bağlandı! 💕", 
                      description: "Artık mesajlaşabilirsiniz",
                    })
                  }
                } else {
                  debouncedStateUpdate({
                    partnerId: null,
                    isConnected: false,
                    error: null
                  })
                }
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
        if (status === 'CHANNEL_ERROR') {
          setConnectionState(prev => ({ 
            ...prev, 
            error: 'Gerçek zamanlı bağlantı hatası' 
          }))
        }
      })

    return () => {
      console.log('Cleaning up connection listener');
      if (updateTimeout) clearTimeout(updateTimeout)
      channel.unsubscribe()
    }
  }, [isValidConnectionId, myConnectionId, toast])

  const connectWith = useCallback(async (partnerConnectionId: string) => {
    // Enhanced validation
    if (!isValidConnectionId || !partnerConnectionId || myConnectionId === partnerConnectionId) {
      console.warn('Invalid connection attempt:', { myConnectionId, partnerConnectionId })
      return;
    }
    
    // Validate partner connection ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(partnerConnectionId)) {
      toast({
        title: "Geçersiz bağlantı kodu",
        description: "Bağlantı kodu formatı yanlış",
        variant: "destructive"
      })
      return;
    }
    
    console.log('Attempting to connect', myConnectionId, 'with', partnerConnectionId);
    setConnectionState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Transaction-like approach for connection establishment
      const { data: myConnection } = await supabase
        .from('connections')
        .select('id, partner_id, is_connected')
        .eq('connection_id', myConnectionId)
        .maybeSingle()

      if (!myConnection) {
        console.log('Creating my own connection first');
        const { error: createError } = await supabase
          .from('connections')
          .insert({ connection_id: myConnectionId })
        
        if (createError) {
          console.error('Error creating my connection:', createError);
          throw new Error(`Bağlantı oluşturulamadı: ${createError.message}`);
        }
      }

      // Check if already connected to this partner
      if (myConnection?.partner_id === partnerConnectionId && myConnection?.is_connected) {
        setConnectionState(prev => ({ 
          ...prev, 
          partnerId: partnerConnectionId,
          isConnected: true,
          isLoading: false
        }))
        toast({
          title: "Zaten bağlısınız! 💕",
          description: "Bu partner ile bağlantınız mevcut",
        });
        return;
      }

      // Update my connection with partner using optimistic updates
      const { error: myError } = await supabase
        .from('connections')
        .update({ 
          partner_id: partnerConnectionId, 
          is_connected: true 
        })
        .eq('connection_id', myConnectionId)

      if (myError) {
        console.error('Error updating my connection:', myError);
        throw new Error(`Bağlantı güncellenemedi: ${myError.message}`);
      }

      // Check partner connection status
      const { data: partnerConnection } = await supabase
        .from('connections')
        .select('id, partner_id, is_connected')
        .eq('connection_id', partnerConnectionId)
        .maybeSingle()

      if (!partnerConnection) {
        // Partner doesn't exist yet - one-way connection established
        console.log('Partner connection not found - one-way connection established');
        
        setConnectionState({
          partnerId: partnerConnectionId,
          isConnected: true,
          isLoading: false,
          error: null
        })
        
        toast({
          title: "Bağlantı isteği gönderildi! 📡",
          description: "Partner bağlanınca karşılıklı bağlantı kurulacak",
        });
        return;
      }

      // Attempt mutual connection
      const { error: partnerError } = await supabase
        .from('connections')
        .update({ 
          partner_id: myConnectionId, 
          is_connected: true 
        })
        .eq('connection_id', partnerConnectionId)

      if (partnerError) {
        console.error('Error updating partner connection:', partnerError);
        // Don't throw here - partial connection is still valid
        console.log('Partial connection established - partner will need to confirm');
      }

      // Final verification with multiple attempts
      let verificationAttempts = 0
      const maxVerificationAttempts = 3
      
      const verifyConnection = async (): Promise<boolean> => {
        const { data: verification } = await supabase
          .from('connections')
          .select('is_connected, partner_id')
          .eq('connection_id', myConnectionId)
          .maybeSingle()
        
        if (verification?.is_connected && verification?.partner_id === partnerConnectionId) {
          return true
        }
        
        if (verificationAttempts < maxVerificationAttempts) {
          verificationAttempts++
          await new Promise(resolve => setTimeout(resolve, 500))
          return verifyConnection()
        }
        
        return false
      }
      
      const isVerified = await verifyConnection()
      
      if (isVerified) {
        setConnectionState({
          partnerId: partnerConnectionId,
          isConnected: true,
          isLoading: false,
          error: null
        })
        
        toast({
          title: "Bağlantı kuruldu! 💕",
          description: "Sevgilinle artık mesajlaşabilirsin",
        })
      } else {
        throw new Error('Bağlantı doğrulanamadı - lütfen tekrar deneyin');
      }
      
    } catch (error) {
      console.error('Connection error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bağlantı hatası'
      
      setConnectionState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }))
      
      toast({
        title: "Bağlantı hatası",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }, [isValidConnectionId, myConnectionId, toast])

  const disconnectPartner = useCallback(async () => {
    try {
      console.log('Disconnecting from partner...');
      
      if (!connectionState.partnerId) {
        console.log('No partner to disconnect from');
        return;
      }

      setConnectionState(prev => ({ ...prev, isLoading: true }))

      // Atomic operation to disconnect both sides
      const disconnectOperations = [
        // Update my connection
        supabase
          .from('connections')
          .update({ 
            partner_id: null, 
            is_connected: false 
          })
          .eq('connection_id', myConnectionId),
        
        // Update partner's connection
        supabase
          .from('connections')
          .update({ 
            partner_id: null, 
            is_connected: false 
          })
          .eq('connection_id', connectionState.partnerId)
      ]

      const results = await Promise.allSettled(disconnectOperations)
      
      // Check if my disconnection succeeded (most important)
      const myDisconnectResult = results[0]
      if (myDisconnectResult.status === 'rejected') {
        console.error('Error disconnecting my connection:', myDisconnectResult.reason);
        throw new Error('Kendi bağlantınız koparılamadı');
      }

      const partnerDisconnectResult = results[1]
      if (partnerDisconnectResult.status === 'rejected') {
        console.log('Partner disconnect failed (non-critical):', partnerDisconnectResult.reason);
      }

      // Update local state
      setConnectionState({
        partnerId: null,
        isConnected: false,
        isLoading: false,
        error: null
      })
      
      toast({
        title: "Bağlantı koptu 💔",
        description: "Artık bağlı değilsiniz",
      });
      
    } catch (error) {
      console.error('Error in disconnectPartner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bağlantı hatası'
      
      setConnectionState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }))
      
      toast({
        title: "Bağlantı koparılamadı",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [myConnectionId, connectionState.partnerId, toast])

  // Return enhanced state with backward compatibility
  return { 
    isConnected: connectionState.isConnected, 
    partnerId: connectionState.partnerId,
    isLoading: connectionState.isLoading,
    error: connectionState.error,
    connectWith, 
    disconnectPartner 
  }
}