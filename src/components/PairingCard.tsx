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
      {/* 16-bit Pixel Campfire - Görseldeki gibi */}
      <div 
        onClick={handleCopyLink}
        className="relative w-36 h-36 mx-auto cursor-pointer group transition-transform hover:scale-105"
      >
        {/* Ground/Base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-amber-900 border-2 border-amber-800"></div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-amber-800 border border-amber-700"></div>
        
        {/* Stone Circle */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-gray-600 border border-gray-700 rounded-sm"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-x-8 w-3 h-3 bg-gray-500 border border-gray-600"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-x-8 w-3 h-3 bg-gray-500 border border-gray-600"></div>
        
        {/* Log arrangement - Star pattern like in image */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-amber-700 border border-amber-800"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 rotate-45 w-14 h-3 bg-amber-600 border border-amber-700"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -rotate-45 w-14 h-3 bg-amber-600 border border-amber-700"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 rotate-90 w-12 h-3 bg-amber-700 border border-amber-800"></div>
        
        {/* Center Fire Base */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-red-700 border border-red-800"></div>
        
        {/* Main Flame Layers - Pixel perfect */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-red-600 border-2 border-red-700 animate-pulse"></div>
        <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-6 h-10 bg-orange-500 border border-orange-600"></div>
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-yellow-400 border border-yellow-500 animate-pulse delay-100"></div>
        
        {/* Side Flames */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 -translate-x-3 w-4 h-8 bg-red-500 border border-red-600 animate-bounce delay-200"></div>
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 translate-x-3 w-4 h-6 bg-orange-400 border border-orange-500 animate-pulse delay-300"></div>
        
        {/* Flame Tips */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-yellow-300 border border-yellow-400 animate-ping"></div>
        <div className="absolute bottom-18 left-1/2 transform -translate-x-1/2 -translate-x-1 w-2 h-3 bg-yellow-200 animate-pulse delay-400"></div>
        <div className="absolute bottom-18 left-1/2 transform -translate-x-1/2 translate-x-1 w-2 h-3 bg-orange-300 animate-bounce delay-500"></div>
        
        {/* Flying Sparks */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 translate-x-4 w-1 h-1 bg-yellow-200 animate-ping delay-600"></div>
        <div className="absolute bottom-26 left-1/2 transform -translate-x-1/2 -translate-x-3 w-1 h-1 bg-orange-300 animate-ping delay-800"></div>
        <div className="absolute bottom-22 left-1/2 transform -translate-x-1/2 translate-x-2 w-1 h-1 bg-yellow-100 animate-pulse delay-1000"></div>
        
        {/* Glow Effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-28 h-12 bg-orange-400 opacity-15 blur-md animate-pulse"></div>
        
        {/* Interactive Hover Effect */}
        <div className="absolute inset-0 bg-yellow-300 opacity-0 group-hover:opacity-5 transition-all duration-300 border-2 border-transparent group-hover:border-yellow-400 group-hover:shadow-[0_0_20px_rgba(255,193,7,0.3)]"></div>
      </div>
    </div>
  );
};