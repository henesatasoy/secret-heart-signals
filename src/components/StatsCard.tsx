import { Heart, MessageCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  className?: string;
}

export const StatsCard = ({ className }: StatsCardProps) => {
  const stats = [
    {
      icon: Heart,
      label: "Nudges Sent",
      value: "127",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: MessageCircle,
      label: "Messages",
      value: "89",
      color: "text-romantic",
      bg: "bg-romantic/10",
    },
    {
      icon: Clock,
      label: "Days Connected",
      value: "42",
      color: "text-warm",
      bg: "bg-warm/10",
    },
    {
      icon: Zap,
      label: "Today",
      value: "8",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className={cn("romantic-card", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
        Your Love Stats 💕
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center p-3 rounded-2xl border border-border hover:bg-accent/5 transition-colors duration-300"
          >
            <div className={cn("inline-flex p-2 rounded-xl mb-2", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};