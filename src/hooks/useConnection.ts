import { useState, useEffect } from 'react'
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

  // Listen for connection updates - simplified filtering
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
          filter: `connection_id=eq.${myConnectionId}`,
        },
        (payload) => {
          console.log('My connection update received:', payload)
          const connection = payload.new as any
          
          if (connection?.partner_id && connection?.is_connected) {
            setIsConnected(true)
            setPartnerId(connection.partner_id)
            toast({
              title: "Bağlantı kuruldu! 💕",
              description: "Sevgilinle artık mesajlaşabilirsin",
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'connections',
          filter: `partner_id=eq.${myConnectionId}`,
        },
        (payload) => {
          console.log('Partner connection update received:', payload)
          const connection = payload.new as any
          
          if (connection?.is_connected) {
            setIsConnected(true)
            setPartnerId(connection.connection_id)
            toast({
              title: "Biri sana bağlandı! 💕", 
              description: "Artık mesajlaşabilirsiniz",
            })
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up connection listener');
      supabase.removeChannel(channel)
    }
  }, [myConnectionId, toast])

  const connectWith = async (partnerConnectionId: string) => {
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

      // Check if partner connection exists
      let { data: partnerExists, error: partnerFetchError } = await supabase
        .from('connections')
        .select('id, connection_id, is_connected')
        .eq('connection_id', partnerConnectionId)
        .maybeSingle()

      if (partnerFetchError) {
        console.error('Error fetching partner connection:', partnerFetchError);
        throw partnerFetchError;
      }

      if (!partnerExists) {
        console.log('Partner connection not found - they need to open the app first');
        toast({
          title: "Partner henüz bağlantı oluşturmamış",
          description: "Partner'ın önce uygulamayı açması ve giriş yapması gerekiyor",
          variant: "destructive"
        });
        return;
      }

      console.log('Partner connection found:', partnerExists);

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

      // Update partner's connection with me
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
      setIsConnected(true)
      setPartnerId(partnerConnectionId)
      
      toast({
        title: "Bağlantı kuruldu! 💕",
        description: "Sevgilinle artık mesajlaşabilirsin",
      })
      
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: "Bağlantı hatası",
        description: "Lütfen tekrar dene: " + (error as any).message,
        variant: "destructive"
      })
    }
  }

  const disconnectPartner = async () => {
    try {
      console.log('Disconnecting from partner...');
      
      // Update my connection to remove partner
      const { error } = await supabase
        .from('connections')
        .update({ 
          partner_id: null, 
          is_connected: false 
        })
        .eq('connection_id', myConnectionId);

      if (error) {
        console.error('Error disconnecting:', error);
        toast({
          title: "Bağlantı koparılamadı",
          description: "Bir hata oluştu, tekrar deneyin",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setIsConnected(false);
      setPartnerId(null);
      
      toast({
        title: "Bağlantı koptu 💔",
        description: "Artık bağlı değilsiniz",
      });
      
    } catch (error) {
      console.error('Error in disconnectPartner:', error);
      toast({
        title: "Bağlantı koparılamadı",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  return { isConnected, partnerId, connectWith, disconnectPartner }
}