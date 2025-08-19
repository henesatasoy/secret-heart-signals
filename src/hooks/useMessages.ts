import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { isValidUUID } from '@/hooks/useConnectionValidation'

export interface Message {
  id: string
  from_connection_id: string
  to_connection_id: string
  message: string
  mood: string
  created_at: string
}

interface MessagesState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  lastSentMessage: string | null
}

export const useMessages = (myConnectionId: string, partnerId: string | null) => {
  const [state, setState] = useState<MessagesState>({
    messages: [],
    isLoading: false,
    error: null,
    lastSentMessage: null
  })
  const { toast } = useToast()

  // Enhanced validation using centralized utility
  const isValidConnection = myConnectionId && myConnectionId.length > 0 && isValidUUID(myConnectionId)
  const isValidPartner = partnerId && partnerId.length > 0 && isValidUUID(partnerId)

  // Load existing messages with enhanced error handling and caching
  useEffect(() => {
    if (!isValidConnection || !isValidPartner) {
      setState(prev => ({ ...prev, messages: [], error: null }))
      return
    }

    const loadMessages = async (retryCount = 0) => {
      console.log('Loading messages between', myConnectionId, 'and', partnerId);
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      try {
        // Validate session before making request
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session) {
          console.error('💥 Session validation failed for messages:', sessionError)
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: 'Session geçersiz - lütfen tekrar giriş yapın'
          }))
          return
        }
        
        // Enhanced query with better error handling and SQL injection prevention
        const { data, error } = await supabase
          .from('messages')
          .select('id, from_connection_id, to_connection_id, message, mood, created_at')
          .or(`and(from_connection_id.eq."${myConnectionId}",to_connection_id.eq."${partnerId}"),and(from_connection_id.eq."${partnerId}",to_connection_id.eq."${myConnectionId}")`)
          .order('created_at', { ascending: true })
          .limit(1000) // Prevent loading too many messages at once

        if (error) {
          console.error('Error loading messages:', error);
          
          // Enhanced retry logic
          if (retryCount < 3 && (
            error.message.includes('network') || 
            error.message.includes('timeout') ||
            error.message.includes('connection')
          )) {
            console.log(`Retrying message load, attempt ${retryCount + 1}`);
            setTimeout(() => loadMessages(retryCount + 1), Math.min(1000 * Math.pow(2, retryCount), 5000));
            return;
          }
          
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: `Mesajlar yüklenemedi: ${error.message}`
          }))
          
          toast({
            title: "Mesajlar yüklenemedi",
            description: "Bağlantınızı kontrol edip tekrar deneyin",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          console.log('Loaded', data.length, 'messages');
          // Validate message structure
          const validMessages = data.filter((msg): msg is Message => 
            msg && 
            typeof msg.id === 'string' &&
            typeof msg.from_connection_id === 'string' &&
            typeof msg.to_connection_id === 'string' &&
            typeof msg.message === 'string' &&
            typeof msg.mood === 'string' &&
            typeof msg.created_at === 'string'
          )
          
          setState(prev => ({ 
            ...prev, 
            messages: validMessages,
            isLoading: false,
            error: null
          }))
        }
      } catch (error) {
        console.error('Message loading error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
        
        if (retryCount < 3) {
          console.log(`Retrying message load due to exception, attempt ${retryCount + 1}`);
          setTimeout(() => loadMessages(retryCount + 1), Math.min(1000 * Math.pow(2, retryCount), 5000));
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: `Sistem hatası: ${errorMessage}`
          }))
          
          toast({
            title: "Mesajlar yüklenemedi",
            description: "Sistem hatası oluştu",
            variant: "destructive"
          });
        }
      }
    }

    loadMessages()
  }, [myConnectionId, partnerId, isValidConnection, isValidPartner, toast])

  // Listen for new messages with improved filtering and deduplication
  useEffect(() => {
    if (!isValidConnection || !isValidPartner) return

    console.log('Setting up message listener between', myConnectionId, 'and', partnerId);

    // Use a unique channel name to prevent conflicts
    const channelName = `messages_${[myConnectionId, partnerId].sort().join('_')}`
    
    // Set to track processed message IDs to prevent duplicates
    const processedMessageIds = new Set<string>()

    const channel = supabase
      .channel(channelName)
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
          
          // Enhanced validation and deduplication
          if (newMessage && 
              newMessage.from_connection_id === partnerId &&
              !processedMessageIds.has(newMessage.id)) {
            
            processedMessageIds.add(newMessage.id)
            
            setState(prev => {
              // Double-check for duplicates
              if (prev.messages.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              
              return {
                ...prev,
                messages: [...prev.messages, newMessage].sort((a, b) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
              };
            })
            
            // Only show toast if user is not on messages page
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/messages') &&
                newMessage.message && newMessage.message.trim()) {
              toast({
                title: "Yeni mesaj! 💕",
                description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? '...' : ''),
              })
            }
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
          
          // Enhanced validation for sent messages
          if (newMessage && 
              newMessage.to_connection_id === partnerId &&
              !processedMessageIds.has(newMessage.id)) {
            
            processedMessageIds.add(newMessage.id)
            
            setState(prev => {
              // Double-check for duplicates
              if (prev.messages.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              
              return {
                ...prev,
                messages: [...prev.messages, newMessage].sort((a, b) => 
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                ),
                lastSentMessage: newMessage.id
              };
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Message listener status:', status)
        if (status === 'CHANNEL_ERROR') {
          setState(prev => ({ 
            ...prev, 
            error: 'Mesaj dinleyici hatası' 
          }))
        }
      })

    return () => {
      console.log('Cleaning up message listener');
      processedMessageIds.clear()
      channel.unsubscribe()
    }
  }, [myConnectionId, partnerId, isValidConnection, isValidPartner, toast])

  const sendMessage = useCallback(async (message: string, mood: string) => {
    if (!isValidConnection || !isValidPartner) {
      console.error('Cannot send message: missing valid connection or partnerId');
      setState(prev => ({ 
        ...prev, 
        error: 'Geçersiz bağlantı - mesaj gönderilemedi'
      }))
      return false;
    }

    // Input validation
    if (!message || message.trim().length === 0) {
      toast({
        title: "Boş mesaj",
        description: "Lütfen bir mesaj yazın",
        variant: "destructive"
      });
      return false;
    }

    if (message.length > 1000) {
      toast({
        title: "Mesaj çok uzun",
        description: "Mesajınız 1000 karakterden kısa olmalı",
        variant: "destructive"
      });
      return false;
    }

    // Rate limiting check
    const now = Date.now()
    const lastSentTime = parseInt(localStorage.getItem('lastMessageTime') || '0')
    if (now - lastSentTime < 500) { // 500ms cooldown
      toast({
        title: "Çok hızlı",
        description: "Lütfen biraz bekleyin",
        variant: "destructive"
      });
      return false;
    }

    const sanitizedMessage = message.trim().substring(0, 1000) // Sanitize and limit
    const validMood = ['happy', 'romantic', 'silly', 'sleepy'].includes(mood) ? mood : 'romantic'

    console.log('Sending message from', myConnectionId, 'to', partnerId, ':', sanitizedMessage);

    try {
      // Validate session before sending message
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        console.error('💥 Session validation failed for message send:', sessionError)
        setState(prev => ({ 
          ...prev, 
          error: 'Session geçersiz - lütfen tekrar giriş yapın'
        }))
        return false
      }
      
      setState(prev => ({ ...prev, error: null }))
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_connection_id: myConnectionId,
          to_connection_id: partnerId,
          message: sanitizedMessage,
          mood: validMood
        })
        .select()

      if (error) {
        console.error('Send message error:', error);
        setState(prev => ({ 
          ...prev, 
          error: `Mesaj gönderilemedi: ${error.message}`
        }))
        
        toast({
          title: "Mesaj gönderilemedi",
          description: `Hata: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      // Update last sent time for rate limiting
      localStorage.setItem('lastMessageTime', now.toString())
      
      console.log('Message sent successfully:', data);
      return true;
      
    } catch (error) {
      console.error('Send message error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      
      setState(prev => ({ 
        ...prev, 
        error: `Mesaj gönderme hatası: ${errorMessage}`
      }))
      
      toast({
        title: "Mesaj gönderilemedi",
        description: errorMessage,
        variant: "destructive"
      })
      return false;
    }
  }, [isValidConnection, isValidPartner, myConnectionId, partnerId, toast])

  return { 
    messages: state.messages, 
    isLoading: state.isLoading,
    error: state.error,
    sendMessage 
  }
}