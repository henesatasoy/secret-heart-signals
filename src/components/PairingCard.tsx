import { useState, useEffect, useRef } from "react";
import { Heart, Link } from "lucide-react";
import { hapticFeedback } from "@/services/mobile";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useConnection } from "@/hooks/useConnection";

interface ScrollConnectionProps {
  className?: string;
  connectionId: string;
  onConnect?: (partnerId: string) => void;
}

export const ScrollConnection = ({ className, connectionId, onConnect }: ScrollConnectionProps) => {
  const [myLink, setMyLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { isConnected, partnerId, connectWith } = useConnection(connectionId);
  const processedRef = useRef(false);

  // Only initialize if we have a valid connectionId (user is logged in)
  const isValid = connectionId && connectionId.length > 0;

  useEffect(() => {
    if (isValid) {
      const currentUrl = window.location.origin;
      setMyLink(`${currentUrl}?connect=${connectionId}`);
    }
  }, [connectionId, isValid]);

  // Check if someone is trying to connect via URL parameter - only once
  useEffect(() => {
    if (!isValid || processedRef.current) {
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const connectId = urlParams.get('connect');
    
    // Only process if there's a connect parameter and it's different from my ID
    if (connectId && connectId !== connectionId) {
      console.log('URL connection request detected, attempting to connect:', connectId);
      processedRef.current = true; // Mark as processed
      
      // Use a separate function to avoid dependency issues
      const processConnection = async () => {
        try {
          await connectWith(connectId);
        } catch (error) {
          console.error('Connection failed:', error);
          processedRef.current = false; // Allow retry
        }
      };
      
      processConnection();
      
      // Clean up URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isValid, connectionId]); // Remove connectWith from dependencies

  // Notify parent when connection is established
  useEffect(() => {
    if (isConnected && partnerId) {
      onConnect?.(partnerId);
    }
  }, [isConnected, partnerId, onConnect]);

  const handleCopyLink = async () => {
    if (!isValid) {
      toast({
        title: "Hata",
        description: "Lütfen önce giriş yapın",
        variant: "destructive",
      });
      return;
    }

    await hapticFeedback.light();
    try {
      await navigator.clipboard.writeText(myLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link kopyalandı! 💕",
        description: "Bu linki sevgilinle paylaş",
      });
    } catch (err) {
      toast({
        title: "Link kopyalanamadı",
        description: "Lütfen manuel olarak kopyala",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("text-center", className)}>
      {/* Magical campfire button with glow effects */}
      <div 
        onClick={handleCopyLink}
        className="w-32 h-32 cursor-pointer group transition-all duration-200 relative rounded-full active:scale-95"
        title="Kateş'a tıkla ve bağlantı linkini kopyala"
      >
        {/* Continuous magical flame glow - always visible */}
        <div 
          className="absolute inset-2 bg-orange-300/15 animate-pulse rounded-full" 
          style={{ 
            imageRendering: 'pixelated'
          }} 
        />
        <div 
          className="absolute inset-4 bg-yellow-200/12 animate-pulse rounded-full" 
          style={{ 
            imageRendering: 'pixelated', 
            animationDelay: '1s'
          }} 
        />
        
        {/* Click ripple effect */}
        <div 
          className="absolute inset-0 bg-orange-300/50 opacity-0 group-active:opacity-100 group-active:animate-ping transition-opacity rounded-full"
        />
        
        {/* Hover enhancement */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute inset-0 bg-orange-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-15 blur-lg animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};