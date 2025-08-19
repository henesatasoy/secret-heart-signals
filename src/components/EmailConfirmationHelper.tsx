import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface EmailConfirmationHelperProps {
  email: string
  onResendSuccess?: () => void
}

export const EmailConfirmationHelper = ({ email, onResendSuccess }: EmailConfirmationHelperProps) => {
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [lastResendTime, setLastResendTime] = useState<number | null>(null)
  const { toast } = useToast()

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendConfirmation = async () => {
    // Check cooldown
    if (lastResendTime && Date.now() - lastResendTime < 60000) {
      const remainingTime = Math.ceil((60000 - (Date.now() - lastResendTime)) / 1000)
      toast({
        title: "Çok hızlı",
        description: `${remainingTime} saniye bekleyin`,
        variant: "destructive"
      })
      return
    }

    setIsResending(true)
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })

      if (error) {
        throw error
      }

      setLastResendTime(Date.now())
      setResendCooldown(60) // 60 second cooldown
      
      toast({
        title: "Email gönderildi! 📧",
        description: "Yeni doğrulama emaili gönderildi",
      })
      
      onResendSuccess?.()
      
    } catch (error: any) {
      console.error('Resend error:', error)
      toast({
        title: "Email gönderilemedi",
        description: error.message || "Bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-blue-500/10 backdrop-blur-sm border-blue-400/20">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <Mail className="h-10 w-10 text-blue-300" />
        </div>
        <CardTitle className="text-lg text-blue-200 font-mono">
          📧 Email Doğrulama
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-blue-100 text-sm space-y-2">
          <p className="font-mono">
            <strong>{email}</strong> adresine doğrulama emaili gönderildi
          </p>
          
          <div className="bg-blue-400/20 rounded-lg p-3 text-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-300" />
              <span className="font-bold">Yapılacaklar:</span>
            </div>
            <ul className="space-y-1 ml-6">
              <li>• Email kutunu kontrol et</li>
              <li>• Spam/Junk klasörünü kontrol et</li>
              <li>• "Confirm your email" linkine tıkla</li>
              <li>• Sonra buraya geri gel ve giriş yap</li>
            </ul>
          </div>
          
          <div className="bg-yellow-500/20 rounded-lg p-3 text-xs text-left">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-300" />
              <span className="font-bold">Email gelmediyse:</span>
            </div>
            <ul className="space-y-1 ml-6">
              <li>• 5-10 dakika bekle</li>
              <li>• Spam klasörünü kontrol et</li>
              <li>• Aşağıdaki butona tıklayarak tekrar gönder</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleResendConfirmation}
          disabled={isResending || resendCooldown > 0}
          variant="outline"
          className="w-full bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30 font-mono"
        >
          {isResending ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Gönderiliyor...
            </div>
          ) : resendCooldown > 0 ? (
            `${resendCooldown}s bekle`
          ) : (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Tekrar Gönder
            </div>
          )}
        </Button>
        
        <p className="text-center text-blue-300/80 text-xs font-mono">
          Doğruladıktan sonra bu sayfayı yenile
        </p>
      </CardContent>
    </Card>
  )
}