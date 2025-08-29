import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'tr' | 'en' | 'es' | 'de' | 'ar' | 'fr' | 'zh' | 'hi' | 'ru' | 'ja' | 'bn' | 'vi';

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
    notificationSettings: "🔔 Bildirim Ayarları",
    accountInfo: "👤 Hesap Bilgileri",
    logout: "🚪 Çıkış Yap",
    
    // Notification Settings
    vibrationEnabled: "Titreşim",
    soundEnabled: "Bildirim Sesi",
    notificationSound: "Bildirim Sesi Seçimi",
    customSound: "Özel Ses",
    uploadSound: "Ses Yükle",
    soundUploaded: "Ses Yüklendi",
    currentCustomSound: "Mevcut Özel Ses",
    dove: "Güvercin",
    bell: "Zil",
    chime: "Çıngırak", 
    ping: "Ping",
    enabled: "Açık",
    disabled: "Kapalı",
    
    // Languages
    turkish: "Türkçe",
    english: "İngilizce",
    spanish: "İspanyolca",
    german: "Almanca",
    arabic: "Arapça",
    french: "Fransızca",
    chinese: "Çince",
    hindi: "Hintçe",
    russian: "Rusça",
    japanese: "Japonca",
    bengali: "Bengalce",
    vietnamese: "Vietnamca",
    
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
    notificationSettings: "🔔 Notification Settings", 
    accountInfo: "👤 Account Info",
    logout: "🚪 Logout",
    
    // Notification Settings
    vibrationEnabled: "Vibration",
    soundEnabled: "Notification Sound",
    notificationSound: "Notification Sound Selection",
    customSound: "Custom Sound",
    uploadSound: "Upload Sound",
    soundUploaded: "Sound Uploaded",
    currentCustomSound: "Current Custom Sound",
    dove: "Dove",
    bell: "Bell",
    chime: "Chime",
    ping: "Ping", 
    enabled: "Enabled",
    disabled: "Disabled",
    
    // Languages
    turkish: "Turkish",
    english: "English", 
    spanish: "Spanish",
    german: "German",
    arabic: "Arabic",
    french: "French",
    chinese: "Chinese",
    hindi: "Hindi",
    russian: "Russian",
    japanese: "Japanese",
    bengali: "Bengali",
    vietnamese: "Vietnamese",
    
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
    notificationSettings: "🔔 Configuración de Notificaciones",
    accountInfo: "👤 Información de Cuenta", 
    logout: "🚪 Cerrar Sesión",
    
    // Notification Settings
    vibrationEnabled: "Vibración",
    soundEnabled: "Sonido de Notificación", 
    notificationSound: "Selección de Sonido de Notificación",
    customSound: "Sonido Personalizado",
    uploadSound: "Subir Sonido",
    soundUploaded: "Sonido Subido",
    currentCustomSound: "Sonido Personalizado Actual",
    dove: "Paloma",
    bell: "Campana",
    chime: "Campanilla",
    ping: "Ping",
    enabled: "Habilitado",
    disabled: "Deshabilitado",
    
    // Languages
    turkish: "Turco",
    english: "Inglés",
    spanish: "Español",
    german: "Alemán",
    arabic: "Árabe",
    french: "Francés",
    chinese: "Chino",
    hindi: "Hindi",
    russian: "Ruso",
    japanese: "Japonés",
    bengali: "Bengalí",
    vietnamese: "Vietnamita",
    
    // Connection
    enterPartnerCode: "Ingresa el código de conexión de tu pareja:",
    connectionId: "Tu Código de Conexión:",
    
    // Account
    currentEmail: "Correo Actual:",
  },
  de: {
    // Main UI
    loading: "Laden...",
    connectToPartner: "Klicke auf das Lagerfeuer, um den Verbindungslink zu kopieren",
    disconnectPartner: "Verbindung trennen",
    
    // Messages
    noConnection: "Keine Verbindung",
    connectFirst: "Verbinde dich zuerst mit deinem Partner",
    letterSent: "Taube ist geflogen! 🕊️",
    letterDelivered: "Dein Brief wurde an deinen Partner geliefert:",
    
    // Settings
    settings: "Einstellungen",
    languageSettings: "🌍 Spracheinstellungen",
    notificationSettings: "🔔 Benachrichtigungseinstellungen",
    accountInfo: "👤 Kontoinformationen",
    logout: "🚪 Abmelden",
    
    // Notification Settings
    vibrationEnabled: "Vibration",
    soundEnabled: "Benachrichtigungston",
    notificationSound: "Benachrichtigungston auswählen",
    customSound: "Benutzerdefinierter Ton",
    uploadSound: "Ton hochladen",
    soundUploaded: "Ton hochgeladen",
    currentCustomSound: "Aktueller benutzerdefinierter Ton",
    dove: "Taube",
    bell: "Glocke",
    chime: "Glöckchen",
    ping: "Ping",
    enabled: "Aktiviert",
    disabled: "Deaktiviert",
    
    // Languages
    turkish: "Türkisch",
    english: "Englisch",
    spanish: "Spanisch",
    german: "Deutsch",
    arabic: "Arabisch",
    french: "Französisch",
    chinese: "Chinesisch",
    hindi: "Hindi",
    russian: "Russisch",
    japanese: "Japanisch",
    bengali: "Bengalisch",
    vietnamese: "Vietnamesisch",
    
    // Connection
    enterPartnerCode: "Gib den Verbindungscode deines Partners ein:",
    connectionId: "Dein Verbindungscode:",
    
    // Account
    currentEmail: "Aktuelle E-Mail:",
  },
  ar: {
    // Main UI
    loading: "جاري التحميل...",
    connectToPartner: "انقر على النار لنسخ رابط الاتصال",
    disconnectPartner: "قطع الاتصال",
    
    // Messages
    noConnection: "لا يوجد اتصال",
    connectFirst: "اتصل بشريكك أولاً",
    letterSent: "طار الحمام! 🕊️",
    letterDelivered: "تم تسليم رسالتك إلى شريكك:",
    
    // Settings
    settings: "الإعدادات",
    languageSettings: "🌍 إعدادات اللغة",
    notificationSettings: "🔔 إعدادات الإشعارات",
    accountInfo: "👤 معلومات الحساب",
    logout: "🚪 تسجيل الخروج",
    
    // Notification Settings
    vibrationEnabled: "الاهتزاز",
    soundEnabled: "صوت الإشعار",
    notificationSound: "اختيار صوت الإشعار",
    customSound: "صوت مخصص",
    uploadSound: "رفع صوت",
    soundUploaded: "تم رفع الصوت",
    currentCustomSound: "الصوت المخصص الحالي",
    dove: "الحمام",
    bell: "الجرس",
    chime: "الرنين",
    ping: "بينغ",
    enabled: "مفعل",
    disabled: "معطل",
    
    // Languages
    turkish: "التركية",
    english: "الإنجليزية",
    spanish: "الإسبانية",
    german: "الألمانية",
    arabic: "العربية",
    french: "الفرنسية",
    chinese: "الصينية",
    hindi: "الهندية",
    russian: "الروسية",
    japanese: "اليابانية",
    bengali: "البنغالية",
    vietnamese: "الفيتنامية",
    
    // Connection
    enterPartnerCode: "أدخل رمز الاتصال الخاص بشريكك:",
    connectionId: "رمز الاتصال الخاص بك:",
    
    // Account
    currentEmail: "البريد الإلكتروني الحالي:",
  },
  fr: {
    // Main UI
    loading: "Chargement...",
    connectToPartner: "Cliquez sur le feu de camp pour copier le lien de connexion",
    disconnectPartner: "Déconnecter",
    
    // Messages
    noConnection: "Pas de connexion",
    connectFirst: "Connectez-vous d'abord avec votre partenaire",
    letterSent: "La colombe a volé! 🕊️",
    letterDelivered: "Votre lettre a été livrée à votre partenaire:",
    
    // Settings
    settings: "Paramètres",
    languageSettings: "🌍 Paramètres de langue",
    notificationSettings: "🔔 Paramètres de notification",
    accountInfo: "👤 Informations du compte",
    logout: "🚪 Se déconnecter",
    
    // Notification Settings
    vibrationEnabled: "Vibration",
    soundEnabled: "Son de notification",
    notificationSound: "Sélection du son de notification",
    customSound: "Son personnalisé",
    uploadSound: "Télécharger un son",
    soundUploaded: "Son téléchargé",
    currentCustomSound: "Son personnalisé actuel",
    dove: "Colombe",
    bell: "Cloche",
    chime: "Carillon",
    ping: "Ping",
    enabled: "Activé",
    disabled: "Désactivé",
    
    // Languages
    turkish: "Turc",
    english: "Anglais",
    spanish: "Espagnol",
    german: "Allemand",
    arabic: "Arabe",
    french: "Français",
    chinese: "Chinois",
    hindi: "Hindi",
    russian: "Russe",
    japanese: "Japonais",
    bengali: "Bengali",
    vietnamese: "Vietnamien",
    
    // Connection
    enterPartnerCode: "Entrez le code de connexion de votre partenaire:",
    connectionId: "Votre code de connexion:",
    
    // Account
    currentEmail: "E-mail actuel:",
  },
  zh: {
    // Main UI
    loading: "加载中...",
    connectToPartner: "点击篝火复制连接链接",
    disconnectPartner: "断开连接",
    
    // Messages
    noConnection: "无连接",
    connectFirst: "请先与您的伴侣连接",
    letterSent: "鸽子飞走了! 🕊️",
    letterDelivered: "您的信件已送达您的伴侣:",
    
    // Settings
    settings: "设置",
    languageSettings: "🌍 语言设置",
    notificationSettings: "🔔 通知设置",
    accountInfo: "👤 账户信息",
    logout: "🚪 退出登录",
    
    // Notification Settings
    vibrationEnabled: "振动",
    soundEnabled: "通知声音",
    notificationSound: "通知声音选择",
    customSound: "自定义声音",
    uploadSound: "上传声音",
    soundUploaded: "声音已上传",
    currentCustomSound: "当前自定义声音",
    dove: "鸽子",
    bell: "铃声",
    chime: "钟声",
    ping: "提示音",
    enabled: "已启用",
    disabled: "已禁用",
    
    // Languages
    turkish: "土耳其语",
    english: "英语",
    spanish: "西班牙语",
    german: "德语",
    arabic: "阿拉伯语",
    french: "法语",
    chinese: "中文",
    hindi: "印地语",
    russian: "俄语",
    japanese: "日语",
    bengali: "孟加拉语",
    vietnamese: "越南语",
    
    // Connection
    enterPartnerCode: "输入您伴侣的连接代码:",
    connectionId: "您的连接代码:",
    
    // Account
    currentEmail: "当前邮箱:",
  },
  hi: {
    // Main UI
    loading: "लोड हो रहा है...",
    connectToPartner: "कनेक्शन लिंक कॉपी करने के लिए कैंपफायर पर क्लिक करें",
    disconnectPartner: "कनेक्शन बंद करें",
    
    // Messages
    noConnection: "कोई कनेक्शन नहीं",
    connectFirst: "पहले अपने साथी के साथ जुड़ें",
    letterSent: "कबूतर उड़ गया! 🕊️",
    letterDelivered: "आपका पत्र आपके साथी को पहुंचा दिया गया:",
    
    // Settings
    settings: "सेटिंग्स",
    languageSettings: "🌍 भाषा सेटिंग्स",
    notificationSettings: "🔔 नोटिफिकेशन सेटिंग्स",
    accountInfo: "👤 खाता जानकारी",
    logout: "🚪 लॉग आउट",
    
    // Notification Settings
    vibrationEnabled: "कंपन",
    soundEnabled: "नोटिफिकेशन साउंड",
    notificationSound: "नोटिफिकेशन साउंड चयन",
    customSound: "कस्टम साउंड",
    uploadSound: "साउंड अपलोड करें",
    soundUploaded: "साउंड अपलोड हो गया",
    currentCustomSound: "वर्तमान कस्टम साउंड",
    dove: "कबूतर",
    bell: "घंटी",
    chime: "झंकार",
    ping: "पिंग",
    enabled: "सक्षम",
    disabled: "निष्क्रिय",
    
    // Languages
    turkish: "तुर्की",
    english: "अंग्रेजी",
    spanish: "स्पेनिश",
    german: "जर्मन",
    arabic: "अरबी",
    french: "फ्रेंच",
    chinese: "चीनी",
    hindi: "हिन्दी",
    russian: "रूसी",
    japanese: "जापानी",
    bengali: "बंगाली",
    vietnamese: "वियतनामी",
    
    // Connection
    enterPartnerCode: "अपने साथी का कनेक्शन कोड दर्ज करें:",
    connectionId: "आपका कनेक्शन कोड:",
    
    // Account
    currentEmail: "वर्तमान ईमेल:",
  },
  ru: {
    // Main UI
    loading: "Загрузка...",
    connectToPartner: "Нажмите на костер, чтобы скопировать ссылку для подключения",
    disconnectPartner: "Отключиться",
    
    // Messages
    noConnection: "Нет соединения",
    connectFirst: "Сначала подключитесь к своему партнеру",
    letterSent: "Голубь улетел! 🕊️",
    letterDelivered: "Ваше письмо доставлено вашему партнеру:",
    
    // Settings
    settings: "Настройки",
    languageSettings: "🌍 Языковые настройки",
    notificationSettings: "🔔 Настройки уведомлений",
    accountInfo: "👤 Информация об аккаунте",
    logout: "🚪 Выйти",
    
    // Notification Settings
    vibrationEnabled: "Вибрация",
    soundEnabled: "Звук уведомлений",
    notificationSound: "Выбор звука уведомлений",
    customSound: "Пользовательский звук",
    uploadSound: "Загрузить звук",
    soundUploaded: "Звук загружен",
    currentCustomSound: "Текущий пользовательский звук",
    dove: "Голубь",
    bell: "Колокольчик",
    chime: "Звонок",
    ping: "Пинг",
    enabled: "Включено",
    disabled: "Отключено",
    
    // Languages
    turkish: "Турецкий",
    english: "Английский",
    spanish: "Испанский",
    german: "Немецкий",
    arabic: "Арабский",
    french: "Французский",
    chinese: "Китайский",
    hindi: "Хинди",
    russian: "Русский",
    japanese: "Японский",
    bengali: "Бенгальский",
    vietnamese: "Вьетнамский",
    
    // Connection
    enterPartnerCode: "Введите код подключения вашего партнера:",
    connectionId: "Ваш код подключения:",
    
    // Account
    currentEmail: "Текущий email:",
  },
  ja: {
    // Main UI
    loading: "読み込み中...",
    connectToPartner: "キャンプファイヤーをクリックして接続リンクをコピー",
    disconnectPartner: "接続を切断",
    
    // Messages
    noConnection: "接続なし",
    connectFirst: "まずパートナーと接続してください",
    letterSent: "鳩が飛びました! 🕊️",
    letterDelivered: "あなたの手紙がパートナーに届けられました:",
    
    // Settings
    settings: "設定",
    languageSettings: "🌍 言語設定",
    notificationSettings: "🔔 通知設定",
    accountInfo: "👤 アカウント情報",
    logout: "🚪 ログアウト",
    
    // Notification Settings
    vibrationEnabled: "振動",
    soundEnabled: "通知音",
    notificationSound: "通知音選択",
    customSound: "カスタム音",
    uploadSound: "音をアップロード",
    soundUploaded: "音がアップロードされました",
    currentCustomSound: "現在のカスタム音",
    dove: "鳩",
    bell: "ベル",
    chime: "チャイム",
    ping: "ピング",
    enabled: "有効",
    disabled: "無効",
    
    // Languages
    turkish: "トルコ語",
    english: "英語",
    spanish: "スペイン語",
    german: "ドイツ語",
    arabic: "アラビア語",
    french: "フランス語",
    chinese: "中国語",
    hindi: "ヒンディー語",
    russian: "ロシア語",
    japanese: "日本語",
    bengali: "ベンガル語",
    vietnamese: "ベトナム語",
    
    // Connection
    enterPartnerCode: "パートナーの接続コードを入力:",
    connectionId: "あなたの接続コード:",
    
    // Account
    currentEmail: "現在のメール:",
  },
  bn: {
    // Main UI
    loading: "লোড হচ্ছে...",
    connectToPartner: "সংযোগ লিঙ্ক কপি করতে ক্যাম্পফায়ারে ক্লিক করুন",
    disconnectPartner: "সংযোগ বিচ্ছিন্ন করুন",
    
    // Messages
    noConnection: "কোনো সংযোগ নেই",
    connectFirst: "প্রথমে আপনার সঙ্গীর সাথে সংযোগ করুন",
    letterSent: "কবুতর উড়ে গেছে! 🕊️",
    letterDelivered: "আপনার চিঠি আপনার সঙ্গীর কাছে পৌঁছে দেওয়া হয়েছে:",
    
    // Settings
    settings: "সেটিংস",
    languageSettings: "🌍 ভাষা সেটিংস",
    notificationSettings: "🔔 বিজ্ঞপ্তি সেটিংস",
    accountInfo: "👤 অ্যাকাউন্ট তথ্য",
    logout: "🚪 লগ আউট",
    
    // Notification Settings
    vibrationEnabled: "কম্পন",
    soundEnabled: "বিজ্ঞপ্তি শব্দ",
    notificationSound: "বিজ্ঞপ্তি শব্দ নির্বাচন",
    customSound: "কাস্টম শব্দ",
    uploadSound: "শব্দ আপলোড করুন",
    soundUploaded: "শব্দ আপলোড হয়েছে",
    currentCustomSound: "বর্তমান কাস্টম শব্দ",
    dove: "কবুতর",
    bell: "ঘণ্টা",
    chime: "চাইম",
    ping: "পিং",
    enabled: "সক্রিয়",
    disabled: "নিষ্ক্রিয়",
    
    // Languages
    turkish: "তুর্কি",
    english: "ইংরেজি",
    spanish: "স্প্যানিশ",
    german: "জার্মান",
    arabic: "আরবি",
    french: "ফরাসি",
    chinese: "চীনা",
    hindi: "হিন্দি",
    russian: "রাশিয়ান",
    japanese: "জাপানি",
    bengali: "বাংলা",
    vietnamese: "ভিয়েতনামি",
    
    // Connection
    enterPartnerCode: "আপনার সঙ্গীর সংযোগ কোড প্রবেশ করান:",
    connectionId: "আপনার সংযোগ কোড:",
    
    // Account
    currentEmail: "বর্তমান ইমেইল:",
  },
  vi: {
    // Main UI
    loading: "Đang tải...",
    connectToPartner: "Nhấp vào lửa trại để sao chép liên kết kết nối",
    disconnectPartner: "Ngắt kết nối",
    
    // Messages
    noConnection: "Không có kết nối",
    connectFirst: "Hãy kết nối với đối tác của bạn trước",
    letterSent: "Chim bồ câu đã bay! 🕊️",
    letterDelivered: "Thư của bạn đã được gửi đến đối tác:",
    
    // Settings
    settings: "Cài đặt",
    languageSettings: "🌍 Cài đặt ngôn ngữ",
    notificationSettings: "🔔 Cài đặt thông báo",
    accountInfo: "👤 Thông tin tài khoản",
    logout: "🚪 Đăng xuất",
    
    // Notification Settings
    vibrationEnabled: "Rung",
    soundEnabled: "Âm thanh thông báo",
    notificationSound: "Chọn âm thanh thông báo",
    customSound: "Âm thanh tùy chỉnh",
    uploadSound: "Tải lên âm thanh",
    soundUploaded: "Âm thanh đã tải lên",
    currentCustomSound: "Âm thanh tùy chỉnh hiện tại",
    dove: "Chim bồ câu",
    bell: "Chuông",
    chime: "Tiếng chuông",
    ping: "Ping",
    enabled: "Đã bật",
    disabled: "Đã tắt",
    
    // Languages
    turkish: "Tiếng Thổ Nhĩ Kỳ",
    english: "Tiếng Anh",
    spanish: "Tiếng Tây Ban Nha",
    german: "Tiếng Đức",
    arabic: "Tiếng Ả Rập",
    french: "Tiếng Pháp",
    chinese: "Tiếng Trung",
    hindi: "Tiếng Hindi",
    russian: "Tiếng Nga",
    japanese: "Tiếng Nhật",
    bengali: "Tiếng Bengal",
    vietnamese: "Tiếng Việt",
    
    // Connection
    enterPartnerCode: "Nhập mã kết nối của đối tác:",
    connectionId: "Mã kết nối của bạn:",
    
    // Account
    currentEmail: "Email hiện tại:",
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
    { code: 'es' as Language, name: 'Español' },
    { code: 'de' as Language, name: 'Deutsch' },
    { code: 'ar' as Language, name: 'العربية' },
    { code: 'fr' as Language, name: 'Français' },
    { code: 'zh' as Language, name: '中文' },
    { code: 'hi' as Language, name: 'हिन्दी' },
    { code: 'ru' as Language, name: 'Русский' },
    { code: 'ja' as Language, name: '日本語' },
    { code: 'bn' as Language, name: 'বাংলা' },
    { code: 'vi' as Language, name: 'Tiếng Việt' }
  ];

  return {
    language,
    changeLanguage,
    t,
    getLanguages
  };
};