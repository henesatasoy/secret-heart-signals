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
    language: "Dil",
    notificationSettings: "🔔 Bildirim Ayarları",
    notifications: "Bildirim",
    accountInfo: "👤 Hesap Bilgileri",
    account: "Hesap",
    logout: "🚪 Çıkış Yap",
    
    // Notification Settings
    vibrationEnabled: "Titreşim",
    soundEnabled: "Bildirim Sesi",
    backgroundMusic: "Arka Plan Müziği",
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
    connected: "Bağlandı! 💕",
    clickToMessage: "Mesajlaşmak için tıkla",
    goToMessages: "Mesajlaşmaya Git",
    linkCopied: "Link kopyalandı! 💕",
    shareWithPartner: "Bu linki sevgilinle paylaş",
    linkCopyFailed: "Link kopyalanamadı",
    manualCopy: "Lütfen manuel olarak kopyala",
    invalidConnection: "Geçersiz bağlantı",
    selfConnection: "Kendinizle bağlantı kuramazsınız",
    invalidConnectionCode: "Geçersiz bağlantı kodu",
    wrongFormat: "Bağlantı kodu formatı yanlış",
    invalidSession: "Oturum geçersiz",
    loginAgain: "Lütfen tekrar giriş yapın",
    connectionFailed: "Bağlantı oluşturulamadı",
    linkNotReady: "Bağlantı linki henüz hazır değil",
    urlProcessError: "URL işleme hatası",
    urlProcessFailed: "Bağlantı URL'si işlenirken hata oluştu",
    
    // Clipboard & Notifications
    copiedShort: "Kopyalandı!",
    copiedToClipboard: "İçerik panoya kopyalandı",
    copyError: "Kopyalama hatası",
    unknownError: "Bilinmeyen hata",
    connectionError: "Bağlantı hatası",
    cantDisconnectSelf: "Kendi bağlantınız koparılamadı",
    disconnected: "Bağlantı koptu 💔",
    notConnectedAnymore: "Artık bağlı değilsiniz",
    cantDisconnect: "Bağlantı koparılamadı",
    realtimeConnectionError: "Gerçek zamanlı bağlantı hatası",
    cantValidateConnection: "Bağlantı doğrulanamadı - lütfen tekrar deneyin",
    unknownConnectionError: "Bilinmeyen bağlantı hatası",
    canNowMessage: "Sevgilinle artık mesajlaşabilirsin",
    serverConnectionFailed: "Sunucu bağlantısı kurulamadı",
    linkCreationFailed: "Link oluşturulamadı",
    pleaseLoginFirst: "Lütfen önce geçerli bir hesapla giriş yapın",
    
    // Account
    currentEmail: "Mevcut E-posta:",
    userId: "Kullanıcı ID",
    email: "E-posta",
    
    // Auth
    emailConfirmation: "📧 Email Doğrulama",
    emailSent: "doğrulama emaili gönderildi",
    tooFast: "Çok hızlı",
    waitSeconds: "saniye bekleyin",
    emailSentSuccess: "Email gönderildi! 📧",
    newConfirmationSent: "Yeni doğrulama emaili gönderildi",
    emailSendFailed: "Email gönderilemedi",
    errorOccurred: "Bir hata oluştu",
    todoList: "Yapılacaklar:",
    checkEmail: "• Email kutunu kontrol et",
    checkSpam: "• Spam/Junk klasörünü kontrol et",
    clickConfirm: "• \"Confirm your email\" linkine tıkla",
    returnAndLogin: "• Sonra buraya geri gel ve giriş yap",
    emailNotReceived: "Email gelmediyse:",
    wait5to10: "• 5-10 dakika bekle",
    checkSpamFolder: "• Spam klasörünü kontrol et",
    clickResend: "• Aşağıdaki butona tıklayarak tekrar gönder",
    sending: "Gönderiliyor...",
    waitTime: "bekle",
    resend: "Tekrar Gönder",
    refreshAfterConfirm: "Doğruladıktan sonra bu sayfayı yenile",
    loginSuccessful: "Giriş başarılı! 💕",
    readyToConnect: "Sevgilinle bağlanmaya hazırsın",
    signupSuccessful: "Kayıt başarılı! 📧",
    confirmAndLogin: "Email adresini doğrula ve giriş yap",
    signupSuccessfulWelcome: "Kayıt başarılı! 💕",
    accountCreated: "Hesabın oluşturuldu, hoş geldin!",
    error: "Hata",
    sessionCheck: "🔍 Oturum kontrol ediliyor...",
    backToLogin: "Giriş sayfasına dön",
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
    language: "Language",
    notificationSettings: "🔔 Notification Settings",
    notifications: "Notifications", 
    accountInfo: "👤 Account Info",
    account: "Account",
    logout: "🚪 Logout",
    
    // Notification Settings
    vibrationEnabled: "Vibration",
    soundEnabled: "Notification Sound",
    backgroundMusic: "Background Music",
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
    connected: "Connected! 💕",
    clickToMessage: "Click to message",
    goToMessages: "Go to Messages",
    linkCopied: "Link copied! 💕",
    shareWithPartner: "Share this link with your partner",
    linkCopyFailed: "Link copy failed",
    manualCopy: "Please copy manually",
    invalidConnection: "Invalid connection",
    selfConnection: "Cannot connect to yourself",
    invalidConnectionCode: "Invalid connection code",
    wrongFormat: "Wrong connection code format",
    invalidSession: "Invalid session",
    loginAgain: "Please login again",
    connectionFailed: "Connection failed",
    linkNotReady: "Connection link not ready yet",
    urlProcessError: "URL processing error",
    urlProcessFailed: "Error occurred while processing connection URL",
    
    // Clipboard & Notifications
    copiedShort: "Copied!",
    copiedToClipboard: "Content copied to clipboard",
    copyError: "Copy error",
    unknownError: "Unknown error",
    connectionError: "Connection error",
    cantDisconnectSelf: "Your connection could not be disconnected",
    disconnected: "Connection broken 💔",
    notConnectedAnymore: "You are no longer connected",
    cantDisconnect: "Connection could not be disconnected",
    realtimeConnectionError: "Real-time connection error",
    cantValidateConnection: "Connection could not be validated - please try again",
    unknownConnectionError: "Unknown connection error",
    canNowMessage: "You can now message with your partner",
    serverConnectionFailed: "Server connection failed",
    linkCreationFailed: "Link creation failed",
    pleaseLoginFirst: "Please login with a valid account first",
    
    // Account
    currentEmail: "Current Email:",
    userId: "User ID",
    email: "Email",
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
    language: "Idioma",
    notificationSettings: "🔔 Configuración de Notificaciones",
    notifications: "Notificaciones",
    accountInfo: "👤 Información de Cuenta",
    account: "Cuenta", 
    logout: "🚪 Cerrar Sesión",
    
    // Notification Settings
    vibrationEnabled: "Vibración",
    soundEnabled: "Sonido de Notificación",
    backgroundMusic: "Música de Fondo",
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
    connected: "¡Conectado! 💕",
    clickToMessage: "Haz clic para enviar mensajes",
    goToMessages: "Ir a Mensajes",
    linkCopied: "¡Enlace copiado! 💕",
    shareWithPartner: "Comparte este enlace con tu pareja",
    linkCopyFailed: "Error al copiar enlace",
    manualCopy: "Por favor copia manualmente",
    invalidConnection: "Conexión inválida",
    selfConnection: "No puedes conectarte contigo mismo",
    invalidConnectionCode: "Código de conexión inválido",
    wrongFormat: "Formato de código de conexión incorrecto",
    invalidSession: "Sesión inválida",
    loginAgain: "Por favor inicia sesión de nuevo",
    connectionFailed: "Falló la conexión",
    linkNotReady: "El enlace de conexión aún no está listo",
    urlProcessError: "Error de procesamiento de URL",
    urlProcessFailed: "Error al procesar la URL de conexión",
    
    // Clipboard & Notifications
    copiedShort: "¡Copiado!",
    copiedToClipboard: "Contenido copiado al portapapeles",
    copyError: "Error de copia",
    unknownError: "Error desconocido",
    connectionError: "Error de conexión",
    cantDisconnectSelf: "Tu conexión no pudo ser desconectada",
    disconnected: "Conexión rota 💔",
    notConnectedAnymore: "Ya no estás conectado",
    cantDisconnect: "La conexión no pudo ser desconectada",
    realtimeConnectionError: "Error de conexión en tiempo real",
    cantValidateConnection: "La conexión no pudo ser validada - inténtalo de nuevo",
    unknownConnectionError: "Error de conexión desconocido",
    canNowMessage: "Ahora puedes enviar mensajes con tu pareja",
    serverConnectionFailed: "Falló la conexión al servidor",
    linkCreationFailed: "Falló la creación del enlace",
    pleaseLoginFirst: "Por favor inicia sesión con una cuenta válida primero",
    
    // Account
    currentEmail: "Correo Actual:",
    userId: "ID de Usuario",
    email: "Correo",
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
    language: "Sprache",
    notificationSettings: "🔔 Benachrichtigungseinstellungen",
    notifications: "Benachrichtigungen",
    accountInfo: "👤 Kontoinformationen",
    account: "Konto",
    logout: "🚪 Abmelden",
    
    // Notification Settings
    vibrationEnabled: "Vibration",
    soundEnabled: "Benachrichtigungston",
    backgroundMusic: "Hintergrundmusik",
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
    connected: "Verbunden! 💕",
    clickToMessage: "Klicken zum Nachrichtenschreiben",
    goToMessages: "Zu Nachrichten",
    linkCopied: "Link kopiert! 💕",
    shareWithPartner: "Teile diesen Link mit deinem Partner",
    linkCopyFailed: "Link kopieren fehlgeschlagen",
    manualCopy: "Bitte manuell kopieren",
    invalidConnection: "Ungültige Verbindung",
    selfConnection: "Du kannst dich nicht mit dir selbst verbinden",
    invalidConnectionCode: "Ungültiger Verbindungscode",
    wrongFormat: "Falsches Verbindungscode-Format",
    invalidSession: "Ungültige Sitzung",
    loginAgain: "Bitte erneut anmelden",
    connectionFailed: "Verbindung fehlgeschlagen",
    linkNotReady: "Verbindungslink noch nicht bereit",
    urlProcessError: "URL-Verarbeitungsfehler",
    urlProcessFailed: "Fehler beim Verarbeiten der Verbindungs-URL",
    
    // Clipboard & Notifications
    copiedShort: "Kopiert!",
    copiedToClipboard: "Inhalt in Zwischenablage kopiert",
    copyError: "Kopierfehler",
    unknownError: "Unbekannter Fehler",
    connectionError: "Verbindungsfehler",
    cantDisconnectSelf: "Deine Verbindung konnte nicht getrennt werden",
    disconnected: "Verbindung getrennt 💔",
    notConnectedAnymore: "Du bist nicht mehr verbunden",
    cantDisconnect: "Verbindung konnte nicht getrennt werden",
    realtimeConnectionError: "Echtzeit-Verbindungsfehler",
    cantValidateConnection: "Verbindung konnte nicht validiert werden - bitte erneut versuchen",
    unknownConnectionError: "Unbekannter Verbindungsfehler",
    canNowMessage: "Du kannst jetzt mit deinem Partner Nachrichten schreiben",
    serverConnectionFailed: "Serververbindung fehlgeschlagen",
    linkCreationFailed: "Link-Erstellung fehlgeschlagen",
    pleaseLoginFirst: "Bitte melde dich zuerst mit einem gültigen Konto an",
    
    // Account
    currentEmail: "Aktuelle E-Mail:",
    userId: "Benutzer-ID",
    email: "E-Mail",
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
    language: "اللغة",
    notificationSettings: "🔔 إعدادات الإشعارات",
    notifications: "الإشعارات",
    accountInfo: "👤 معلومات الحساب",
    account: "الحساب",
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
    connected: "متصل! 💕",
    clickToMessage: "انقر للمراسلة",
    goToMessages: "الذهاب للرسائل",
    linkCopied: "تم نسخ الرابط! 💕",
    shareWithPartner: "شارك هذا الرابط مع شريكك",
    linkCopyFailed: "فشل نسخ الرابط",
    manualCopy: "يرجى النسخ يدوياً",
    invalidConnection: "اتصال غير صالح",
    selfConnection: "لا يمكنك الاتصال بنفسك",
    invalidConnectionCode: "رمز اتصال غير صالح",
    wrongFormat: "تنسيق رمز الاتصال خطأ",
    invalidSession: "جلسة غير صالحة",
    loginAgain: "يرجى تسجيل الدخول مرة أخرى",
    connectionFailed: "فشل الاتصال",
    linkNotReady: "رابط الاتصال غير جاهز بعد",
    urlProcessError: "خطأ في معالجة الرابط",
    urlProcessFailed: "خطأ في معالجة رابط الاتصال",
    
    // Clipboard & Notifications
    copiedShort: "تم النسخ!",
    copiedToClipboard: "تم نسخ المحتوى إلى الحافظة",
    copyError: "خطأ في النسخ",
    unknownError: "خطأ غير معروف",
    connectionError: "خطأ في الاتصال",
    cantDisconnectSelf: "لا يمكن قطع اتصالك",
    disconnected: "انقطع الاتصال 💔",
    notConnectedAnymore: "لم تعد متصلاً",
    cantDisconnect: "لا يمكن قطع الاتصال",
    realtimeConnectionError: "خطأ في الاتصال المباشر",
    cantValidateConnection: "لا يمكن التحقق من الاتصال - يرجى المحاولة مرة أخرى",
    unknownConnectionError: "خطأ اتصال غير معروف",
    canNowMessage: "يمكنك الآن المراسلة مع شريكك",
    serverConnectionFailed: "فشل الاتصال بالخادم",
    linkCreationFailed: "فشل إنشاء الرابط",
    pleaseLoginFirst: "يرجى تسجيل الدخول بحساب صالح أولاً",
    
    // Account
    currentEmail: "البريد الإلكتروني الحالي:",
    userId: "معرف المستخدم",
    email: "البريد الإلكتروني",
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
    language: "Langue",
    notificationSettings: "🔔 Paramètres de notification",
    notifications: "Notifications",
    accountInfo: "👤 Informations du compte",
    account: "Compte",
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
    connected: "Connecté! 💕",
    clickToMessage: "Cliquez pour envoyer un message",
    goToMessages: "Aller aux Messages",
    linkCopied: "Lien copié! 💕",
    shareWithPartner: "Partagez ce lien avec votre partenaire",
    linkCopyFailed: "Échec de la copie du lien",
    manualCopy: "Veuillez copier manuellement",
    invalidConnection: "Connexion invalide",
    selfConnection: "Vous ne pouvez pas vous connecter à vous-même",
    invalidConnectionCode: "Code de connexion invalide",
    wrongFormat: "Format de code de connexion incorrect",
    invalidSession: "Session invalide",
    loginAgain: "Veuillez vous reconnecter",
    connectionFailed: "Connexion échouée",
    linkNotReady: "Le lien de connexion n'est pas encore prêt",
    urlProcessError: "Erreur de traitement d'URL",
    urlProcessFailed: "Erreur lors du traitement de l'URL de connexion",
    
    // Clipboard & Notifications
    copiedShort: "Copié!",
    copiedToClipboard: "Contenu copié dans le presse-papiers",
    copyError: "Erreur de copie",
    unknownError: "Erreur inconnue",
    connectionError: "Erreur de connexion",
    cantDisconnectSelf: "Votre connexion n'a pas pu être déconnectée",
    disconnected: "Connexion interrompue 💔",
    notConnectedAnymore: "Vous n'êtes plus connecté",
    cantDisconnect: "La connexion n'a pas pu être interrompue",
    realtimeConnectionError: "Erreur de connexion en temps réel",
    cantValidateConnection: "La connexion n'a pas pu être validée - veuillez réessayer",
    unknownConnectionError: "Erreur de connexion inconnue",
    canNowMessage: "Vous pouvez maintenant envoyer des messages avec votre partenaire",
    serverConnectionFailed: "Échec de la connexion au serveur",
    linkCreationFailed: "Échec de la création du lien",
    pleaseLoginFirst: "Veuillez d'abord vous connecter avec un compte valide",
    
    // Account
    currentEmail: "E-mail actuel:",
    userId: "ID Utilisateur",
    email: "E-mail",
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
    language: "语言",
    notificationSettings: "🔔 通知设置",
    notifications: "通知",
    accountInfo: "👤 账户信息",
    account: "账户",
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
    language: "भाषा",
    notificationSettings: "🔔 नोटिफिकेशन सेटिंग्स",
    notifications: "नोटिफिकेशन",
    accountInfo: "👤 खाता जानकारी",
    account: "खाता",
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
    language: "Язык",
    notificationSettings: "🔔 Настройки уведомлений",
    notifications: "Уведомления",
    accountInfo: "👤 Информация об аккаунте",
    account: "Аккаунт",
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
    language: "言語",
    notificationSettings: "🔔 通知設定",
    notifications: "通知",
    accountInfo: "👤 アカウント情報",
    account: "アカウント",
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
    language: "ভাষা",
    notificationSettings: "🔔 বিজ্ঞপ্তি সেটিংস",
    notifications: "বিজ্ঞপ্তি",
    accountInfo: "👤 অ্যাকাউন্ট তথ্য",
    account: "অ্যাকাউন্ট",
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
    language: "Ngôn ngữ",
    notificationSettings: "🔔 Cài đặt thông báo",
    notifications: "Thông báo",
    accountInfo: "👤 Thông tin tài khoản",
    account: "Tài khoản",
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