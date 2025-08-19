import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const useConnection = (myConnectionId: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize and load connection state
  useEffect(() => {
    if (!myConnectionId || myConnectionId.length === 0) {
      console.log('Skipping connection init - no connection ID');
      return;
    }

    const initConnection = async () => {
      console.log('Initializing connection for:', myConnectionId);
      
      try {
        // First check if connection exists
        const { data: existing, error: fetchError } = await supabase
          .from('connections')
          .select('*')
          .eq('connection_id', myConnectionId)
          .maybeSingle()

        if (fetchError) {
          console.error('Error fetching connection:', fetchError);
          return;
        }

        if (existing) {
          console.log('Existing connection found:', existing);
          setIsConnected(existing.is_connected || false)
          setPartnerId(existing.partner_id || null)
        } else {
          // Create new connection
          console.log('Creating new connection for:', myConnectionId);
          const { error } = await supabase
            .from('connections')
            .insert({ connection_id: myConnectionId })
          
          if (error) {
            console.error('Error creating connection:', error);
            toast({
              title: "Bağlantı hatası",
              description: "Connection oluşturulamadı: " + error.message,
              variant: "destructive"
            });
          } else {
            console.log('New connection created successfully');
            setIsConnected(false);
            setPartnerId(null);
          }
        }
      } catch (error) {
        console.error('Connection initialization error:', error);
        toast({
          title: "Bağlantı hatası", 
          description: "Sistem hatası oluştu",
          variant: "destructive"
        });
      }
    }

    initConnection()
  }, [myConnectionId, toast])

  // Listen for connection updates - optimized single listener
  useEffect(() => {
    if (!myConnectionId || myConnectionId.length === 0) return;
    
    console.log('Setting up realtime listener for:', myConnectionId);
    
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
          const connection = payload.new as { connection_id?: string; partner_id?: string; is_connected?: boolean }
          const oldConnection = payload.old as { connection_id?: string; partner_id?: string }
          
          // Handle updates that affect my connection
          if (connection?.connection_id === myConnectionId || connection?.partner_id === myConnectionId ||
              oldConnection?.connection_id === myConnectionId || oldConnection?.partner_id === myConnectionId) {
            
            // Deletion event
            if (payload.eventType === 'DELETE') {
              setPartnerId(null)
              setIsConnected(false)
              toast({
                title: "Bağlantı koptu 💔",
                description: "Partner bağlantıyı sonlandırdı",
              })
              return
            }
            
            // Update or Insert event
            if (connection?.connection_id === myConnectionId) {
              // My connection was updated
              if (connection.is_connected && connection.partner_id) {
                setPartnerId(connection.partner_id)
                setIsConnected(true)
                // Only show toast if this is a new connection (not initial load)
                if (payload.eventType === 'UPDATE') {
                  toast({
                    title: "Bağlantı kuruldu! 💕",
                    description: "Sevgilinle artık mesajlaşabilirsin",
                  })
                }
              } else {
                setPartnerId(null)
                setIsConnected(false)
              }
            } else if (connection?.partner_id === myConnectionId) {
              // Partner's connection includes me
              if (connection.is_connected && connection.connection_id) {
                setPartnerId(connection.connection_id)
                setIsConnected(true)
                // Only show toast if this is a new connection (not initial load)
                if (payload.eventType === 'UPDATE') {
                  toast({
                    title: "Biri sana bağlandı! 💕", 
                    description: "Artık mesajlaşabilirsiniz",
                  })
                }
              } else {
                setPartnerId(null)
                setIsConnected(false)
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up connection listener');
      channel.unsubscribe()
    }
  }, [myConnectionId, toast])

  const connectWith = useCallback(async (partnerConnectionId: string) => {
    if (!myConnectionId || myConnectionId === partnerConnectionId) return;
    
    console.log('Attempting to connect', myConnectionId, 'with', partnerConnectionId);
    
    try {
      // First ensure I have my own connection
      let { data: myConnection } = await supabase
        .from('connections')
        .select('id')
        .eq('connection_id', myConnectionId)
        .maybeSingle()

      if (!myConnection) {
        console.log('Creating my own connection first');
        const { error: createError } = await supabase
          .from('connections')
          .insert({ connection_id: myConnectionId })
        
        if (createError) {
          console.error('Error creating my connection:', createError);
          throw createError;
        }
      }

      // Try to update both connections directly - don't check partner existence first
      console.log('Attempting to establish connection between users');

      // Update my connection with partner
      const { error: myError } = await supabase
        .from('connections')
        .update({ 
          partner_id: partnerConnectionId, 
          is_connected: true 
        })
        .eq('connection_id', myConnectionId)

      if (myError) {
        console.error('Error updating my connection:', myError);
        throw myError;
      }

      // Check if partner connection exists (read-only check)
      let { data: partnerConnection } = await supabase
        .from('connections')
        .select('id, partner_id, is_connected')
        .eq('connection_id', partnerConnectionId)
        .maybeSingle()

      if (!partnerConnection) {
        // Partner doesn't have a connection yet - that's ok, they'll connect when they're ready
        console.log('Partner connection not found - they will need to connect back');
        
        // Update local state to show we're connected but waiting for partner
        setPartnerId(partnerConnectionId);
        setIsConnected(true);
        
        toast({
          title: "Bağlantı isteği gönderildi! 📡",
          description: "Partner bağlanmayı kabul ettiğinde video çalacak.",
        });
        
        return;
      }

      // Partner connection exists - try to establish mutual connection
      const { error: partnerError } = await supabase
        .from('connections')
        .update({ 
          partner_id: myConnectionId, 
          is_connected: true 
        })
        .eq('connection_id', partnerConnectionId)

      if (partnerError) {
        console.error('Error updating partner connection:', partnerError);
        throw partnerError;
      }


      console.log('Connection established successfully');
      
      // CRITICAL: Only update local state if database updates were successful
      // Don't assume success - verify the actual database state
      const { data: verifyConnection } = await supabase
        .from('connections')
        .select('is_connected, partner_id')
        .eq('connection_id', myConnectionId)
        .maybeSingle()
      
      if (verifyConnection?.is_connected && verifyConnection?.partner_id) {
        setPartnerId(partnerConnectionId)
        setIsConnected(true)
        
        toast({
          title: "Bağlantı kuruldu! 💕",
          description: "Sevgilinle artık mesajlaşabilirsin",
        })
      } else {
        console.error('Database verification failed - connection not actually established');
        throw new Error('Connection verification failed');
      }
      
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: "Bağlantı hatası",
        description: "Lütfen tekrar dene: " + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        variant: "destructive"
      })
    }
  }, [myConnectionId, toast]) // Include toast to prevent re-creation

  const disconnectPartner = useCallback(async () => {
    try {
      console.log('Disconnecting from partner...');
      
      if (!partnerId) {
        console.log('No partner to disconnect from');
        return;
      }

      // Update my connection to remove partner
      const { error: myError } = await supabase
        .from('connections')
        .update({ 
          partner_id: null, 
          is_connected: false 
        })
        .eq('connection_id', myConnectionId);

      if (myError) {
        console.error('Error disconnecting my connection:', myError);
        throw myError;
      }

      // Also update partner's connection to remove me
      const { error: partnerError } = await supabase
        .from('connections')
        .update({ 
          partner_id: null, 
          is_connected: false 
        })
        .eq('connection_id', partnerId)  // Use partner's connection_id, not partner_id filter

      // Don't throw error if partner update fails (expected behavior)
      if (partnerError) {
        console.log('Partner connection update result:', partnerError);
      }

      // Update local state regardless
      setPartnerId(null);
      setIsConnected(false);
      
      toast({
        title: "Bağlantı koptu 💔",
        description: "Artık bağlı değilsiniz",
      });
      
    } catch (error) {
      console.error('Error in disconnectPartner:', error);
      toast({
        title: "Bağlantı koparılamadı",
        description: "Bir hata oluştu: " + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        variant: "destructive",
      });
    }
  }, [myConnectionId, partnerId, toast]); // Include toast for stability

  return { isConnected, partnerId, connectWith, disconnectPartner }
}