import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export const useConnection = (myConnectionId: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize connection
  useEffect(() => {
    const initConnection = async () => {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .eq('connection_id', myConnectionId)
        .single()

      if (!existing) {
        // Create new connection
        await supabase
          .from('connections')
          .insert({ connection_id: myConnectionId })
      }
    }

    initConnection()
  }, [myConnectionId])

  // Listen for connection updates
  useEffect(() => {
    const channel = supabase
      .channel('connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `connection_id=eq.${myConnectionId}`,
        },
        (payload) => {
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