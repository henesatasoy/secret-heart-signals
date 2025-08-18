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
      {/* Organic Campfire - Görseldeki gibi */}
      <div 
        onClick={handleCopyLink}
        className="relative w-40 h-40 mx-auto cursor-pointer group transition-transform hover:scale-105"
      >
        {/* Ground Base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-8 bg-gradient-to-t from-amber-900 to-amber-800 rounded-full opacity-80"></div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gradient-to-t from-amber-800 to-amber-700 rounded-full opacity-60"></div>
        
        {/* Stone Circle */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -translate-x-10 w-4 h-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 translate-x-10 w-4 h-4 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 -translate-x-6 translate-y-1 w-3 h-3 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full"></div>
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 translate-x-6 translate-y-1 w-3 h-3 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full"></div>
        
        {/* Log arrangement - Star pattern */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full"></div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 rotate-45 w-18 h-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-full"></div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 -rotate-45 w-18 h-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-full"></div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 rotate-90 w-16 h-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full"></div>
        
        {/* Fire Base - Glowing center */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-gradient-to-t from-red-800 to-red-600 rounded-full"></div>
        
        {/* Main Flame Layers - Organic shapes */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-full animate-pulse opacity-90"></div>
        <div className="absolute bottom-18 left-1/2 transform -translate-x-1/2 w-10 h-14 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-full opacity-80"></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-yellow-400 via-yellow-200 to-white rounded-full animate-pulse delay-100 opacity-70"></div>
        
        {/* Dancing Side Flames */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 -translate-x-4 w-6 h-12 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-full animate-bounce delay-200 opacity-75"></div>
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 translate-x-4 w-6 h-10 bg-gradient-to-t from-orange-500 via-yellow-400 to-yellow-200 rounded-full animate-pulse delay-300 opacity-75"></div>
        
        {/* Flickering Tips */}
        <div className="absolute bottom-26 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-yellow-300 to-white rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 -translate-x-2 w-3 h-5 bg-gradient-to-t from-yellow-200 to-white rounded-full animate-pulse delay-400 opacity-50"></div>
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 translate-x-2 w-3 h-5 bg-gradient-to-t from-orange-300 to-yellow-100 rounded-full animate-bounce delay-500 opacity-50"></div>
        
        {/* Flying Sparks */}
        <div className="absolute bottom-30 left-1/2 transform -translate-x-1/2 translate-x-6 w-2 h-2 bg-yellow-200 rounded-full animate-ping delay-600"></div>
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 -translate-x-5 w-2 h-2 bg-orange-300 rounded-full animate-ping delay-800"></div>
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 translate-x-3 w-1 h-1 bg-yellow-100 rounded-full animate-pulse delay-1000"></div>
        
        {/* Warm Glow Effect */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-orange-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-yellow-300 rounded-full opacity-15 blur-lg animate-pulse delay-200"></div>
        
        {/* Interactive Hover Effect */}
        <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(255,193,7,0.4)]"></div>
      </div>
    </div>
  );
};