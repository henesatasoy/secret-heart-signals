import { useState, useEffect } from "react";
import { Heart, ArrowLeft, Send, TestTube, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useConnection } from "@/hooks/useConnection";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { hapticFeedback } from "@/services/mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from '@supabase/supabase-js';

const Messages = () => {
  const [user, setUser] = useState<User | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState<"happy" | "romantic" | "silly" | "sleepy">("romantic");
  const [showTestEmojis, setShowTestEmojis] = useState(false);
  const [showCompleteVideo, setShowCompleteVideo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { isConnected, partnerId, disconnectPartner } = useConnection(user?.id || '');
  const { messages, sendMessage } = useMessages(user?.id || '', partnerId);

  // Authentication setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show completion video when messages page loads after connection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showVideo') === 'true') {
      setShowCompleteVideo(true);
      const timer = setTimeout(() => {
        setShowCompleteVideo(false);
        // Clear the URL parameter
        window.history.replaceState({}, '', '/messages');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Redirect if not connected
  useEffect(() => {
    if (user && !isConnected) {
      navigate('/');
    }
  }, [user, isConnected, navigate]);

  const predefinedLetters = [
    { message: "❤️", icon: "heart" as const },
    { message: "✨", icon: "sparkles" as const },
    { message: "🤗", icon: "heart" as const },
    { message: "💫", icon: "moon" as const },
    { message: "☀️", icon: "sun" as const },
    { message: "😊", icon: "sparkles" as const },
    { message: "💕", icon: "heart" as const },
    { message: "🌙", icon: "moon" as const },
  ];

  // Test emoji kategorileri
  const testEmojiCategories = {
    hearts: ["💖", "💝", "💗", "💓", "💞", "💘", "💌", "💋"],
    faces: ["😍", "🥰", "😘", "😚", "🤗", "🤭", "😉", "😁"],
    nature: ["🌺", "🌸", "🌹", "🌻", "🌷", "🦋", "🌈", "⭐"],
    food: ["🍓", "🍑", "🍒", "🍯", "🍰", "🎂", "🍫", "☕"],
    activities: ["💃", "🕺", "🎵", "🎶", "🎸", "🎤", "🎭", "🎨"],
    symbols: ["💎", "👑", "🔥", "⚡", "🌟", "💫", "✨", "🎉"]
  };

  const handleSendLetter = async (message: string) => {
    if (!partnerId) return;

    await hapticFeedback.medium();
    await sendMessage(message, selectedMood);
  };

  const handleSendCustomMessage = async () => {
    if (!customMessage.trim() || !partnerId) return;

    await hapticFeedback.medium();
    await sendMessage(customMessage, selectedMood);
    setCustomMessage("");
  };

  const handleDisconnect = async () => {
    await hapticFeedback.heavy();
    await disconnectPartner();
    navigate('/');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || !isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-pink-300" />
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <img 
        src="/background-animation.gif"
        alt="Animated Background"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-b from-stone-300 to-stone-400 border-b-4 border-stone-600 shadow-[0_4px_0px_0px_rgba(68,64,60,1)] p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-gradient-to-b from-slate-300 to-slate-400 border-2 border-slate-600 rounded-none shadow-[3px_3px_0px_0px_rgba(71,85,105,1)] hover:shadow-[2px_2px_0px_0px_rgba(71,85,105,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          
          <h1 className="text-stone-800 font-mono font-bold text-xl">💕 Mesajlaşma</h1>
          
          <button
            onClick={handleDisconnect}
            className="p-2 bg-gradient-to-b from-red-400 to-red-600 border-2 border-red-800 rounded-none shadow-[3px_3px_0px_0px_rgba(127,29,29,1)] hover:shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            title="Bağlantıyı Kes"
          >
            <Heart className="h-5 w-5 text-red-900 rotate-180" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative z-10 h-[calc(100vh-140px)] overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.from_connection_id === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-none border-2 shadow-[3px_3px_0px_0px] ${
                message.from_connection_id === user.id
                  ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 border-emerald-700 shadow-emerald-800'
                  : 'bg-gradient-to-b from-pink-300 to-pink-500 border-pink-700 shadow-pink-800'
              }`}
            >
              <p className="text-lg font-mono text-center">{message.message}</p>
              <p className="text-xs text-center mt-1 opacity-70">
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Letters & Test Emojis */}
      <div className="relative z-10 p-4 bg-gradient-to-b from-stone-200 to-stone-300 border-t-4 border-stone-600">
        {/* Test Emoji Toggle */}
        <div className="mb-3">
          <button
            onClick={() => setShowTestEmojis(!showTestEmojis)}
            className="w-full bg-gradient-to-b from-purple-300 to-purple-500 border-2 border-purple-700 rounded-none shadow-[3px_3px_0px_0px_rgba(88,28,135,1)] hover:shadow-[2px_2px_0px_0px_rgba(88,28,135,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all p-3 flex items-center justify-center gap-2"
          >
            <TestTube className="h-5 w-5 text-purple-900" />
            <span className="text-purple-900 font-mono font-bold">Test Emoji Paneli</span>
            {showTestEmojis ? 
              <ChevronUp className="h-4 w-4 text-purple-900" /> : 
              <ChevronDown className="h-4 w-4 text-purple-900" />
            }
          </button>
        </div>

        {/* Test Emoji Categories */}
        {showTestEmojis && (
          <div className="mb-4 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-600 rounded-none shadow-[4px_4px_0px_0px_rgba(75,85,99,1)] p-3">
            <h3 className="text-gray-800 font-mono font-bold text-center mb-3">🧪 Test Emojileri</h3>
            
            {Object.entries(testEmojiCategories).map(([category, emojis]) => (
              <div key={category} className="mb-3 last:mb-0">
                <h4 className="text-gray-700 font-mono text-sm uppercase mb-2 text-center">
                  {category === 'hearts' ? '💕 Kalpler' :
                   category === 'faces' ? '😊 Yüzler' :
                   category === 'nature' ? '🌸 Doğa' :
                   category === 'food' ? '🍓 Yiyecek' :
                   category === 'activities' ? '🎵 Aktivite' :
                   '✨ Semboller'}
                </h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => handleSendLetter(emoji)}
                      className="bg-gradient-to-b from-yellow-200 to-yellow-400 border border-yellow-600 rounded-none shadow-[2px_2px_0px_0px_rgba(161,98,7,1)] hover:shadow-[1px_1px_0px_0px_rgba(161,98,7,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none active:translate-x-1 active:translate-y-1 p-2 text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Letters */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {predefinedLetters.map((letter, index) => (
            <button
              key={index}
              onClick={() => handleSendLetter(letter.message)}
              className="bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-700 rounded-none shadow-[3px_3px_0px_0px_rgba(146,64,14,1)] hover:shadow-[2px_2px_0px_0px_rgba(146,64,14,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none active:translate-x-1 active:translate-y-1 p-3"
            >
              <span className="text-2xl">{letter.message}</span>
            </button>
          ))}
        </div>

        {/* Custom Message Input */}
        <div className="flex gap-2">
          <Input
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Özel mesajın..."
            className="flex-1 bg-gradient-to-b from-white to-gray-100 border-2 border-gray-600 rounded-none shadow-[2px_2px_0px_0px_rgba(75,85,99,1)] font-mono"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendCustomMessage();
              }
            }}
          />
          <Button
            onClick={handleSendCustomMessage}
            disabled={!customMessage.trim()}
            className="bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-blue-800 rounded-none shadow-[3px_3px_0px_0px_rgba(30,64,175,1)] hover:shadow-[2px_2px_0px_0px_rgba(30,64,175,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-blue-900" />
          </Button>
        </div>
      </div>
      
      {/* Completion Video Overlay */}
      {showCompleteVideo && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <video
            src="/connection-complete.mp4"
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default Messages;