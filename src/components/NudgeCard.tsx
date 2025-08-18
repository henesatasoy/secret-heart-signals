import { Heart, Sparkles, Moon, Sun, Feather, Scroll, Mail } from "lucide-react";
import { MedievalButton } from "@/components/ui/romantic-button";
import { hapticFeedback, playDoveSound } from "@/services/mobile";
import { cn } from "@/lib/utils";

interface LetterCardProps {
  message: string;
  icon: "heart" | "sparkles" | "moon" | "sun" | "feather" | "scroll";
  mood?: "happy" | "romantic" | "silly" | "sleepy";
  onClick?: () => void;
  className?: string;
}

const iconMap = {
  heart: Heart,
  sparkles: Sparkles,
  moon: Moon,
  sun: Sun,
  feather: Feather,
  scroll: Scroll,
};

const moodColors = {
  happy: "from-primary to-scroll",
  romantic: "from-primary-dark to-primary",
  silly: "from-accent to-primary",
  sleepy: "from-secondary to-ink",
};

export const LetterCard = ({ 
  message, 
  icon, 
  mood = "romantic", 
  onClick, 
  className 
}: LetterCardProps) => {
  const IconComponent = iconMap[icon];
  const gradientClass = moodColors[mood];

  const handleClick = async () => {
    // Play dove sound and haptic feedback
    playDoveSound();
    await hapticFeedback.doveTap();
    
    onClick?.();
  };

  return (
    <button 
      className={cn("pixel-card hover:scale-105 transition-all duration-200 min-h-[80px] flex items-center justify-center", className)} 
      onClick={handleClick}
    >
      <div className="text-center">
        <div className="text-2xl mb-1">{message}</div>
        <IconComponent className="h-4 w-4 mx-auto text-primary" />
      </div>
    </button>
  );
};