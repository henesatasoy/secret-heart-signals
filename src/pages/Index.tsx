import { useState, useEffect } from "react";
import { Heart, Sparkles, Moon, Sun, Info, LogOut } from "lucide-react";
import { LetterCard } from "@/components/NudgeCard";
import { ScrollConnection } from "@/components/PairingCard";
import { ManuscriptStats } from "@/components/StatsCard";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useConnection } from "@/hooks/useConnection";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { initializeMobileFeatures, hapticFeedback, showLocalNotification } from "@/services/mobile";
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedMood, setSelectedMood] = useState<"happy" | "romantic" | "silly" | "sleepy">("romantic");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use user ID as connection ID for consistent identification
  const connectionId = user?.id || '';
  const { isConnected, partnerId, connectWith } = useConnection(connectionId);
  const { messages, sendMessage } = useMessages(connectionId, partnerId);

  // Authentication setup
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to auth if not logged in
        if (!session) {
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
    // Connection state is now managed by useConnection hook
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
      <img 
        src="/lovable-uploads/de0d5b01-9671-41c9-964c-4e061a1785d1.png"
        alt="Magical Forest Background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      
      {/* Top buttons */}
      <div className="absolute top-6 left-6 z-50 flex gap-2">
        <button className="w-10 h-10 rounded-full bg-blue-500/30 backdrop-blur-sm border border-blue-300/30 flex items-center justify-center hover:bg-blue-400/40 transition-all">
          <Info className="h-4 w-4 text-white" />
        </button>
        {user && (
          <button 
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full bg-red-500/30 backdrop-blur-sm border border-red-300/30 flex items-center justify-center hover:bg-red-400/40 transition-all"
          >
            <LogOut className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <Heart className="h-16 w-16 mx-auto mb-4 text-pink-300" />
              <p className="text-lg">Yükleniyor...</p>
            </div>
          </div>
        ) : !isConnected ? (
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
        ) : user ? ( // Only show connected state if user is authenticated
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
        ) : null}
      </div>
    </div>
  );
};

export default Index;