import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface VibrantNotificationProps {
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  variant?: "default" | "message" | "success";
}

export const VibrantNotification = ({ 
  title, 
  message, 
  onClose, 
  className,
  variant = "default"
}: VibrantNotificationProps) => {
  return (
    <div className={cn(
      "vibrant-notification notification-font relative",
      "animate-in slide-in-from-top-5 duration-300",
      "max-w-sm mx-auto mb-3",
      className
    )}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <div className="relative z-10">
        {title && (
          <div className="notification-font-bold text-sm mb-1 text-white">
            {title}
          </div>
        )}
        <div className="notification-font text-sm text-white leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
};