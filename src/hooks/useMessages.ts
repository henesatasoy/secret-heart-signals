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
    if (!partnerId || !myConnectionId) return

    const loadMessages = async () => {
      console.log('Loading messages between', myConnectionId, 'and', partnerId);
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(from_connection_id.eq.${myConnectionId},to_connection_id.eq.${partnerId}),and(from_connection_id.eq.${partnerId},to_connection_id.eq.${myConnectionId})`)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        if (data) {
          console.log('Loaded', data.length, 'messages');
          setMessages(data)
        }
      } catch (error) {
        console.error('Message loading error:', error);
      }
    }

    loadMessages()
  }, [myConnectionId, partnerId])

  // Listen for new messages - optimized filtering
  useEffect(() => {
    if (!partnerId || !myConnectionId) return

    console.log('Setting up message listener between', myConnectionId, 'and', partnerId);

    const channel = supabase
      .channel(`messages_${myConnectionId}_${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_connection_id=eq.${myConnectionId}`,
        },
        (payload) => {
          console.log('Received message for me:', payload);
          const newMessage = payload.new as Message
          
          // Only add if it's from my partner and not already in the array
          if (newMessage.from_connection_id === partnerId) {
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const messageExists = prev.some(msg => msg.id === newMessage.id);
              if (!messageExists) {
                return [...prev, newMessage];
              }
              return prev;
            })
            toast({
              title: "Yeni mesaj! 💕",
              description: newMessage.message,
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `from_connection_id=eq.${myConnectionId}`,
        },
        (payload) => {
          console.log('Sent message confirmed:', payload);
          const newMessage = payload.new as Message
          
          // Only add if it's to my partner and not already in the array
          if (newMessage.to_connection_id === partnerId) {
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const messageExists = prev.some(msg => msg.id === newMessage.id);
              if (!messageExists) {
                return [...prev, newMessage];
              }
              return prev;
            })
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up message listener');
      supabase.removeChannel(channel)
    }
  }, [myConnectionId, partnerId, toast])

  const sendMessage = async (message: string, mood: string) => {
    if (!partnerId || !myConnectionId) {
      console.error('Cannot send message: missing partnerId or myConnectionId');
      return;
    }

    console.log('Sending message from', myConnectionId, 'to', partnerId, ':', message);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          from_connection_id: myConnectionId,
          to_connection_id: partnerId,
          message,
          mood
        })

      if (error) {
        console.error('Send message error:', error);
        toast({
          title: "Mesaj gönderilemedi",
          description: "Error: " + error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Message sent successfully');
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