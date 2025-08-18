import { useState, useEffect } from "react";
import { Heart, Sparkles, Moon, Sun, Info } from "lucide-react";
import { LetterCard } from "@/components/NudgeCard";
import { ScrollConnection } from "@/components/PairingCard";
import { ManuscriptStats } from "@/components/StatsCard";
import { useToast } from "@/hooks/use-toast";
import { initializeMobileFeatures, hapticFeedback, showLocalNotification } from "@/services/mobile";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMood, setSelectedMood] = useState<"happy" | "romantic" | "silly" | "sleepy">("romantic");
  const { toast } = useToast();

  // Initialize mobile features on app start
  useEffect(() => {
    initializeMobileFeatures();
  }, []);

  const predefinedLetters = [
    { message: "❤️", icon: "heart" as const },
    { message: "✨", icon: "sparkles" as const },
    { message: "🤗", icon: "heart" as const },
    { message: "💫", icon: "moon" as const },
    { message: "☀️", icon: "sun" as const },
    { message: "😊", icon: "sparkles" as const },
  ];

  const handleSendLetter = async (message: string) => {
    // Haptic feedback for sending
    await hapticFeedback.medium();
    
    // Show mobile notification
    await showLocalNotification(
      "Güvercin uçtu! 🕊️", 
      `Mektubun sevgiline ulaştırıldı: "${message}"`
    );
    
    toast({
      title: "Mektup gönderildi! 💕",
      description: `"${message}" sevgiline ulaştırıldı`,
    });
  };

  const handleConnect = async () => {
    await hapticFeedback.heavy();
    setIsConnected(true);
  };

  const moods = [
    { id: "romantic", icon: Heart },
    { id: "happy", icon: Sun },
    { id: "silly", icon: Sparkles },
    { id: "sleepy", icon: Moon },
  ];

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-pixel-cloud to-pixel-sky">
      {/* Info Button */}
      <button className="fixed top-4 right-4 z-50 pixel-button bg-pixel-sunset hover:bg-pixel-mountain">
        <Info className="h-4 w-4" />
      </button>

      {/* Header */}
      <header className="max-w-lg mx-auto mb-6 text-center">
        <div className="inline-flex items-center space-x-2 pixel-card mb-4">
          <Heart className="h-6 w-6 text-primary pixel-glow" />
          <h1 className="text-2xl pixel-font-bold text-ink">Dürtü</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto space-y-4">
        {!isConnected ? (
          <ScrollConnection onConnect={handleConnect} />
        ) : (
          <>
            {/* Mood Selector */}
            <div className="pixel-card">
              <div className="grid grid-cols-4 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={async () => {
                      await hapticFeedback.light();
                      setSelectedMood(mood.id as any);
                    }}
                    className={`
                      pixel-button text-xs p-2
                      ${selectedMood === mood.id 
                        ? 'bg-primary scale-105' 
                        : 'bg-pixel-cloud hover:bg-primary/70'}
                    `}
                  >
                    <mood.icon className="h-4 w-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Grid */}
            <div className="grid grid-cols-3 gap-3">
              {predefinedLetters.map((letter, index) => (
                <LetterCard
                  key={index}
                  message={letter.message}
                  icon={letter.icon}
                  mood={selectedMood}
                  onClick={() => handleSendLetter(letter.message)}
                  className="pixel-float"
                />
              ))}
            </div>

            {/* Stats */}
            <ManuscriptStats />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;