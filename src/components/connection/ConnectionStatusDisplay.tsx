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
            : ""}
      </div>
    </>
  );
});

ConnectionStatusDisplay.displayName = 'ConnectionStatusDisplay';