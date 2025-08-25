import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { hapticFeedback, playDoveSound } from '@/services/mobile';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { language, changeLanguage, getLanguages, t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize user state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Notification settings states
  const [vibrationEnabled, setVibrationEnabled] = useState(() => 
    localStorage.getItem('vibrationEnabled') !== 'false'
  );
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(() => 
    localStorage.getItem('notificationSoundEnabled') !== 'false'
  );
  const [selectedSound, setSelectedSound] = useState(() => 
    localStorage.getItem('selectedNotificationSound') || 'dove'
  );
  const [customSoundFile, setCustomSoundFile] = useState<File | null>(null);

  const handleVibrationToggle = useCallback(async (enabled: boolean) => {
    setVibrationEnabled(enabled);
    localStorage.setItem('vibrationEnabled', enabled.toString());
    
    if (enabled) {
      await hapticFeedback.light();
      toast({
        title: t('settings'),
        description: 'Titreşim etkinleştirildi'
      });
    } else {
      toast({
        title: t('settings'),
        description: 'Titreşim devre dışı bırakıldı'
      });
    }
  }, [t, toast]);

  const handleSoundToggle = useCallback(async (enabled: boolean) => {
    setNotificationSoundEnabled(enabled);
    localStorage.setItem('notificationSoundEnabled', enabled.toString());
    
    if (enabled) {
      playDoveSound();
      toast({
        title: t('settings'),
        description: 'Bildirim sesi etkinleştirildi'
      });
    } else {
      toast({
        title: t('settings'),
        description: 'Bildirim sesi devre dışı bırakıldı'
      });
    }
  }, [t, toast]);

  const handleSoundChange = useCallback(async (sound: string) => {
    setSelectedSound(sound);
    localStorage.setItem('selectedNotificationSound', sound);
    
    if (notificationSoundEnabled) {
      playDoveSound();
    }
    
    toast({
      title: t('settings'),
      description: `Ses değiştirildi: ${sound}`
    });
  }, [notificationSoundEnabled, t, toast]);

  const handleCustomSoundUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setCustomSoundFile(file);
      const url = URL.createObjectURL(file);
      localStorage.setItem('customNotificationSound', url);
      setSelectedSound('custom');
      localStorage.setItem('selectedNotificationSound', 'custom');
      
      toast({
        title: t('settings'),
        description: `Özel ses yüklendi: ${file.name}`
      });
    } else {
      toast({
        title: t('settings'),
        description: 'Lütfen ses dosyası seçin',
        variant: 'destructive'
      });
    }
  }, [t, toast]);

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
  }, []);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Full screen background GIF */}
      <img 
        src="/background-animation.gif"
        alt="Animated Background"
        className="absolute inset-0 w-full h-full object-contain"
      />
      
      {/* Settings Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="notification-font-bold text-white text-2xl">{t('settings')}</h1>
        </div>

        {/* Settings Sections */}
        <div className="flex-1 p-4 space-y-4">
          {/* Language Settings */}
          <div className="vibrant-notification backdrop-blur-lg">
            <button 
              onClick={() => toggleSection('language')}
              className="w-full text-left p-4 bg-white/10 border border-white/30 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-white notification-font"
            >
              <span className="notification-font-bold text-lg">{t('languageSettings')}</span>
            </button>
            
            {activeSection === 'language' && (
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm p-4">
                {getLanguages().map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setActiveSection(null);
                    }}
                    className={`w-full text-left p-3 mb-2 last:mb-0 rounded-lg border transition-all duration-300 notification-font ${
                      language === lang.code 
                        ? 'bg-white/30 border-white/50 text-white notification-font-bold' 
                        : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/15'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="vibrant-notification backdrop-blur-lg">
            <button 
              onClick={() => toggleSection('notification')}
              className="w-full text-left p-4 bg-white/10 border border-white/30 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-white notification-font"
            >
              <span className="notification-font-bold text-lg">{t('notificationSettings')}</span>
            </button>
            
            {activeSection === 'notification' && (
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm p-4 space-y-4">
                {/* Vibration Toggle */}
                <div className="flex items-center justify-between">
                  <span className="notification-font text-white">Titreşim</span>
                  <Switch
                    checked={vibrationEnabled}
                    onCheckedChange={handleVibrationToggle}
                  />
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <span className="notification-font text-white">Bildirim Sesi</span>
                  <Switch
                    checked={notificationSoundEnabled}
                    onCheckedChange={handleSoundToggle}
                  />
                </div>

                {/* Sound Selection */}
                {notificationSoundEnabled && (
                  <div className="space-y-2">
                    <span className="notification-font text-white text-sm">Ses Seçin</span>
                    <Select value={selectedSound} onValueChange={handleSoundChange}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/30">
                        <SelectItem value="dove" className="text-white">Güvercin</SelectItem>
                        <SelectItem value="bell" className="text-white">Zil</SelectItem>
                        <SelectItem value="chime" className="text-white">Çan</SelectItem>
                        <SelectItem value="ping" className="text-white">Ping</SelectItem>
                        <SelectItem value="custom" className="text-white">Özel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Custom Sound Upload */}
                {notificationSoundEnabled && selectedSound === 'custom' && (
                  <div className="space-y-2">
                    <span className="notification-font text-white text-sm">Özel Ses Yükle</span>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleCustomSoundUpload}
                      className="bg-white/10 border-white/30 text-white file:bg-white/20 file:text-white file:border-0"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="vibrant-notification backdrop-blur-lg">
            <button 
              onClick={() => toggleSection('account')}
              className="w-full text-left p-4 bg-white/10 border border-white/30 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-white notification-font"
            >
              <span className="notification-font-bold text-lg">{t('accountInfo')}</span>
            </button>
            
            {activeSection === 'account' && user && (
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm p-4 space-y-4">
                <div>
                  <label className="notification-font text-white text-sm block mb-2">E-posta</label>
                  <Input
                    type="email"
                    value={user.email || ''}
                    readOnly
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>
                <div>
                  <label className="notification-font text-white text-sm block mb-2">Kullanıcı ID</label>
                  <Input
                    type="text"
                    value={user.id}
                    readOnly
                    className="bg-white/10 border-white/30 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <div className="pt-4">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full bg-red-600/80 hover:bg-red-700/80 text-white notification-font-bold"
            >
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;