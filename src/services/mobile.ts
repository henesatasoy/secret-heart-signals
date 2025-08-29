import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

// Check if running on mobile
export const isMobile = () => Capacitor.isNativePlatform();

// Settings management
export const getNotificationSettings = () => {
  const vibrationEnabled = localStorage.getItem('vibration-enabled');
  const soundEnabled = localStorage.getItem('sound-enabled');
  
  return {
    vibrationEnabled: vibrationEnabled !== 'false', // Default to true
    soundEnabled: soundEnabled !== 'false' // Default to true
  };
};

export const setNotificationSettings = (vibration: boolean, sound: boolean) => {
  localStorage.setItem('vibration-enabled', vibration.toString());
  localStorage.setItem('sound-enabled', sound.toString());
};

// Haptic feedback functions
export const hapticFeedback = {
  light: async () => {
    const settings = getNotificationSettings();
    if (isMobile() && settings.vibrationEnabled) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },
  medium: async () => {
    const settings = getNotificationSettings();
    if (isMobile() && settings.vibrationEnabled) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },
  heavy: async () => {
    const settings = getNotificationSettings();
    if (isMobile() && settings.vibrationEnabled) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },
  // Special pattern for dove tap
  doveTap: async () => {
    const settings = getNotificationSettings();
    if (isMobile() && settings.vibrationEnabled) {
      await Haptics.impact({ style: ImpactStyle.Light });
      setTimeout(async () => {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }, 100);
      setTimeout(async () => {
        await Haptics.impact({ style: ImpactStyle.Light });
      }, 200);
    }
  }
};

// Local notifications for when app is open
export const showLocalNotification = async (title: string, body: string) => {
  const settings = getNotificationSettings();
  if (isMobile()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: settings.soundEnabled ? 'dove_coo.wav' : undefined,
          attachments: undefined,
          actionTypeId: "",
          extra: null
        }
      ]
    });
  }
};

// Initialize mobile features
export const initializeMobileFeatures = async () => {
  if (!isMobile()) return;

  // Request permissions
  try {
    await LocalNotifications.requestPermissions();
    await PushNotifications.requestPermissions();
    
    // Register for push notifications
    await PushNotifications.register();
    
    console.log('Mobile features initialized');
  } catch (error) {
    console.error('Failed to initialize mobile features:', error);
  }
};

// Play dove sound effect
export const playDoveSound = () => {
  const settings = getNotificationSettings();
  if (settings.soundEnabled && typeof Audio !== 'undefined') {
    // Create a simple beep sound since dove_coo.mp3 doesn't exist
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }
};