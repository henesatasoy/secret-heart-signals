import { useState, useEffect, useRef, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
// useConnection import'u kaldırıldı - props üzerinden geliyor
import { useConnectionLink } from "@/hooks/useConnectionLink";
import { useClipboard } from "@/hooks/useClipboard";
import { CampfireButton } from "@/components/connection/CampfireButton";
import { ConnectionStatusDisplay } from "@/components/connection/ConnectionStatusDisplay";
import { isValidUUID } from "@/hooks/useConnectionValidation";
import { supabase } from "@/integrations/supabase/client";

interface ScrollConnectionProps {
  className?: string;
  connectionId: string;
  onConnect?: (partnerId: string) => void;
  // Propslar üzerinden connection state'i al
  isConnected: boolean;
  partnerId: string | null;
  connectWith: (partnerId: string) => Promise<void>;
  isLoading: boolean;
}

const ScrollConnection = memo(({ 
  className, 
  connectionId, 
  onConnect,
  isConnected,
  partnerId,
  connectWith,
  isLoading 
}: ScrollConnectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  // useConnection hook'unu kaldır - props'tan al
  const { connectionLink, isValidConnection } = useConnectionLink(connectionId);
  const { copied, copyToClipboard, cleanup } = useClipboard();
  const processedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Enhanced URL parameter processing with better error handling
  useEffect(() => {
    if (!isValidConnection || processedRef.current || typeof window === 'undefined') {
      return;
    }
    
  const processUrlConnection = async () => {
      try {
        // Validate session before processing URL connection
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session) {
          console.error('💥 Session validation failed for URL processing:', sessionError)
          toast({
            title: "Oturum geçersiz",
            description: "Lütfen tekrar giriş yapın",
            variant: "destructive"
          });
          return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const connectId = urlParams.get('connect');
        
        if (!connectId) return;
        
        // Decode and validate connection ID
        const decodedConnectId = decodeURIComponent(connectId);
        
        // Enhanced validation
        if (!isValidUUID(decodedConnectId)) {
          console.warn('Invalid connection ID format:', decodedConnectId);
          toast({
            title: "Geçersiz bağlantı kodu",
            description: "Bağlantı kodu formatı yanlış",
            variant: "destructive"
          });
          return;
        }
        
        // Prevent self-connection
        if (decodedConnectId === connectionId) {
          console.warn('Attempted self-connection');
          toast({
            title: "Geçersiz bağlantı",
            description: "Kendinizle bağlantı kuramazsınız",
            variant: "destructive"
          });
          return;
        }
        
        console.log('URL connection request detected, attempting to connect:', decodedConnectId);
        processedRef.current = true; // Mark as processed
        setIsProcessing(true);
        
        try {
          await connectWith(decodedConnectId);
        } catch (error) {
          console.error('Connection failed:', error);
          processedRef.current = false; // Allow retry
          setIsProcessing(false);
        }
        
      } catch (error) {
        console.error('URL processing error:', error);
        toast({
          title: "URL işleme hatası",
          description: "Bağlantı URL'si işlenirken hata oluştu",
          variant: "destructive"
        });
      } finally {
        // Clean up URL parameter safely
        try {
          if (typeof window !== 'undefined' && window.history) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (historyError) {
          console.warn('History API error:', historyError);
        }
      }
    }
    
    processUrlConnection();
  }, [isValidConnection, connectionId, connectWith, toast])

  // Notify parent when connection is established with validation
  useEffect(() => {
    if (isConnected && partnerId && isValidUUID(partnerId)) {
      try {
        onConnect?.(partnerId);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error notifying parent component:', error);
      }
    }
  }, [isConnected, partnerId, onConnect]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      // Execute cleanup functions
      cleanup();
      
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch (error) {
          console.warn('Cleanup function error:', error);
        }
      }
      
      // Reset processing state
      setIsProcessing(false);
    };
  }, [cleanup]);

  const handleCopyLink = useCallback(async () => {
    if (!isValidConnection) {
      toast({
        title: "Geçersiz bağlantı",
        description: "Lütfen önce geçerli bir hesapla giriş yapın",
        variant: "destructive",
      });
      return;
    }

    if (!connectionLink) {
      toast({
        title: "Link oluşturulamadı",
        description: "Bağlantı linki henüz hazır değil",
        variant: "destructive",
      });
      return;
    }

    await copyToClipboard(connectionLink, {
      successTitle: "Link kopyalandı! 💕",
      successDescription: "Bu linki sevgilinle paylaş",
      errorTitle: "Link kopyalanamadı",
      errorDescription: "Lütfen manuel olarak kopyala"
    });
  }, [isValidConnection, connectionLink, copyToClipboard, toast]);

  return (
    <div className={cn("text-center", className)}>
      <CampfireButton 
        onClick={handleCopyLink}
        isValidConnection={isValidConnection}
        isLoading={isLoading}
        isProcessing={isProcessing}
        copied={copied}
        disabled={!isValidConnection || !connectionLink}
      />
      
      <ConnectionStatusDisplay 
        isValidConnection={isValidConnection}
        isConnected={isConnected}
        isLoading={isLoading}
        isProcessing={isProcessing}
        connectionId={connectionId}
      />
    </div>
  );
});

export { ScrollConnection };
export default ScrollConnection;