import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const useConnection = (myConnectionId: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const { toast } = useToast()

  // Load initial connection state
  useEffect(() => {
    const loadConnectionState = async () => {
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .eq('connection_id', myConnectionId)
        .maybeSingle()

      if (existing) {
        setIsConnected(existing.is_connected || false)
        setPartnerId(existing.partner_id || null)
      }
    }

    loadConnectionState()
  }, [myConnectionId])

  // Initialize connection if not exists
  useEffect(() => {
    const initConnection = async () => {
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .eq('connection_id', myConnectionId)
        .maybeSingle()

      if (!existing) {
        await supabase
          .from('connections')
          .insert({ connection_id: myConnectionId })
      }
    }

    initConnection()
  }, [myConnectionId])

  // Listen for connection updates - both for my connection and when I'm someone's partner
  useEffect(() => {
    const channel = supabase
      .channel('connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `or(connection_id.eq.${myConnectionId},partner_id.eq.${myConnectionId})`,
        },
        (payload) => {
          console.log('Connection update received:', payload)
          const connection = payload.new as any
          
          // If this is my connection record being updated
          if (connection?.connection_id === myConnectionId) {
            if (connection?.partner_id && connection?.is_connected) {
              setIsConnected(true)
              setPartnerId(connection.partner_id)
              toast({
                title: "Bağlantı kuruldu! 💕",
                description: "Sevgilinle artık mesajlaşabilirsin",
              })
            }
          }
          // If I'm being set as someone's partner
          else if (connection?.partner_id === myConnectionId && connection?.is_connected) {
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
      supabase.removeChannel(channel)
    }
  }, [myConnectionId])

  const connectWith = async (partnerConnectionId: string) => {
    try {
      // Update my connection with partner
      await supabase
        .from('connections')
        .update({ 
          partner_id: partnerConnectionId, 
          is_connected: true 
        })
        .eq('connection_id', myConnectionId)

      // Update partner's connection with me
      await supabase
        .from('connections')
        .update({ 
          partner_id: myConnectionId, 
          is_connected: true 
        })
        .eq('connection_id', partnerConnectionId)

      setIsConnected(true)
      setPartnerId(partnerConnectionId)
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: "Bağlantı hatası",
        description: "Lütfen tekrar dene",
        variant: "destructive"
      })
    }
  }

  return { isConnected, partnerId, connectWith }
}