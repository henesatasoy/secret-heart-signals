import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bdd2e3462ef348dabcd92ebcadcdd947',
  appName: 'secret-heart-signals',
  webDir: 'dist',
  server: {
    url: 'https://bdd2e346-2ef3-48da-bcd9-2ebcadcdd947.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#CE9FFC",
      sound: "beep.wav",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;