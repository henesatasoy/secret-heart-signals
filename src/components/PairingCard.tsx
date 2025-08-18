import { useState } from "react";
import { Heart, Users, Copy, Check, Scroll } from "lucide-react";
import { MedievalButton } from "@/components/ui/romantic-button";
import { hapticFeedback } from "@/services/mobile";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ScrollConnectionProps {
  className?: string;
  onConnect?: () => void;
}

export const ScrollConnection = ({ className, onConnect }: ScrollConnectionProps) => {
  const [pairCode, setPairCode] = useState("");
  const [myCode] = useState("AŞIK2024");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async () => {
    await hapticFeedback.light();
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Kod kopyalandı! 💕",
        description: "Bu kodu sevgilinle paylaş",
      });
    } catch (err) {
      toast({
        title: "Kod kopyalanamadı",
        description: "Lütfen manuel olarak kopyala: " + myCode,
        variant: "destructive",
      });
    }
  };

  const handlePair = async () => {
    if (!pairCode.trim()) {
      await hapticFeedback.light();
      toast({
        title: "Kod gir",
        description: "Lütfen sevgilinin kodunu gir",
        variant: "destructive",
      });
      return;
    }
    
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
        {/* My Code */}
        <div className="text-center p-3 bg-pixel-sunset/20 border border-primary">
          <p className="text-xs pixel-font text-muted-foreground mb-1">Kodun</p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg pixel-font-bold text-primary">{myCode}</span>
            <button onClick={handleCopyCode} className="pixel-button text-xs p-1">
              {copied ? "✓" : "📋"}
            </button>
          </div>
        </div>

        {/* Input */}
        <input
          type="text"
          value={pairCode}
          onChange={(e) => setPairCode(e.target.value.toUpperCase())}
          placeholder="Kod Gir"
          className="pixel-input w-full text-center pixel-font"
          maxLength={8}
        />

        <button onClick={handlePair} className="pixel-button w-full">
          <Heart className="h-4 w-4 inline mr-1" />
          Birleş
        </button>
      </div>
    </div>
  );
};