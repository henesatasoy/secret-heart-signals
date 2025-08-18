import { useState, useEffect } from "react";
import { Heart, Link } from "lucide-react";
import { hapticFeedback } from "@/services/mobile";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useConnection } from "@/hooks/useConnection";

interface ScrollConnectionProps {
  className?: string;
  connectionId: string;
  onConnect?: (partnerId: string) => void;
}

export const ScrollConnection = ({ className, connectionId, onConnect }: ScrollConnectionProps) => {
  const [myLink, setMyLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const { isConnected, partnerId, connectWith } = useConnection(connectionId);

  // Only initialize if we have a valid connectionId (user is logged in)
  const isValid = connectionId && connectionId.length > 0;

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setPosition({ x: newX, y: newY });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (isValid) {
      const currentUrl = window.location.origin;
      setMyLink(`${currentUrl}?connect=${connectionId}`);
    }
  }, [connectionId, isValid]);

  // Check if someone is trying to connect via URL parameter
  useEffect(() => {
    if (!isValid) {
      console.log('URL parameter check skipped - invalid connection ID');
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const connectId = urlParams.get('connect');
    
    console.log('URL parameter check:', { connectId, myConnectionId: connectionId });
    
    if (connectId && connectId !== connectionId) {
      console.log('URL connection request detected, attempting to connect:', connectId);
      connectWith(connectId);
      
      // Clean up URL after attempting connection
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (connectId === connectionId) {
      console.log('Self-connection detected, ignoring');
    } else {
      console.log('No connection parameter in URL');
    }
  }, [connectionId, connectWith, isValid]);

  // Notify parent when connection is established
  useEffect(() => {
    if (isConnected && partnerId) {
      onConnect?.(partnerId);
    }
  }, [isConnected, partnerId, onConnect]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger copy link if not dragging
    if (!isDragging) {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    if (!isValid) {
      toast({
        title: "Hata",
        description: "Lütfen önce giriş yapın",
        variant: "destructive",
      });
      return;
    }

    await hapticFeedback.light();
    try {
      await navigator.clipboard.writeText(myLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link kopyalandı! 💕",
        description: "Bu linki sevgilinle paylaş",
      });
    } catch (err) {
      toast({
        title: "Link kopyalanamadı",
        description: "Lütfen manuel olarak kopyala",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("text-center", className)}>
      {/* Draggable Invisible Fire Button */}
      <div 
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)'
        }}
        className={`relative w-16 h-16 cursor-${isDragging ? 'grabbing' : 'grab'} group transition-all duration-200 ${isDragging ? 'z-50' : 'z-10'}`}
      >
        {/* Base invisible button area */}
        <div className="absolute inset-0 bg-transparent"></div>
        
        {/* Glowing effects - only visible on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          {/* Warm Glow Effect */}
          <div className="absolute inset-0 bg-orange-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-15 blur-lg animate-pulse delay-200"></div>
        </div>
        
        {/* Interactive Glow on Hover */}
        <div className="absolute inset-0 bg-transparent group-hover:shadow-[0_0_50px_rgba(255,165,0,0.6)] transition-all duration-500 rounded-full"></div>
      </div>
    </div>
  );
};