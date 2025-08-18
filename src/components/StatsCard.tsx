import { Heart, MessageCircle, Calendar } from "lucide-react";

export const ManuscriptStats = () => {
  const stats = [
    { icon: Heart, value: "127", label: "💕" },
    { icon: MessageCircle, value: "43", label: "📨" },
    { icon: Calendar, value: "12", label: "📅" },
  ];

  return (
    <div className="pixel-card">
      <div className="grid grid-cols-3 gap-4 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="text-lg pixel-font-bold text-primary">{stat.value}</div>
            <div className="text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};