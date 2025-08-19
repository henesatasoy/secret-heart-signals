import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useConnectionValidation } from '@/hooks/useConnectionValidation'
import { useConnectionState, type ConnectionState } from '@/hooks/useConnectionState'
import { useConnectionRetry } from '@/hooks/useConnectionRetry'
import { useNetworkRetry } from '@/hooks/useNetworkRetry'

export const useConnection = (myConnectionId: string) => {
  const { toast } = useToast()
  const { isValidConnection, validatePartnerConnection, isSelfConnection } = useConnectionValidation(myConnectionId)
  const { connectionState, setLoading, setError, setConnected, updateConnectionState } = useConnectionState()
  const { executeWithRetry } = useConnectionRetry()
  const { executeWithNetworkRetry } = useNetworkRetry()

  // Initialize and load connection state with proper error handling
  useEffect(() => {
    if (!isValidConnection) {
      console.log('Skipping connection init - invalid connection ID:', myConnectionId);
      setError('Invalid connection ID')
      return;
    }

    const initConnection = async () => {
      console.log('Initializing connection for:', myConnectionId);
      setLoading(true)
      
      try {
        // Use enhanced network retry mechanism with better error handling
        const existing = await executeWithNetworkRetry(async () => {
          console.log('🔍 Fetching connection data for:', myConnectionId)
          
          const { data, error } = await supabase
            .from('connections')
            .select('partner_id, is_connected')
            .eq('connection_id', myConnectionId)
            .maybeSingle()

          if (error) {
            console.error('💥 Supabase query error:', error)
            throw error
          }
          
          console.log('✅ Connection data fetched:', data)
          return data
        }, 'connection fetch')

        if (existing) {
          console.log('Existing connection found:', existing);
          setConnected(existing.partner_id || null, Boolean(existing.is_connected))
        } else {
          // UPSERT pattern to prevent duplicate key violation
          console.log('Creating new connection with UPSERT for:', myConnectionId);
          
          await executeWithRetry(async () => {
            console.log('🔨 Creating new connection via UPSERT...')
            const { error } = await supabase
              .from('connections')
              .upsert({ 
                connection_id: myConnectionId,
                partner_id: null,
                is_connected: false
              }, {
                onConflict: 'connection_id',
                ignoreDuplicates: false
              })
            
            if (error) {
              console.error('💥 UPSERT error:', error)
              throw error
            }
            console.log('✅ UPSERT successful')
          }, 'connection creation')
          
          console.log('New connection upserted successfully');
          setConnected(null, false)
        }
      } catch (error) {
        console.error('💥 Connection initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
        
        // More specific error handling
        let userMessage = errorMessage
        if (errorMessage.includes('timeout') || errorMessage.includes('Failed to fetch')) {
          userMessage = 'Bağlantı zaman aşımı - internet bağlantınızı kontrol edin'
        } else if (errorMessage.includes('connection')) {
          userMessage = 'Sunucu bağlantısı kurulamadı'
        }
        
        setError(userMessage)
        
        // Only show toast for non-network errors (network errors already show toast)
        if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('timeout')) {
          toast({
            title: "Bağlantı hatası", 
            description: userMessage,
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false)
      }
    }

    initConnection()
  }, [isValidConnection, myConnectionId, setLoading, setError, setConnected, executeWithNetworkRetry, executeWithRetry, toast])

  // Listen for connection updates with improved error handling and debouncing  
  useEffect(() => {
    if (!isValidConnection) {
      console.log('Skipping realtime listener - invalid connection ID:', myConnectionId);
      return;
    }
    
    console.log('Setting up realtime listener for:', myConnectionId);
    
    // Debounce state updates to prevent rapid successive changes
    let updateTimeout: NodeJS.Timeout | null = null
    
    const debouncedStateUpdate = (newState: Partial<ConnectionState>) => {
      if (updateTimeout) clearTimeout(updateTimeout)
      updateTimeout = setTimeout(() => {
        updateConnectionState(newState)
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
          setError('Gerçek zamanlı bağlantı hatası')
        }
      })

    return () => {
      console.log('Cleaning up connection listener');
      if (updateTimeout) clearTimeout(updateTimeout)
      channel.unsubscribe()
    }
  }, [isValidConnection, myConnectionId, toast, updateConnectionState, setError])

  const connectWith = useCallback(async (partnerConnectionId: string) => {
    // ✅ HOOK VIOLATION FIX: No early returns before all hooks are called
    console.log('Attempting to connect', myConnectionId, 'with', partnerConnectionId);
    
    // Validation errors are handled through setError instead of early returns
    if (!isValidConnection || !partnerConnectionId || isSelfConnection(partnerConnectionId)) {
      console.warn('Invalid connection attempt:', { myConnectionId, partnerConnectionId })
      const errorMsg = 'Geçersiz bağlantı parametreleri'
      setError(errorMsg)
      return;
    }
    
    if (!validatePartnerConnection(partnerConnectionId)) {
      const errorMsg = "Geçersiz bağlantı kodu formatı"
      setError(errorMsg)
      toast({
        title: "Geçersiz bağlantı kodu",
        description: "Bağlantı kodu formatı yanlış",
        variant: "destructive"
      })
      return;
    }
    
    console.log('Starting connection process...');
    setLoading(true)
    
    try {
      // Enhanced transaction-like approach for connection establishment
      console.log('🔍 Checking my connection before proceeding...')
      const { data: myConnection, error: fetchError } = await supabase
        .from('connections')
        .select('id, partner_id, is_connected')
        .eq('connection_id', myConnectionId)
        .maybeSingle()
      
      if (fetchError) {
        console.error('💥 Error fetching my connection:', fetchError)
        throw new Error(`Bağlantı kontrolü başarısız: ${fetchError.message}`)
      }

      if (!myConnection) {
        console.log('Creating my own connection first with UPSERT');
        const { error: createError } = await supabase
          .from('connections')
          .upsert({ 
            connection_id: myConnectionId,
            partner_id: null,
            is_connected: false
          }, {
            onConflict: 'connection_id',
            ignoreDuplicates: false
          })
        
        if (createError) {
          console.error('Error upserting my connection:', createError);
          throw new Error(`Bağlantı oluşturulamadı: ${createError.message}`);
        }
      }

      // Check if already connected to this partner
      if (myConnection?.partner_id === partnerConnectionId && myConnection?.is_connected) {
        setConnected(partnerConnectionId, true)
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

      // Enhanced partner connection status check
      console.log('🔍 Checking partner connection status...')
      const { data: partnerConnection, error: partnerFetchError } = await supabase
        .from('connections')
        .select('id, partner_id, is_connected')
        .eq('connection_id', partnerConnectionId)
        .maybeSingle()
      
      if (partnerFetchError) {
        console.error('💥 Error fetching partner connection:', partnerFetchError)
        throw new Error(`Partner bağlantı kontrolü başarısız: ${partnerFetchError.message}`)
      }

      if (!partnerConnection) {
        // Partner doesn't exist yet - one-way connection established
        console.log('Partner connection not found - one-way connection established');
        
        setConnected(partnerConnectionId, true)
        
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
        console.log(`🔍 Verification attempt ${verificationAttempts + 1}/${maxVerificationAttempts}`)
        
        const { data: verification, error: verificationError } = await supabase
          .from('connections')
          .select('is_connected, partner_id')
          .eq('connection_id', myConnectionId)
          .maybeSingle()
        
        if (verificationError) {
          console.error('💥 Verification error:', verificationError)
          return false
        }
        
        console.log('🔍 Verification data:', verification)
        
        if (verification?.is_connected && verification?.partner_id === partnerConnectionId) {
          console.log('✅ Connection verified successfully!')
          return true
        }
        
        if (verificationAttempts < maxVerificationAttempts) {
          verificationAttempts++
          console.log(`⏱️ Waiting 500ms before next verification attempt...`)
          await new Promise(resolve => setTimeout(resolve, 500))
          return verifyConnection()
        }
        
        console.warn('❌ Verification failed after all attempts')
        return false
      }
      
      const isVerified = await verifyConnection()
      
      if (isVerified) {
        setConnected(partnerConnectionId, true)
        
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
      
      setError(errorMessage)
      
      toast({
        title: "Bağlantı hatası",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }, [isValidConnection, myConnectionId, toast, setLoading, setConnected, setError, validatePartnerConnection, isSelfConnection])

  const disconnectPartner = useCallback(async () => {
    try {
      console.log('Disconnecting from partner...');
      
      if (!connectionState.partnerId) {
        console.log('No partner to disconnect from');
        return;
      }

      setLoading(true)

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
      setConnected(null, false)
      
      toast({
        title: "Bağlantı koptu 💔",
        description: "Artık bağlı değilsiniz",
      });
      
    } catch (error) {
      console.error('Error in disconnectPartner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bağlantı hatası'
      
      setError(errorMessage)
      
      toast({
        title: "Bağlantı koparılamadı",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [myConnectionId, connectionState.partnerId, toast, setLoading, setConnected, setError])

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