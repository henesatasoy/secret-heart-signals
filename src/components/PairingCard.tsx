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
    <div className={cn("pixel-card", className)}>
      <div className="text-center mb-4">
        <Heart className="h-8 w-8 mx-auto text-primary mb-2 pixel-glow" />
        <h2 className="text-lg pixel-font-bold text-ink mb-2">Bağlan</h2>
      </div>

      <div className="space-y-4">
        {/* My Link */}
        <div className="text-center p-3 bg-pixel-sunset/20 border border-primary">
          <p className="text-xs pixel-font text-muted-foreground mb-1">Paylaşım Linkin</p>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Link className="h-4 w-4 text-primary" />
            <span className="text-xs pixel-font text-primary">Sevgilinle paylaş</span>
          </div>
          <button onClick={handleCopyLink} className="pixel-button text-sm w-full">
            {copied ? "✓ Kopyalandı" : "📋 Linki Kopyala"}
          </button>
        </div>

        <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded">
          <p className="text-sm pixel-font text-muted-foreground mb-2">
            Sevgilinin sana gönderdiği linke tıkla veya bu sayfayı ziyaret ettiğinde otomatik bağlanacaksınız! 💕
          </p>
        </div>
      </div>
    </div>
  );
};