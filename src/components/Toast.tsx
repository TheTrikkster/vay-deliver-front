import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number; // ms
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className="
        fixed top-20 left-1/2 
        transform -translate-x-1/2 
        z-50
        max-w-xs 
        bg-green-500 text-white 
        px-4 py-2 
        rounded-lg shadow-lg 
        transition-all opacity-100 animate-fade-in
      "
    >
      {message}
    </div>
  );
}
