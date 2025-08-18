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

  useEffect(() => {
    const currentUrl = window.location.origin;
    setMyLink(`${currentUrl}?connect=${connectionId}`);
  }, [connectionId]);

  // Check if someone is trying to connect via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connectId = urlParams.get('connect');
    if (connectId && connectId !== connectionId) {
      connectWith(connectId);
    }
  }, [connectionId, connectWith]);

  // Notify parent when connection is established
  useEffect(() => {
    if (isConnected && partnerId) {
      onConnect?.(partnerId);
    }
  }, [isConnected, partnerId, onConnect]);

  const handleCopyLink = async () => {
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
    <div className={cn("relative", className)}>
      {/* Fire-like connection button */}
      <div className="w-20 h-20 mx-auto mb-4 relative">
        <button 
          onClick={handleCopyLink}
          className="w-full h-full rounded-full bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 border-2 border-orange-300 shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
        >
          {/* Fire effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 opacity-80 animate-pulse"></div>
          <div className="relative z-10">
            {copied ? (
              <span className="text-white text-lg">✓</span>
            ) : (
              <Link className="h-6 w-6 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Floating text near the fire */}
      <div className="text-center">
        <p className="text-sm text-white/90 bg-black/30 rounded-lg px-3 py-1 backdrop-blur-sm mb-2">
          {copied ? "Link kopyalandı! 🔥" : "Ateşe dokunarak sevgilinle bağlan 🔥"}
        </p>
        
        {!copied && (
          <p className="text-xs text-white/70 bg-black/20 rounded px-2 py-1 backdrop-blur-sm">
            Linki kopyala ve sevgiline gönder
          </p>
        )}
      </div>
    </div>
  );
};