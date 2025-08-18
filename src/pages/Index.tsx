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
  
  // Use user ID as connection ID for consistent identification - only if user exists
  const connectionId = user?.id || '';
  const { isConnected, partnerId, connectWith, disconnectPartner } = useConnection(user?.id || '');
  const { messages, sendMessage } = useMessages(user?.id || '', partnerId);

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
      // Clean up auth state first
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Attempt global sign out (ignore errors)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Logout error (ignored):', err);
      }
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/auth';
    }
  };

  const moods = [
    { id: "romantic", icon: Heart },
    { id: "happy", icon: Sun },
    { id: "silly", icon: Sparkles },
    { id: "sleepy", icon: Moon },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Full screen background GIF - mobile optimized */}
      <img 
        src="/background-animation.gif"
        alt="Animated Background"
        className="absolute inset-0 w-full h-full object-contain"
      />
      
      {/* Top buttons - 16bit cozy style */}
      <div className="absolute top-6 left-6 z-50 flex gap-3">
        <button className="w-12 h-12 bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-600 rounded-none shadow-[4px_4px_0px_0px_rgba(146,64,14,1)] hover:shadow-[2px_2px_0px_0px_rgba(146,64,14,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center active:shadow-none active:translate-x-1 active:translate-y-1">
          <Info className="h-5 w-5 text-amber-900" />
        </button>
      </div>

      {/* User info - 16bit cozy style */}
      {user && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <div className="bg-gradient-to-b from-stone-200 to-stone-300 border-2 border-stone-500 rounded-none shadow-[3px_3px_0px_0px_rgba(68,64,60,1)] px-4 py-2">
            <p className="text-stone-800 text-sm font-mono font-bold">{user.email}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-12 h-12 bg-gradient-to-b from-red-400 to-red-600 border-2 border-red-700 rounded-none shadow-[4px_4px_0px_0px_rgba(127,29,29,1)] hover:shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center active:shadow-none active:translate-x-1 active:translate-y-1"
            title="Çıkış Yap"
          >
            <LogOut className="h-5 w-5 text-red-900" />
          </button>
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="text-center text-white max-w-sm">
              <Heart className="h-16 w-16 mx-auto mb-4 text-pink-300" />
              <p className="text-lg">Yükleniyor...</p>
            </div>
          </div>
        ) : !isConnected ? (
          <>
            {/* Invisible clickable area over campfire */}
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30">
              <button
                onClick={() => {
                  // Use ScrollConnection component logic but as invisible button
                  const partnerCode = prompt("Sevgilinin bağlantı kodunu gir:");
                  if (partnerCode && partnerCode.trim()) {
                    connectWith(partnerCode.trim());
                    handleConnect(partnerCode.trim());
                  }
                }}
                className="w-32 h-32 bg-transparent rounded-full active:scale-95 cursor-pointer group"
                title="Campfire'a tıkla ve sevgiline bağlan"
              >
                {/* Continuous magical flame glow */}
                <div 
                  className="absolute inset-2 bg-orange-300/25 animate-pulse" 
                  style={{ 
                    imageRendering: 'pixelated',
                    clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)'
                  }} 
                />
                <div 
                  className="absolute inset-4 bg-yellow-200/20 animate-pulse" 
                  style={{ 
                    imageRendering: 'pixelated', 
                    animationDelay: '1s',
                    clipPath: 'polygon(50% 10%, 70% 30%, 90% 50%, 70% 70%, 50% 90%, 30% 70%, 10% 50%, 30% 30%)'
                  }} 
                />
                {/* Click ripple effect */}
                <div 
                  className="absolute inset-0 bg-orange-300/50 opacity-0 group-active:opacity-100 group-active:animate-ping transition-opacity"
                  style={{
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                  }}
                />
              </button>
            </div>
          </>
        ) : user ? ( // Only show connected state if user is authenticated
          <>
            {/* Connected state - floating UI elements */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80">
              {/* 16bit Mood Selector */}
              <div className="bg-gradient-to-b from-stone-300 to-stone-400 border-3 border-stone-600 rounded-none shadow-[4px_4px_0px_0px_rgba(68,64,60,1)] p-4 mb-4">
                <div className="grid grid-cols-4 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={async () => {
                        await hapticFeedback.light();
                        setSelectedMood(mood.id as any);
                      }}
                      className={`
                        p-3 rounded-none transition-all border-2
                        ${selectedMood === mood.id 
                          ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-700 shadow-[3px_3px_0px_0px_rgba(146,64,14,1)] translate-x-0.5 translate-y-0.5' 
                          : 'bg-gradient-to-b from-slate-300 to-slate-400 border-slate-600 shadow-[3px_3px_0px_0px_rgba(71,85,105,1)] hover:shadow-[2px_2px_0px_0px_rgba(71,85,105,1)] hover:translate-x-0.5 hover:translate-y-0.5'}
                      `}
                    >
                      <mood.icon className={`h-5 w-5 mx-auto ${selectedMood === mood.id ? 'text-amber-900' : 'text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 16bit Letter Grid */}
              <div className="grid grid-cols-3 gap-4">
                {predefinedLetters.map((letter, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendLetter(letter.message)}
                    className="bg-gradient-to-b from-emerald-300 to-emerald-500 border-3 border-emerald-700 rounded-none shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] hover:shadow-[2px_2px_0px_0px_rgba(4,120,87,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none active:translate-x-1 active:translate-y-1 p-6 flex items-center justify-center"
                  >
                    <span className="text-2xl drop-shadow-lg">{letter.message}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 16bit Disconnect button */}
            <div className="absolute bottom-20 right-6">
              <button
                onClick={disconnectPartner}
                className="w-14 h-14 bg-gradient-to-b from-red-400 to-red-600 border-3 border-red-800 rounded-none shadow-[5px_5px_0px_0px_rgba(127,29,29,1)] hover:shadow-[3px_3px_0px_0px_rgba(127,29,29,1)] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center active:shadow-none active:translate-x-1.5 active:translate-y-1.5"
                title="Bağlantıyı Kes"
              >
                <Heart className="h-6 w-6 text-red-900 rotate-180" />
              </button>
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