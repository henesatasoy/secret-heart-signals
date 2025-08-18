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
      {/* Animated Campfire */}
      <div 
        onClick={handleCopyLink}
        className="relative w-32 h-32 mx-auto cursor-pointer group"
      >
        {/* Base/Logs */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gradient-to-r from-amber-800 to-amber-900 rounded-full"></div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 rotate-12 w-16 h-4 bg-gradient-to-r from-amber-700 to-amber-800 rounded-full"></div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 -rotate-12 w-14 h-4 bg-gradient-to-r from-amber-700 to-amber-800 rounded-full"></div>
        
        {/* Main Flame */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-20 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-full animate-pulse"></div>
        
        {/* Dancing Flames */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -translate-x-2 w-8 h-16 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 rounded-full animate-bounce delay-75"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 translate-x-2 w-6 h-14 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 rounded-full animate-pulse delay-150"></div>
        
        {/* Flickering Inner Flames */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-gradient-to-t from-yellow-400 to-yellow-100 rounded-full animate-ping"></div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 -translate-x-1 w-4 h-8 bg-gradient-to-t from-yellow-300 to-white rounded-full animate-pulse delay-300"></div>
        
        {/* Glow Effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-orange-400 rounded-full opacity-30 blur-xl animate-pulse"></div>
        
        {/* Sparks */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 translate-x-4 w-1 h-1 bg-yellow-200 rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-18 left-1/2 transform -translate-x-1/2 -translate-x-3 w-1 h-1 bg-orange-300 rounded-full animate-ping delay-700"></div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-orange-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </div>
      
      {/* Status Text */}
      <div className="mt-4">
        <p className="text-sm font-bold text-amber-100 bg-gradient-to-b from-amber-900/80 to-amber-800/80 border-2 border-amber-700 rounded-none px-4 py-2 shadow-[3px_3px_0px_0px_rgba(120,53,15,1)] backdrop-blur-sm">
          {copied ? "🔥 Bağlantı kopyalandı!" : "🔥 Ateşe tıkla ve bağlan"}
        </p>
      </div>
    </div>
  );
};