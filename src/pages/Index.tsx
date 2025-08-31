import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Heart, Sparkles, Moon, Sun, Settings, LogOut, Upload } from "lucide-react";
import { LetterCard } from "@/components/NudgeCard";
import { ScrollConnection } from "@/components/PairingCard";
import { ManuscriptStats } from "@/components/StatsCard";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useConnection } from "@/hooks/useConnection";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { initializeMobileFeatures, hapticFeedback, showLocalNotification, getNotificationSettings, setNotificationSettings, playBackgroundMusic, stopBackgroundMusic } from "@/services/mobile";
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedMood, setSelectedMood] = useState<"happy" | "romantic" | "silly" | "sleepy">("romantic");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<string | null>(null);
  const [showConnectionVideo, setShowConnectionVideo] = useState(false);
  const [notificationSettings, setNotificationSettingsState] = useState(() => getNotificationSettings());
  const [selectedSound, setSelectedSound] = useState(() => localStorage.getItem('notification-sound') || 'dove');
  const [customSoundName, setCustomSoundName] = useState(() => localStorage.getItem('custom-sound-name') || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, changeLanguage, t, getLanguages } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Enhanced connection management with proper validation
  const connectionId = useMemo(() => user?.id || '', [user?.id]);
  const { isConnected, partnerId, isLoading, error, connectWith, disconnectPartner } = useConnection(connectionId);
  
  // Call useMessages with current partnerId 
  const { messages, sendMessage } = useMessages(connectionId, partnerId);

  // Enhanced authentication setup with corruption detection and better error handling
  useEffect(() => {
    console.log('🔍 Setting up auth state management...')
    
    let authSubscription: any = null
    let isActive = true // Prevent state updates on unmounted component
    
    const setupAuth = async () => {
      try {
        // Set up auth state listener FIRST with enhanced error handling
        authSubscription = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isActive) return // Prevent updates if component unmounted
            
            console.log('🔄 Auth state change:', event, session?.user?.id)
            
            // Handle token refresh errors specifically
            if (event === 'TOKEN_REFRESHED') {
              console.log('✅ Token refreshed successfully')
              setSession(session);
              setUser(session?.user ?? null);
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out')
              setSession(null);
              setUser(null);
              navigate('/auth', { replace: true });
            } else if (event === 'SIGNED_IN') {
              console.log('👤 User signed in:', session?.user?.id)
              setSession(session);
              setUser(session?.user ?? null);
            } else {
              // Handle other events including initial load
              setSession(session);
              setUser(session?.user ?? null);
              
              if (!session && event !== 'INITIAL_SESSION') {
                navigate('/auth', { replace: true });
              }
            }
          }
        );
        
        // THEN check for existing session with enhanced error handling
        try {
          console.log('🔍 Checking for existing session...')
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('🚨 Session check error:', error)
            
            // Handle refresh token errors and auth corruption
            if (error.message?.includes('refresh_token_not_found') || 
                error.message?.includes('Invalid Refresh Token') ||
                error.message?.includes('JWT') ||
                error.message?.includes('decode')) {
              console.log('🔄 Auth corruption detected, cleaning up...')
              
              // Import cleanup function
              const { cleanupCorruptedAuthState } = await import('@/integrations/supabase/client')
              cleanupCorruptedAuthState()
              
              // Force sign out and redirect
              try {
                await supabase.auth.signOut({ scope: 'global' })
              } catch (signOutError) {
                console.log('Signout after token error failed:', signOutError)
              }
              
              navigate('/auth', { replace: true });
              return
            }
            
            // Other session errors - still try to continue
            console.warn('Session error, but continuing:', error.message)
          }
          
          console.log('🔍 Session check result:', session?.user?.id || 'No session')
          
          // Only set state if component is still active
          if (isActive) {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (!session) {
              console.log('❌ No valid session found, redirecting to auth')
              navigate('/auth', { replace: true });
            } else {
              console.log('✅ Valid session found for user:', session.user.id)
            }
          }
        } catch (sessionError) {
          console.error('💥 Session check failed:', sessionError)
          if (isActive) {
            navigate('/auth', { replace: true });
          }
        }
        
      } catch (setupError) {
        console.error('💥 Auth setup failed:', setupError)
        if (isActive) {
          navigate('/auth', { replace: true });
        }
      }
    }
    
    setupAuth()

    return () => {
      isActive = false // Prevent further state updates
      
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      } else if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
        authSubscription.unsubscribe();
      }
    };
   }, [navigate]);

  // Show connection video only once when first connected - with better control
  const [hasShownVideo, setHasShownVideo] = useState(false);
  const hasConnection = useMemo(() => isConnected && partnerId, [isConnected, partnerId]);
  
  useEffect(() => {
    if (hasConnection && !hasShownVideo && !showConnectionVideo) {
      setHasShownVideo(true);
      setShowConnectionVideo(true);
    }
  }, [hasConnection, hasShownVideo, showConnectionVideo]);

  // Video handles navigation via onEnded event - no timer needed

  // Initialize mobile features and background music on app start
  useEffect(() => {
    initializeMobileFeatures();
    
    // Start background music when user is authenticated
    if (user) {
      // Delay to avoid autoplay restrictions on page load
      const timer = setTimeout(() => {
        playBackgroundMusic();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Handle user interaction to enable audio context (required for autoplay)
  useEffect(() => {
    const handleUserInteraction = () => {
      const settings = getNotificationSettings();
      if (settings.backgroundMusicEnabled && user) {
        playBackgroundMusic();
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [user]);

  // Clean up background music on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const predefinedLetters = [
    { message: "❤️", icon: "heart" as const },
    { message: "✨", icon: "sparkles" as const },
    { message: "🤗", icon: "heart" as const },
    { message: "💫", icon: "moon" as const },
    { message: "☀️", icon: "sun" as const },
    { message: "😊", icon: "sparkles" as const },
  ];

  const handleSendLetter = useCallback(async (message: string) => {
    if (!partnerId) {
      toast({
        title: t('noConnection'),
        description: t('connectFirst'),
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
      t('letterSent'), 
      `${t('letterDelivered')} "${message}"`
    );
  }, [partnerId, sendMessage, selectedMood, t, toast]);

  const handleConnect = useCallback(async () => {
    await hapticFeedback.heavy();
    // Connection state is now managed by useConnection hook
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      // Clean up auth state first
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Attempt global sign out (ignore errors)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Logout error (ignored):', err);
      }
      
      // Force page reload for clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
  }, [navigate]);

  const moods = useMemo(() => [
    { id: "romantic", icon: Heart },
    { id: "happy", icon: Sun },
    { id: "silly", icon: Sparkles },
    { id: "sleepy", icon: Moon },
  ], []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Full screen background GIF - mobile optimized */}
      <img 
        src="/background-animation.gif"
        alt="Animated Background"
        className="absolute inset-0 w-full h-full object-contain"
      />
      
      {/* Settings button - fixed position for all devices */}
      <div className="absolute z-50" style={{ top: '66px', left: '15px' }}>
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 bg-transparent hover:bg-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] rounded-full transition-all duration-300 cursor-pointer"
          title="Ayarlar"
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="text-center text-white max-w-sm">
              <Heart className="h-16 w-16 mx-auto mb-4 text-pink-300" />
              <p className="text-lg">{t('loading')}</p>
            </div>
          </div>
        ) : !isConnected ? (
          <>
            {/* Connection handler - handles both click and URL processing */}
            <ScrollConnection 
              connectionId={user?.id || ''} 
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30"
              onConnect={handleConnect}
              isConnected={isConnected}
              partnerId={partnerId}
              connectWith={connectWith}
              isLoading={isLoading}
            />
          </>
        ) : (
          <>
            {/* Connection established - show video */}
            {showConnectionVideo && (
              <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
                <video
                  src="/connection-success.mp4"
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  onEnded={() => {
                    setShowConnectionVideo(false);
                    navigate('/messages');
                  }}
                />
              </div>
            )}
            
            
            {!showConnectionVideo && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-gradient-to-b from-emerald-300 to-emerald-500 border-4 border-emerald-700 rounded-none shadow-[6px_6px_0px_0px_rgba(4,120,87,1)] p-8">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-emerald-900" />
                  <h2 className="text-emerald-900 font-mono font-bold text-2xl mb-2">{t('connected')}</h2>
                  <p className="text-emerald-800 font-mono">{t('clickToMessage')}</p>
                  <button 
                    onClick={() => navigate('/messages')}
                    className="mt-4 px-6 py-2 bg-emerald-600 text-white font-mono font-bold rounded-none hover:bg-emerald-700 transition-colors"
                  >
                    {t('goToMessages')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;