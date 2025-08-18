import { useState } from "react";
import { Heart, Users, Copy, Check } from "lucide-react";
import { RomanticButton } from "@/components/ui/romantic-button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PairingCardProps {
  className?: string;
}

export const PairingCard = ({ className }: PairingCardProps) => {
  const [pairCode, setPairCode] = useState("");
  const [myCode] = useState("LOVE2024");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Code copied! 💕",
        description: "Share this code with your special someone",
      });
    } catch (err) {
      toast({
        title: "Couldn't copy code",
        description: "Please copy it manually: " + myCode,
        variant: "destructive",
      });
    }
  };

  const handlePair = () => {
    if (!pairCode.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter your partner's code to connect",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Connection successful! 💕",
      description: "You're now connected with your special someone",
    });
  };

  return (
    <div className={cn("romantic-card", className)}>
      <div className="text-center mb-6">
        <div className="mb-4 flex justify-center">
          <div className="p-4 rounded-3xl bg-gradient-romantic glow-effect">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-title font-semibold text-foreground mb-2">
          Connect with Your Love
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Share your unique code or enter theirs to start your intimate communication
        </p>
      </div>

      <div className="space-y-6">
        {/* My Code Section */}
        <div className="text-center p-4 rounded-2xl bg-gradient-soft border border-border">
          <p className="text-sm text-muted-foreground mb-2">Your Code</p>
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl font-bold text-primary tracking-wider">
              {myCode}
            </span>
            <RomanticButton
              variant="ghost"
              size="icon"
              onClick={handleCopyCode}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </RomanticButton>
          </div>
        </div>

        {/* Pair Code Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Enter Partner's Code
          </label>
          <input
            type="text"
            value={pairCode}
            onChange={(e) => setPairCode(e.target.value.toUpperCase())}
            placeholder="LOVE####"
            className="romantic-input text-center text-lg font-semibold tracking-wider"
            maxLength={8}
          />
        </div>

        <RomanticButton
          variant="romantic"
          size="lg"
          onClick={handlePair}
          className="w-full"
        >
          <Heart className="h-5 w-5 mr-2 animate-heart-beat" />
          Connect Hearts
        </RomanticButton>
      </div>
    </div>
  );
};