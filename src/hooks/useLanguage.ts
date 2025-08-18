import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'tr' | 'en' | 'es';

const translations = {
  tr: {
    // Main UI
    loading: "Yükleniyor...",
    connectToPartner: "Kampateş'a tıkla ve bağlantı linkini kopyala",
    disconnectPartner: "Bağlantıyı Kes",
    
    // Messages
    noConnection: "Bağlantı yok",
    connectFirst: "Önce sevgilinle bağlan",
    letterSent: "Güvercin uçtu! 🕊️",
    letterDelivered: "Mektubun sevgiline ulaştırıldı:",
    
    // Settings
    settings: "Ayarlar",
    languageSettings: "🌍 Dil Ayarları",
    accountInfo: "👤 Hesap Bilgileri",
    logout: "🚪 Çıkış Yap",
    
    // Languages
    turkish: "Türkçe",
    english: "İngilizce",
    spanish: "İspanyolca",
    
    // Connection
    enterPartnerCode: "Sevgilinin bağlantı kodunu gir:",
    connectionId: "Bağlantı Kodun:",
    
    // Account
    currentEmail: "Mevcut E-posta:",
  },
  en: {
    // Main UI
    loading: "Loading...",
    connectToPartner: "Click the campfire to copy connection link",
    disconnectPartner: "Disconnect",
    
    // Messages
    noConnection: "No connection",
    connectFirst: "Connect with your partner first",
    letterSent: "Dove flew! 🕊️",
    letterDelivered: "Your letter was delivered to your partner:",
    
    // Settings
    settings: "Settings",
    languageSettings: "🌍 Language Settings",
    accountInfo: "👤 Account Info",
    logout: "🚪 Logout",
    
    // Languages
    turkish: "Turkish",
    english: "English", 
    spanish: "Spanish",
    
    // Connection
    enterPartnerCode: "Enter your partner's connection code:",
    connectionId: "Your Connection Code:",
    
    // Account
    currentEmail: "Current Email:",
  },
  es: {
    // Main UI
    loading: "Cargando...",
    connectToPartner: "Haz clic en la fogata para copiar el enlace de conexión",
    disconnectPartner: "Desconectar",
    
    // Messages
    noConnection: "Sin conexión",
    connectFirst: "Conecta con tu pareja primero",
    letterSent: "¡La paloma voló! 🕊️",
    letterDelivered: "Tu carta fue entregada a tu pareja:",
    
    // Settings
    settings: "Configuración",
    languageSettings: "🌍 Configuración de Idioma",
    accountInfo: "👤 Información de Cuenta",
    logout: "🚪 Cerrar Sesión",
    
    // Languages
    turkish: "Turco",
    english: "Inglés",
    spanish: "Español",
    
    // Connection
    enterPartnerCode: "Ingresa el código de conexión de tu pareja:",
    connectionId: "Tu Código de Conexión:",
    
    // Account
    currentEmail: "Correo Actual:",
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: keyof typeof translations.tr): string => {
    return translations[language][key] || translations.tr[key] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const getLanguages = () => [
    { code: 'tr' as Language, name: 'Türkçe' },
    { code: 'en' as Language, name: 'English' },
    { code: 'es' as Language, name: 'Español' }
  ];

  return {
    language,
    changeLanguage,
    t,
    getLanguages
  };
};