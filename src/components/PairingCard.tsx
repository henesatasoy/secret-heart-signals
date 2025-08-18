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
      {/* 16-bit Pixel Campfire */}
      <div 
        onClick={handleCopyLink}
        className="relative w-32 h-32 mx-auto cursor-pointer group transition-transform hover:scale-110"
      >
        {/* Base Logs - 16bit chunky style */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-amber-800 border-2 border-amber-900"></div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-x-2 w-16 h-3 bg-amber-700 border border-amber-800"></div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 -translate-x-2 w-14 h-3 bg-amber-700 border border-amber-800"></div>
        
        {/* Main Flame - Pixelated */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-16 bg-red-600 border-2 border-red-700 animate-pulse"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-orange-500 border border-orange-600"></div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-yellow-400 border border-yellow-500 animate-pulse delay-100"></div>
        
        {/* Side Flames - 16bit blocks */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -translate-x-4 w-4 h-10 bg-red-500 border border-red-600 animate-bounce delay-200"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 translate-x-4 w-4 h-8 bg-orange-400 border border-orange-500 animate-pulse delay-300"></div>
        
        {/* Top Flame Tips - Pixelated */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-yellow-300 border border-yellow-400 animate-ping"></div>
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 -translate-x-2 w-2 h-3 bg-yellow-200 animate-pulse delay-400"></div>
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 translate-x-2 w-2 h-3 bg-orange-300 animate-bounce delay-500"></div>
        
        {/* 16bit Sparks */}
        <div className="absolute bottom-18 left-1/2 transform -translate-x-1/2 translate-x-6 w-1 h-1 bg-yellow-200 animate-ping delay-600"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 -translate-x-5 w-1 h-1 bg-orange-300 animate-ping delay-800"></div>
        <div className="absolute bottom-19 left-1/2 transform -translate-x-1/2 translate-x-3 w-1 h-1 bg-yellow-100 animate-pulse delay-1000"></div>
        
        {/* 16bit Glow Effect - Chunky */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-orange-400 opacity-20 blur-sm animate-pulse"></div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-orange-300 opacity-0 group-hover:opacity-10 transition-opacity duration-200 border-2 border-transparent group-hover:border-orange-500"></div>
      </div>
    </div>
  );
};