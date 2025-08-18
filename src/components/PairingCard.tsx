import { useState, useEffect } from "react";
import { Heart, Link, Copy } from "lucide-react";
import { MedievalButton } from "@/components/ui/romantic-button";
import { hapticFeedback } from "@/services/mobile";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ScrollConnectionProps {
  className?: string;
  onConnect?: () => void;
}

export const ScrollConnection = ({ className, onConnect }: ScrollConnectionProps) => {
  const [myConnectionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [myLink, setMyLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentUrl = window.location.origin;
    setMyLink(`${currentUrl}?connect=${myConnectionId}`);
  }, [myConnectionId]);

  // Check if someone is trying to connect via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connectId = urlParams.get('connect');
    if (connectId && connectId !== myConnectionId) {
      handleConnect();
    }
  }, []);

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

  const handleConnect = async () => {
    await hapticFeedback.heavy();
    onConnect?.();
    toast({
      title: "Bağlantı başarılı! 💕",
      description: "Artık sevgilinle bağlısın",
    });
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