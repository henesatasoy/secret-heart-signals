import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { hapticFeedback } from '@/services/mobile';

export const useClipboard = () => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const copyToClipboard = useCallback(async (text: string, options?: {
    successTitle?: string;
    successDescription?: string;
    errorTitle?: string;
    errorDescription?: string;
  }) => {
    if (!text) {
      toast({
        title: options?.errorTitle || "Kopyalama hatası",
        description: options?.errorDescription || "Kopyalanacak metin boş",
        variant: "destructive",
      });
      return false;
    }

    try {
      await hapticFeedback.light();
      
      // Enhanced clipboard handling with fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      
      // Clear existing timer if any
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Auto-reset copied state
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 3000);
      
      toast({
        title: options?.successTitle || t('linkCopied'),
        description: options?.successDescription || t('copiedToClipboard'),
      });
      
      return true;
      
    } catch (err) {
      console.error('Clipboard error:', err);
      const errorMessage = err instanceof Error ? err.message : t('unknownError');
      
      toast({
        title: options?.errorTitle || t('copyError'),
        description: options?.errorDescription || `${t('error')}: ${errorMessage}. ${t('manualCopy')}`,
        variant: "destructive",
      });
      
      return false;
    }
  }, [toast, t]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
  }, []);

  return {
    copied,
    copyToClipboard,
    cleanup
  };
};