import { Heart, Sparkles, Moon, Sun } from "lucide-react";
import { RomanticButton } from "@/components/ui/romantic-button";
import { cn } from "@/lib/utils";

interface NudgeCardProps {
  message: string;
  icon: "heart" | "sparkles" | "moon" | "sun";
  mood?: "happy" | "romantic" | "silly" | "sleepy";
  onClick?: () => void;
  className?: string;
}

const iconMap = {
  heart: Heart,
  sparkles: Sparkles,
  moon: Moon,
  sun: Sun,
};

const moodColors = {
  happy: "from-warm to-primary",
  romantic: "from-primary to-romantic",
  silly: "from-accent to-warm",
  sleepy: "from-secondary to-primary",
};

export const NudgeCard = ({ 
  message, 
  icon, 
  mood = "romantic", 
  onClick, 
  className 
}: NudgeCardProps) => {
  const IconComponent = iconMap[icon];
  const gradientClass = moodColors[mood];

  return (
    <div className={cn("romantic-card group cursor-pointer", className)} onClick={onClick}>
      <div className="flex items-center space-x-4">
        <div className={cn(
          "p-3 rounded-2xl bg-gradient-to-br",
          gradientClass,
          "group-hover:scale-110 transition-transform duration-300"
        )}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-foreground font-medium text-base leading-relaxed">
            {message}
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <RomanticButton 
          variant="soft" 
          size="sm"
          className="group-hover:scale-105 transition-transform duration-300"
        >
          Send Nudge
        </RomanticButton>
      </div>
    </div>
  );
};