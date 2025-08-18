import { useState, useEffect } from "react";
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

  // Only initialize if we have a valid connectionId (user is logged in)
  const isValid = connectionId && connectionId.length > 0;

  useEffect(() => {
    if (isValid) {
      const currentUrl = window.location.origin;
      setMyLink(`${currentUrl}?connect=${connectionId}`);
    }
  }, [connectionId, isValid]);

  // Check if someone is trying to connect via URL parameter
  useEffect(() => {
    if (!isValid) {
      console.log('URL parameter check skipped - invalid connection ID');
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const connectId = urlParams.get('connect');
    
    console.log('URL parameter check:', { connectId, myConnectionId: connectionId });
    
    if (connectId && connectId !== connectionId) {
      console.log('URL connection request detected, attempting to connect:', connectId);
      connectWith(connectId);
      
      // Clean up URL after attempting connection
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (connectId === connectionId) {
      console.log('Self-connection detected, ignoring');
    } else {
      console.log('No connection parameter in URL');
    }
  }, [connectionId, connectWith, isValid]);

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
      {/* 16bit cozy campfire connection button */}
      <button 
        onClick={handleCopyLink}
        className="w-20 h-20 mx-auto mb-3 bg-gradient-to-b from-orange-300 to-red-500 border-4 border-orange-800 rounded-none shadow-[6px_6px_0px_0px_rgba(154,52,18,1)] hover:shadow-[3px_3px_0px_0px_rgba(154,52,18,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center relative overflow-hidden active:shadow-none active:translate-x-1.5 active:translate-y-1.5"
      >
        {/* 16bit fire layers */}
        <div className="absolute inset-2 bg-gradient-to-t from-red-700 via-orange-500 to-yellow-300 border border-orange-900"></div>
        <div className="absolute inset-3 bg-gradient-to-t from-red-600 via-orange-400 to-yellow-200"></div>
        <div className="relative z-10">
          {copied ? (
            <span className="text-white text-xl font-bold drop-shadow-lg">✓</span>
          ) : (
            <Link className="h-6 w-6 text-white drop-shadow-lg" />
          )}
        </div>
      </button>

      {/* 16bit cozy text */}
      <div className="text-center">
        <p className="text-sm font-bold text-amber-100 bg-gradient-to-b from-amber-900 to-amber-800 border-2 border-amber-700 rounded-none px-4 py-2 shadow-[3px_3px_0px_0px_rgba(120,53,15,1)]">
          {copied ? "🔥 Kopyalandı!" : "🔥 Ateşe dokun"}
        </p>
      </div>
    </div>
  );
};