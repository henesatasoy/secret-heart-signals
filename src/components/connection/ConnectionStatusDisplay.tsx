import { memo } from "react";

interface ConnectionStatusDisplayProps {
  isValidConnection: boolean;
  isConnected: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  connectionId: string;
}

export const ConnectionStatusDisplay = memo(({ 
  isValidConnection, 
  isConnected, 
  isLoading, 
  isProcessing,
  connectionId 
}: ConnectionStatusDisplayProps) => {
  if (!isValidConnection) return null;

  return (
    <>
      {/* Connection status text */}
      <div className="mt-4 text-sm text-white/80">
        {isConnected 
          ? "✅ Bağlantı kuruldu!" 
          : isLoading || isProcessing 
            ? "🔄 Bağlantı kuruluyor..." 
            : "🔥 Kampateş'e tıkla ve paylaş"}
      </div>
      
      {/* Debug information for development */}
      {process.env.NODE_ENV === 'development' && connectionId && (
        <div className="mt-2 text-xs text-white/50 font-mono break-all">
          ID: {connectionId.substring(0, 8)}...
        </div>
      )}
    </>
  );
});

ConnectionStatusDisplay.displayName = 'ConnectionStatusDisplay';