import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { Heart, Link, Copy, CheckCircle } from "lucide-react";
import { hapticFeedback } from "@/services/mobile";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useConnection } from "@/hooks/useConnection";

interface ScrollConnectionProps {
  className?: string;
  connectionId: string;
  onConnect?: (partnerId: string) => void;
}

// Enhanced connection validation
const isValidUUID = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)
}

const ScrollConnection = memo(({ className, connectionId, onConnect }: ScrollConnectionProps) => {
  const [myLink, setMyLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isConnected, partnerId, connectWith, isLoading } = useConnection(connectionId);
  const processedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Enhanced validation with memoization
  const isValidConnection = useMemo(() => {
    return connectionId && connectionId.length > 0 && isValidUUID(connectionId)
  }, [connectionId])

  // Generate connection link with enhanced safety checks
  useEffect(() => {
    if (isValidConnection && typeof window !== 'undefined') {
      try {
        const currentUrl = window.location.origin;
        const encodedConnectionId = encodeURIComponent(connectionId);
        setMyLink(`${currentUrl}?connect=${encodedConnectionId}`);
      } catch (error) {
        console.error('Error generating connection link:', error);
        setMyLink('');
      }
    } else {
      setMyLink('');
    }
  }, [connectionId, isValidConnection]);

  // Enhanced URL parameter processing with better error handling
  useEffect(() => {
    if (!isValidConnection || processedRef.current || typeof window === 'undefined') {
      return;
    }
    
    const processUrlConnection = async () => {
      try {
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
      // Clear all timers and refs
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Execute any cleanup functions
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
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!isValidConnection) {
      toast({
        title: "Geçersiz bağlantı",
        description: "Lütfen önce geçerli bir hesapla giriş yapın",
        variant: "destructive",
      });
      return;
    }

    if (!myLink) {
      toast({
        title: "Link oluşturulamadı",
        description: "Bağlantı linki henüz hazır değil",
        variant: "destructive",
      });
      return;
    }

    try {
      await hapticFeedback.light();
      
      // Enhanced clipboard handling with fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(myLink);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = myLink;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      
      // Clear existing timer if any
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Auto-reset copied state
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 3000);
      
      toast({
        title: "Link kopyalandı! 💕",
        description: "Bu linki sevgilinle paylaş",
      });
      
    } catch (err) {
      console.error('Clipboard error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      
      toast({
        title: "Link kopyalanamadı",
        description: `Hata: ${errorMessage}. Lütfen manuel olarak kopyala`,
        variant: "destructive",
      });
    }
  }, [isValidConnection, myLink, toast]);

  return (
    <div className={cn("text-center", className)}>
      {/* Enhanced campfire button with improved accessibility and visual feedback */}
      <div 
        onClick={handleCopyLink}
        className={cn(
          "w-32 h-32 cursor-pointer group transition-all duration-200 relative rounded-full",
          "focus:outline-none focus:ring-4 focus:ring-orange-300/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isLoading || isProcessing ? "cursor-wait" : "active:scale-95"
        )}
        title={isValidConnection ? "Kampateş'a tıkla ve bağlantı linkini kopyala" : "Geçersiz bağlantı"}
        role="button"
        tabIndex={0}
        aria-label="Bağlantı linkini kopyala"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopyLink();
          }
        }}
      >
        {/* Enhanced magical flame glow with better performance */}
        <div 
          className={cn(
            "absolute inset-2 rounded-full transition-all duration-500",
            isValidConnection 
              ? "bg-orange-300/15 animate-pulse" 
              : "bg-gray-400/10"
          )}
          style={{ 
            imageRendering: 'pixelated' as const
          }}
        />
        <div 
          className={cn(
            "absolute inset-4 rounded-full transition-all duration-500",
            isValidConnection 
              ? "bg-yellow-200/12 animate-pulse" 
              : "bg-gray-300/8"
          )}
          style={{ 
            imageRendering: 'pixelated' as const, 
            animationDelay: '1s'
          }}
        />
        
        {/* Enhanced click ripple effect */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full transition-opacity",
            "opacity-0 group-active:opacity-100 group-active:animate-ping",
            isValidConnection ? "bg-orange-300/50" : "bg-gray-400/30"
          )}
        />
        
        {/* Enhanced hover effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className={cn(
            "absolute inset-0 rounded-full opacity-20 blur-xl animate-pulse",
            isValidConnection ? "bg-orange-400" : "bg-gray-400"
          )}></div>
          <div className={cn(
            "absolute inset-0 rounded-full opacity-15 blur-lg animate-pulse delay-200",
            isValidConnection ? "bg-yellow-300" : "bg-gray-300"
          )}></div>
        </div>
        
        {/* Visual status indicators */}
        {(isLoading || isProcessing) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {copied && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Kopyalandı!
            </div>
          </div>
        )}
      </div>
      
      {/* Connection status text */}
      {isValidConnection && (
        <div className="mt-4 text-sm text-white/80">
          {isConnected 
            ? "✅ Bağlantı kuruldu!" 
            : isLoading || isProcessing 
              ? "🔄 Bağlantı kuruluyor..." 
              : "🔥 Kampateş'e tıkla"}
        </div>
      )}
    </div>
  );
});

export { ScrollConnection };
export default ScrollConnection;