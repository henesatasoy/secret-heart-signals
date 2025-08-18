import { useState } from "react";
import { Heart, Users, Copy, Check, Scroll } from "lucide-react";
import { MedievalButton } from "@/components/ui/romantic-button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ScrollConnectionProps {
  className?: string;
}

export const ScrollConnection = ({ className }: ScrollConnectionProps) => {
  const [pairCode, setPairCode] = useState("");
  const [myCode] = useState("AŞIK2024");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async () => {
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

  const handlePair = () => {
    if (!pairCode.trim()) {
      toast({
        title: "Kod gir",
        description: "Lütfen sevgilinin kodunu gir",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Bağlantı başarılı! 💕",
      description: "Artık sevgilinle bağlısın",
    });
  };

  return (
    <div className={cn("scroll-card relative", className)}>
      <div className="text-center mb-6">
        <div className="mb-4 flex justify-center">
          <div className="wax-seal">
            <Scroll className="absolute inset-0 m-auto h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-scroll font-bold text-ink mb-2 handwritten text-2xl">
          Sevgilinle Bağlan
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Kendi kodunu paylaş veya onunkini gir, samimi iletişiminizi başlat
        </p>
      </div>

      <div className="space-y-6">
        {/* My Code Section */}
        <div className="text-center p-4 rounded-lg bg-gradient-parchment border-2 border-primary/30">
          <p className="text-sm text-muted-foreground mb-2 handwritten">Senin Kodun</p>
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl font-bold text-primary tracking-wider handwritten">
              {myCode}
            </span>
            <MedievalButton
              variant="ghost"
              size="icon"
              onClick={handleCopyCode}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </MedievalButton>
          </div>
        </div>

        {/* Pair Code Input */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2 handwritten">
            Sevgilinin Kodunu Gir
          </label>
          <input
            type="text"
            value={pairCode}
            onChange={(e) => setPairCode(e.target.value.toUpperCase())}
            placeholder="AŞIK####"
            className="quill-input text-center text-lg font-semibold tracking-wider handwritten"
            maxLength={8}
          />
        </div>

        <MedievalButton
          variant="letter"
          size="lg"
          onClick={handlePair}
          className="w-full"
        >
          <Heart className="h-5 w-5 mr-2 animate-flutter" />
          Kalpleri Birleştir
        </MedievalButton>
      </div>
    </div>
  );
};