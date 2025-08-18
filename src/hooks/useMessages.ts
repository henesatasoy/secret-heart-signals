import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Message {
  id: string
  from_connection_id: string
  to_connection_id: string
  message: string
  mood: string
  created_at: string
}

export const useMessages = (myConnectionId: string, partnerId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { toast } = useToast()

  // Load existing messages
  useEffect(() => {
    if (!partnerId) return

    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_connection_id.eq.${myConnectionId},to_connection_id.eq.${partnerId}),and(from_connection_id.eq.${partnerId},to_connection_id.eq.${myConnectionId})`)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
    }

    loadMessages()
  }, [myConnectionId, partnerId])

  // Listen for new messages in both directions
  useEffect(() => {
    if (!partnerId) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(from_connection_id.eq.${myConnectionId},to_connection_id.eq.${partnerId}),and(from_connection_id.eq.${partnerId},to_connection_id.eq.${myConnectionId}))`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
          
          // Show notification only for received messages (not sent by me)
          if (newMessage.from_connection_id !== myConnectionId) {
            toast({
              title: "Yeni mesaj! 💕",
              description: newMessage.message,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [myConnectionId, partnerId])

  const sendMessage = async (message: string, mood: string) => {
    if (!partnerId) return

    try {
      await supabase
        .from('messages')
        .insert({
          from_connection_id: myConnectionId,
          to_connection_id: partnerId,
          message,
          mood
        })

      toast({
        title: "Mesaj gönderildi! 💕",
        description: message,
      })
    } catch (error) {
      console.error('Send message error:', error)
      toast({
        title: "Mesaj gönderilemedi",
        description: "Lütfen tekrar dene",
        variant: "destructive"
      })
    }
  }

  return { messages, sendMessage }
}