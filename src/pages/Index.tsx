import { useState, useEffect } from "react";
import { Heart, Sparkles, Moon, Sun, Info } from "lucide-react";
import { LetterCard } from "@/components/NudgeCard";
import { ScrollConnection } from "@/components/PairingCard";
import { ManuscriptStats } from "@/components/StatsCard";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { initializeMobileFeatures, hapticFeedback, showLocalNotification } from "@/services/mobile";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMood, setSelectedMood] = useState<"happy" | "romantic" | "silly" | "sleepy">("romantic");
  const [connectionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const { toast } = useToast();
  const { messages, sendMessage } = useMessages(connectionId, partnerId);

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
    if (!partnerId) {
      toast({
        title: "Bağlantı yok",
        description: "Önce sevgilinle bağlan",
        variant: "destructive"
      });
      return;
    }

    // Haptic feedback for sending
    await hapticFeedback.medium();
    
    // Send message via Supabase
    await sendMessage(message, selectedMood);
    
    // Show mobile notification
    await showLocalNotification(
      "Güvercin uçtu! 🕊️", 
      `Mektubun sevgiline ulaştırıldı: "${message}"`
    );
  };

  const handleConnect = async (partnerConnectionId: string) => {
    await hapticFeedback.heavy();
    setIsConnected(true);
    setPartnerId(partnerConnectionId);
  };

  const moods = [
    { id: "romantic", icon: Heart },
    { id: "happy", icon: Sun },
    { id: "silly", icon: Sparkles },
    { id: "sleepy", icon: Moon },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full screen background image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/magical-forest-bg.png')`
        }}
      />
      
      {/* Info Button - positioned to match the circular element in top left */}
      <button className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 flex items-center justify-center hover:bg-blue-400/40 transition-all">
        <Info className="h-4 w-4 text-white" />
      </button>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {!isConnected ? (
          <>
            {/* Link sharing button positioned at the campfire */}
            <div className="flex-1 flex items-center justify-center">
              <div className="absolute" style={{ bottom: '25%' }}>
                <ScrollConnection 
                  connectionId={connectionId}
                  onConnect={handleConnect} 
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Connected state - floating UI elements */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80">
              {/* Mood Selector */}
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 mb-4">
                <div className="grid grid-cols-4 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={async () => {
                        await hapticFeedback.light();
                        setSelectedMood(mood.id as any);
                      }}
                      className={`
                        p-2 rounded-lg transition-all backdrop-blur-sm
                        ${selectedMood === mood.id 
                          ? 'bg-white/30 scale-105' 
                          : 'bg-white/10 hover:bg-white/20'}
                      `}
                    >
                      <mood.icon className="h-4 w-4 mx-auto text-white" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter Grid */}
              <div className="grid grid-cols-3 gap-3">
                {predefinedLetters.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendLetter(letter.message)}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
                  >
                    <span className="text-xl">{letter.message}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats positioned at bottom */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <ManuscriptStats />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;