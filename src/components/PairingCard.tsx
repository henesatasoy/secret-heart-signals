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
    if (!isValid) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const connectId = urlParams.get('connect');
    if (connectId && connectId !== connectionId) {
      connectWith(connectId);
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
      {/* Fire-like connection button */}
      <button 
        onClick={handleCopyLink}
        className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center relative overflow-hidden animate-pulse"
      >
        {/* Fire effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 opacity-80"></div>
        <div className="relative z-10">
          {copied ? (
            <span className="text-white text-lg font-bold">✓</span>
          ) : (
            <Link className="h-5 w-5 text-white drop-shadow-lg" />
          )}
        </div>
      </button>

      {/* Subtle text */}
      <div className="text-center">
        <p className="text-xs text-white/90 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm">
          {copied ? "🔥 Kopyalandı!" : "🔥 Ateşe dokun"}
        </p>
      </div>
    </div>
  );
};