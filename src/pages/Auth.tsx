import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, cleanupCorruptedAuthState } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Heart, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'

// Enhanced auth state cleanup utility
const cleanupAuthState = () => {
  console.log('🧹 Cleaning up authentication state...')
  
  // Use the imported cleanup function
  cleanupCorruptedAuthState()
  
  // Additional cleanup for this component
  if (typeof window !== 'undefined') {
    // Clear any cached auth state
    try {
      // Force clear any remaining supabase instances
      if ((window as any).supabase) {
        delete (window as any).supabase
      }
    } catch (error) {
      console.warn('⚠️ Window cleanup error:', error)
    }
  }
}

// Global error handler for auth errors
const handleAuthError = (error: any) => {
  console.error('🚨 Auth error detected:', error)
  
  // Check for specific refresh token errors
  if (error && typeof error === 'object') {
    const errorMessage = error.message || error.error_description || ''
    
    if (errorMessage.includes('refresh_token_not_found') || 
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('JWT') ||
        errorMessage.includes('session_not_found')) {
      console.log('🔄 Auth token corruption detected, cleaning up...')
      cleanupAuthState()
      
      // Force page reload after cleanup
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 500)
    }
  }
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Enhanced authentication check with aggressive cleanup
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth state check...')
      setIsInitializing(true)
      
      try {
        // Step 1: Aggressive cleanup first
        console.log('🧹 Starting aggressive auth cleanup...')
        cleanupAuthState()
        
        // Step 2: Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Step 3: Set up auth error handler
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('🔄 Auth state change:', event, session?.user?.id)
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('✅ Token refreshed successfully')
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out')
            cleanupAuthState()
          } else if (event === 'SIGNED_IN') {
            console.log('👤 User signed in:', session?.user?.id)
            navigate('/', { replace: true })
          }
        })
        
        // Step 4: Check current session with error handling
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('🚨 Session check error:', error)
            handleAuthError(error)
            return
          }
          
          if (session && session.user) {
            console.log('✅ Valid session found, user:', session.user.id)
            
            // Verify session is not corrupted
            if (session.access_token && session.refresh_token) {
              console.log('🔑 Session tokens valid, redirecting...')
              navigate('/', { replace: true })
            } else {
              console.warn('⚠️ Session tokens missing, cleaning up...')
              cleanupAuthState()
              await supabase.auth.signOut()
            }
          } else {
            console.log('ℹ️ No valid session found')
          }
        } catch (sessionError) {
          console.error('💥 Session check failed:', sessionError)
          handleAuthError(sessionError)
        }
        
        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe()
        }
        
      } catch (error) {
        console.error('💥 Auth initialization failed:', error)
        handleAuthError(error)
      } finally {
        setIsInitializing(false)
      }
    }
    
    initializeAuth()
  }, [navigate])

  // Enhanced input validation
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validatePassword = useCallback((password: string): boolean => {
    return password.length >= 6 && password.length <= 128
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setAuthError(null)
    
    // Enhanced input validation
    if (!email.trim()) {
      setAuthError('Email adresi gerekli')
      return
    }
    
    if (!validateEmail(email.trim())) {
      setAuthError('Geçerli bir email adresi girin')
      return
    }
    
    if (!password) {
      setAuthError('Şifre gerekli')
      return
    }
    
    if (!validatePassword(password)) {
      setAuthError('Şifre 6-128 karakter arasında olmalı')
      return
    }

    setLoading(true)
    console.log(`🚀 Starting ${isLogin ? 'login' : 'signup'} process...`)

    try {
      const trimmedEmail = email.trim().toLowerCase()
      
      // PRE-AUTH CLEANUP - Always clean before auth operations
      console.log('🧹 Pre-auth cleanup...')
      cleanupAuthState()
      
      // Force sign out any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' })
        console.log('🔄 Global signout completed')
      } catch (signOutError) {
        console.log('ℹ️ Global signout failed (expected):', signOutError)
      }
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (isLogin) {
        console.log('🔐 Attempting login for:', trimmedEmail)
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        
        if (error) {
          console.error('❌ Login error:', error)
          handleAuthError(error)
          throw new Error(getAuthErrorMessage(error))
        }
        
        if (!data.user || !data.session) {
          throw new Error('Login başarısız - kullanıcı bilgisi alınamadı')
        }
        
        // Verify session integrity
        if (!data.session.access_token || !data.session.refresh_token) {
          console.error('🚨 Session tokens missing after login')
          cleanupAuthState()
          throw new Error('Oturum bilgileri eksik - tekrar deneyin')
        }
        
        console.log('✅ Login successful for user:', data.user.id)
        toast({
          title: "Giriş başarılı! 💕",
          description: "Sevgilinle bağlanmaya hazırsın",
        })
        
        // Force full page reload for absolutely clean state
        setTimeout(() => {
          window.location.replace('/')
        }, 100)
        
      } else {
        console.log('📝 Attempting signup for:', trimmedEmail)
        
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              created_at: new Date().toISOString(),
              email: trimmedEmail
            }
          }
        })
        
        if (error) {
          console.error('❌ Signup error:', error)
          handleAuthError(error)
          throw new Error(getAuthErrorMessage(error))
        }
        
        if (!data.user) {
          throw new Error('Kayıt başarısız - kullanıcı oluşturulamadı')
        }
        
        console.log('✅ Signup successful for user:', data.user.id)
        
        // Check if email confirmation is required
        if (!data.session) {
          toast({
            title: "Kayıt başarılı! 📧",
            description: "Email adresini kontrol et ve doğrulama linkine tıkla",
          })
        } else {
          toast({
            title: "Kayıt başarılı! 💕",
            description: "Hesabın oluşturuldu, giriş yapabilirsin",
          })
        }
        
        // Switch to login mode and clear password
        setIsLogin(true)
        setPassword('')
      }
      
    } catch (error: any) {
      console.error('💥 Auth error:', error)
      const errorMessage = error.message || 'Bilinmeyen bir hata oluştu'
      setAuthError(errorMessage)
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive"
      })
      
      // Additional cleanup on error
      if (errorMessage.includes('refresh_token') || errorMessage.includes('session')) {
        console.log('🔄 Auth token error detected, cleaning up...')
        cleanupAuthState()
      }
      
    } finally {
      setLoading(false)
    }
  }

  // Enhanced error message mapping with token-specific errors
  const getAuthErrorMessage = (error: any): string => {
    const errorCode = error.message || error.error_description || ''
    
    // Token-specific errors (critical for our issue)
    if (errorCode.includes('refresh_token_not_found') || errorCode.includes('Invalid Refresh Token')) {
      return 'Oturum süresi dolmuş, sayfa yenilenecek...'
    }
    if (errorCode.includes('session_not_found') || errorCode.includes('JWT expired')) {
      return 'Oturum geçersiz, tekrar giriş yapın'
    }
    if (errorCode.includes('Token has expired') || errorCode.includes('token_expired')) {
      return 'Token süresi dolmuş, tekrar giriş yapın'
    }
    
    // Standard auth errors
    if (errorCode.includes('Invalid login credentials')) {
      return 'Email veya şifre hatalı'
    }
    if (errorCode.includes('Email not confirmed')) {
      return 'Email adresini doğrulamalısın'
    }
    if (errorCode.includes('User already registered')) {
      return 'Bu email zaten kayıtlı, giriş yapmayı dene'
    }
    if (errorCode.includes('Password should be at least')) {
      return 'Şifre en az 6 karakter olmalı'
    }
    if (errorCode.includes('Unable to validate email address')) {
      return 'Geçersiz email adresi'
    }
    if (errorCode.includes('Signup requires a valid password')) {
      return 'Geçerli bir şifre gerekli'
    }
    if (errorCode.includes('network') || errorCode.includes('fetch')) {
      return 'İnternet bağlantınızı kontrol edin'
    }
    if (errorCode.includes('Too many requests')) {
      return 'Çok fazla deneme, biraz bekleyin'
    }
    
    return errorCode || 'Bilinmeyen hata'
  }

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-mono">🔍 Oturum kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with loading overlay */}
      <img 
        src="/lovable-uploads/de0d5b01-9671-41c9-964c-4e061a1785d1.png"
        alt="Magical Forest Background"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-pink-300 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white font-mono">
              {isLogin ? 'Giriş yapılıyor...' : 'Hesap oluşturuluyor...'}
            </span>
          </div>
        </div>
      )}
      
      {/* Back button enhanced */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => {
            cleanupAuthState()
            navigate('/', { replace: true })
          }}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-200 group"
          title="Ana sayfaya dön"
        >
          <ArrowLeft className="h-5 w-5 text-white group-hover:text-pink-200 transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Heart className="h-12 w-12 text-pink-300 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 text-pink-200 animate-ping opacity-30">
                  <Heart className="h-12 w-12" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl text-white font-mono">
              {isLogin ? '💕 Giriş Yap' : '✨ Kayıt Ol'}
            </CardTitle>
            <p className="text-white/70 text-sm mt-2 font-mono">
              {isLogin ? 'Sevgilinle bağlanmaya hazır mısın?' : 'Aşkın dijital dünyasına katıl'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error display */}
            {authError && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 text-red-200 text-sm font-mono">
                ⚠️ {authError}
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-white/80 text-sm font-mono">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setAuthError(null)
                    }}
                    required
                    maxLength={320}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-300/50 focus:ring-1 focus:ring-pink-300/50 font-mono"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-white/80 text-sm font-mono">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="En az 6 karakter"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setAuthError(null)
                    }}
                    required
                    minLength={6}
                    maxLength={128}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-300/50 focus:ring-1 focus:ring-pink-300/50 font-mono"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white/60 hover:text-white/80 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !email.trim() || !password}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-mono font-bold py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? "Giriş yapılıyor..." : "Kayıt oluşturuluyor..."}
                  </div>
                ) : (
                  isLogin ? "💕 Giriş Yap" : "✨ Kayıt Ol"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setAuthError(null)
                  setPassword('')
                }}
                disabled={loading}
                className="text-white/80 hover:text-white text-sm underline font-mono transition-colors disabled:opacity-50"
              >
                {isLogin ? "💫 Hesabın yok mu? Kayıt ol" : "💕 Zaten hesabın var mı? Giriş yap"}
              </button>
            </div>
            
            {/* Password requirements for signup */}
            {!isLogin && (
              <div className="text-white/60 text-xs font-mono space-y-1 bg-white/5 rounded-lg p-3">
                <p className="font-bold text-white/80">Şifre gereksinimleri:</p>
                <p>• En az 6 karakter</p>
                <p>• En fazla 128 karakter</p>
                <p>• Güvenli bir şifre seçin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Auth