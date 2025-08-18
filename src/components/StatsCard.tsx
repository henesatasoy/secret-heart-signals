import { Heart, MessageCircle, Clock, Zap, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManuscriptStatsProps {
  className?: string;
}

export const ManuscriptStats = ({ className }: ManuscriptStatsProps) => {
  const stats = [
    {
      icon: Scroll,
      label: "Gönderilen Mektup",
      value: "127",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Heart,
      label: "Aşk Mesajı",
      value: "89",
      color: "text-ink",
      bg: "bg-ink/10",
    },
    {
      icon: Clock,
      label: "Bağlı Günler",
      value: "42",
      color: "text-primary-dark",
      bg: "bg-primary/5",
    },
    {
      icon: Zap,
      label: "Bugün",
      value: "8",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className={cn("scroll-card", className)}>
      <h3 className="text-lg font-bold text-ink mb-4 text-center handwritten text-xl">
        Aşk Kayıtların 💕
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center p-3 rounded-lg border-2 border-primary/20 hover:bg-parchment/20 transition-colors duration-500 hover:shadow-quill"
          >
            <div className={cn("inline-flex p-2 rounded-lg mb-2", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div className="text-2xl font-bold text-ink mb-1 handwritten">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground handwritten">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};