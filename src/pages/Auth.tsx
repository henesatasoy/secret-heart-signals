import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Heart, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'

// Enhanced auth state cleanup utility
const cleanupAuthState = () => {
  console.log('Cleaning up authentication state...')
  
  // Clear localStorage authentication data
  if (typeof window !== 'undefined' && window.localStorage) {
    // Remove standard supabase auth tokens
    localStorage.removeItem('supabase.auth.token')
    
    // Remove all Supabase auth keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || 
          key.startsWith('supabase-') || key.includes('.auth.')) {
        console.log('Removing localStorage key:', key)
        localStorage.removeItem(key)
      }
    })
  }
  
  // Clear sessionStorage if exists
  if (typeof window !== 'undefined' && window.sessionStorage) {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || 
          key.startsWith('supabase-') || key.includes('.auth.')) {
        console.log('Removing sessionStorage key:', key)
        sessionStorage.removeItem(key)
      }
    })
  }
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Enhanced authentication check with cleanup
  useEffect(() => {
    const checkAuthAndCleanup = async () => {
      try {
        // Clean up any existing corrupted auth state first
        cleanupAuthState()
        
        // Wait a bit for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          // Force cleanup on error
          cleanupAuthState()
          return
        }
        
        if (session && session.user) {
          console.log('Valid session found, redirecting to home')
          // Use replace to prevent back navigation issues
          navigate('/', { replace: true })
        } else {
          console.log('No valid session found')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        cleanupAuthState()
      }
    }
    
    checkAuthAndCleanup()
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

    try {
      const trimmedEmail = email.trim().toLowerCase()
      
      if (isLogin) {
        // Enhanced login with proper cleanup
        console.log('Attempting login for:', trimmedEmail)
        
        // Clean up any existing auth state before login
        cleanupAuthState()
        
        // Attempt to sign out any existing sessions globally
        try {
          await supabase.auth.signOut({ scope: 'global' })
        } catch (signOutError) {
          console.log('Global signout failed (expected):', signOutError)
        }
        
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        
        if (error) {
          console.error('Login error:', error)
          throw new Error(getAuthErrorMessage(error))
        }
        
        if (data.user) {
          console.log('Login successful for user:', data.user.id)
          toast({
            title: "Giriş başarılı! 💕",
            description: "Sevgilinle bağlanmaya hazırsın",
          })
          
          // Force full page reload for clean state
          window.location.href = '/'
        } else {
          throw new Error('Giriş başarısız - kullanıcı bilgisi alınamadı')
        }
        
      } else {
        // Enhanced signup with proper validation
        console.log('Attempting signup for:', trimmedEmail)
        
        // Clean up before signup
        cleanupAuthState()
        
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              created_at: new Date().toISOString()
            }
          }
        })
        
        if (error) {
          console.error('Signup error:', error)
          throw new Error(getAuthErrorMessage(error))
        }
        
        if (data.user) {
          console.log('Signup successful for user:', data.user.id)
          
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
          
          // Switch to login mode
          setIsLogin(true)
          setPassword('') // Clear password for security
        } else {
          throw new Error('Kayıt başarısız - kullanıcı oluşturulamadı')
        }
      }
      
    } catch (error: any) {
      console.error('Auth error:', error)
      const errorMessage = error.message || 'Bilinmeyen bir hata oluştu'
      setAuthError(errorMessage)
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Enhanced error message mapping
  const getAuthErrorMessage = (error: any): string => {
    const errorCode = error.message || error.error_description || ''
    
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
    if (errorCode.includes('refresh_token_not_found')) {
      return 'Oturum süresi dolmuş, tekrar giriş yap'
    }
    if (errorCode.includes('Signup requires a valid password')) {
      return 'Geçerli bir şifre gerekli'
    }
    if (errorCode.includes('network')) {
      return 'İnternet bağlantınızı kontrol edin'
    }
    
    return errorCode || 'Bilinmeyen hata'
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