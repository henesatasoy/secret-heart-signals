import { useState } from "react";
import { Heart, Sparkles, Moon, Sun, Settings, Plus } from "lucide-react";
import { RomanticButton } from "@/components/ui/romantic-button";
import { NudgeCard } from "@/components/NudgeCard";
import { PairingCard } from "@/components/PairingCard";
import { StatsCard } from "@/components/StatsCard";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-romantic.jpg";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMood, setSelectedMood] = useState<"happy" | "romantic" | "silly" | "sleepy">("romantic");
  const { toast } = useToast();

  const predefinedNudges = [
    { message: "I miss you ❤️", icon: "heart" as const, mood: "romantic" as const },
    { message: "Thinking of you ✨", icon: "sparkles" as const, mood: "happy" as const },
    { message: "Need a hug 🤗", icon: "heart" as const, mood: "romantic" as const },
    { message: "Goodnight my love 💫", icon: "moon" as const, mood: "sleepy" as const },
    { message: "Good morning sunshine ☀️", icon: "sun" as const, mood: "happy" as const },
    { message: "You make me smile 😊", icon: "sparkles" as const, mood: "happy" as const },
  ];

  const handleSendNudge = (message: string) => {
    toast({
      title: "Nudge sent! 💕",
      description: `"${message}" delivered to your special someone`,
    });
  };

  const handleConnect = () => {
    setIsConnected(true);
  };

  const moods = [
    { id: "romantic", icon: Heart, label: "Romantic", color: "from-primary to-romantic" },
    { id: "happy", icon: Sun, label: "Happy", color: "from-warm to-primary" },
    { id: "silly", icon: Sparkles, label: "Playful", color: "from-accent to-warm" },
    { id: "sleepy", icon: Moon, label: "Sleepy", color: "from-secondary to-primary" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-romantic glow-effect">
              <Heart className="h-8 w-8 text-white animate-heart-beat" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dürtü</h1>
              <p className="text-sm text-muted-foreground">Your intimate connection</p>
            </div>
          </div>
          <RomanticButton variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </RomanticButton>
        </div>

        {!isConnected && (
          <div className="relative rounded-3xl overflow-hidden mb-8 romantic-shadow">
            <img 
              src={heroImage} 
              alt="Two hearts connecting through technology" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-xl font-semibold mb-1">Stay Close, Even Apart</h2>
                <p className="text-white/90 text-sm">Send intimate nudges that reach the heart instantly</p>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto">
        {!isConnected ? (
          <div className="grid gap-6 md:grid-cols-2">
            <PairingCard className="md:col-span-2" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mood Selector */}
            <div className="romantic-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                How are you feeling? 💭
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id as any)}
                    className={`
                      p-4 rounded-2xl border transition-all duration-300
                      ${selectedMood === mood.id 
                        ? 'border-primary bg-primary/10 scale-105' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/5'}
                    `}
                  >
                    <div className={`inline-flex p-2 rounded-xl mb-2 bg-gradient-to-br ${mood.color}`}>
                      <mood.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {mood.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nudge Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Send a Nudge ✨
                </h3>
                <RomanticButton variant="soft" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Custom
                </RomanticButton>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {predefinedNudges.map((nudge, index) => (
                  <NudgeCard
                    key={index}
                    message={nudge.message}
                    icon={nudge.icon}
                    mood={selectedMood}
                    onClick={() => handleSendNudge(nudge.message)}
                    className="hover:scale-102 transition-transform duration-300"
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <StatsCard />

            {/* Quick Actions */}
            <div className="flex justify-center space-x-4">
              <RomanticButton variant="pulse" size="xl" className="flex-1 max-w-xs">
                <Heart className="h-6 w-6 mr-2" />
                Send Love
              </RomanticButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
