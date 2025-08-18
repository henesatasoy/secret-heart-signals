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
    <div className={cn("scroll-card group cursor-pointer hover:shadow-dove transition-all duration-500", className)} onClick={handleClick}>
      <div className="flex items-start space-x-4">
        <div className="wax-seal flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
          <IconComponent className="absolute inset-0 m-auto h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-ink font-medium text-base leading-relaxed handwritten text-lg">
            {message}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <MedievalButton 
          variant="scroll" 
          size="sm"
          className="group-hover:scale-105 transition-transform duration-500"
        >
          <Mail className="h-4 w-4 mr-2" />
          Mektup Gönder
        </MedievalButton>
      </div>
      
      {/* Decorative scroll ends */}
      <div className="absolute -top-1 left-4 right-4 h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
      <div className="absolute -bottom-1 left-4 right-4 h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
    </div>
  );
};