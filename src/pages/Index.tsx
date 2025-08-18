import { useState, useEffect } from "react";
import { Heart, Sparkles, Moon, Sun, Settings, Plus, Feather, Scroll, Mail } from "lucide-react";
import { MedievalButton } from "@/components/ui/romantic-button";
import { LetterCard } from "@/components/NudgeCard";
import { ScrollConnection } from "@/components/PairingCard";
import { ManuscriptStats } from "@/components/StatsCard";
import { useToast } from "@/hooks/use-toast";
import { initializeMobileFeatures, hapticFeedback, showLocalNotification } from "@/services/mobile";
import heroImage from "@/assets/medieval-love-letters.jpg";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMood, setSelectedMood] = useState<"happy" | "romantic" | "silly" | "sleepy">("romantic");
  const { toast } = useToast();

  // Initialize mobile features on app start
  useEffect(() => {
    initializeMobileFeatures();
  }, []);

  const predefinedLetters = [
    { message: "Seni özlüyorum ❤️", icon: "heart" as const, mood: "romantic" as const },
    { message: "Seni düşünüyorum ✨", icon: "sparkles" as const, mood: "happy" as const },
    { message: "Sarılmaya ihtiyacım var 🤗", icon: "heart" as const, mood: "romantic" as const },
    { message: "İyi geceler aşkım 💫", icon: "moon" as const, mood: "sleepy" as const },
    { message: "Günaydın güneşim ☀️", icon: "sun" as const, mood: "happy" as const },
    { message: "Beni gülümsetiyorsun 😊", icon: "feather" as const, mood: "happy" as const },
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
    { id: "romantic", icon: Heart, label: "Romantik", color: "from-primary to-primary-dark" },
    { id: "happy", icon: Sun, label: "Mutlu", color: "from-primary to-scroll" },
    { id: "silly", icon: Sparkles, label: "Şakacı", color: "from-accent to-primary" },
    { id: "sleepy", icon: Moon, label: "Uykulu", color: "from-secondary to-ink" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="wax-seal">
              <Heart className="absolute inset-0 m-auto h-6 w-6 text-white animate-flutter" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-ink handwritten">Dürtü</h1>
              <p className="text-sm text-muted-foreground handwritten">Samimi bağlantın</p>
            </div>
          </div>
          <MedievalButton variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </MedievalButton>
        </div>

        {!isConnected && (
          <div className="relative rounded-xl overflow-hidden mb-8 parchment-shadow">
            <img 
              src={heroImage} 
              alt="Medieval love letters delivered by carrier pigeons" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-xl font-bold mb-1 handwritten">Aşkın Güvercinleri</h2>
                <p className="text-white/90 text-sm handwritten">Kalbi okşayan mektuplar anında ulaştırılır</p>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto">
        {!isConnected ? (
          <div className="grid gap-6 md:grid-cols-2">
            <ScrollConnection className="md:col-span-2" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mood Selector */}
            <div className="scroll-card">
              <h3 className="text-lg font-bold text-ink mb-4 text-center handwritten text-xl">
                Nasıl hissediyorsun? 💭
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={async () => {
                      await hapticFeedback.light();
                      setSelectedMood(mood.id as any);
                    }}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-500
                      ${selectedMood === mood.id 
                        ? 'border-primary bg-primary/10 scale-105 shadow-quill' 
                        : 'border-primary/30 hover:border-primary/70 hover:bg-parchment/20'}
                    `}
                  >
                    <div className={`inline-flex p-2 rounded-lg mb-2 bg-gradient-to-br ${mood.color}`}>
                      <mood.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-medium text-ink handwritten">
                      {mood.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-ink handwritten text-xl">
                  Mektup Gönder ✨
                </h3>
                <MedievalButton variant="scroll" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Özel
                </MedievalButton>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {predefinedLetters.map((letter, index) => (
                  <LetterCard
                    key={index}
                    message={letter.message}
                    icon={letter.icon}
                    mood={selectedMood}
                    onClick={() => handleSendLetter(letter.message)}
                    className="hover:scale-102 transition-transform duration-500"
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <ManuscriptStats />

            {/* Quick Actions */}
            <div className="flex justify-center space-x-4">
              <MedievalButton variant="dove" size="xl" className="flex-1 max-w-xs">
                <Heart className="h-6 w-6 mr-2" />
                Aşk Gönder
              </MedievalButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
