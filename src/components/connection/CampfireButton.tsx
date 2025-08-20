import { memo, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampfireButtonProps {
  onClick: () => void;
  isValidConnection: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  copied: boolean;
  disabled?: boolean;
}

export const CampfireButton = memo(({ 
  onClick, 
  isValidConnection, 
  isLoading, 
  isProcessing, 
  copied,
  disabled = false
}: CampfireButtonProps) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "w-32 h-32 cursor-pointer group transition-all duration-200 relative rounded-full opacity-0 hover:opacity-100",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        (isLoading || isProcessing || disabled) ? "cursor-wait" : ""
      )}
      title={isValidConnection ? "Kampateş'a tıkla ve bağlantı linkini kopyala" : "Geçersiz bağlantı"}
      role="button"
      tabIndex={0}
      aria-label="Bağlantı linkini kopyala"
      onKeyDown={handleKeyDown}
    >
      {/* Hafif parıltı efekti - sadece hover'da */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className={cn(
          "absolute inset-0 rounded-full opacity-30 blur-lg animate-pulse",
          isValidConnection ? "bg-orange-300" : "bg-gray-300"
        )}></div>
      </div>
      
      {/* Loading indicator */}
      {(isLoading || isProcessing) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Copied indicator */}
      {copied && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Kopyalandı!
          </div>
        </div>
      )}
    </div>
  );
});

CampfireButton.displayName = 'CampfireButton';