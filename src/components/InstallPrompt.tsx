import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('Application installée');
    }

    setInstallPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed z-10 bottom-4 left-1/2 transform -translate-x-1/2 md:left-auto md:transform-none md:bottom-4 md:right-4 bg-white p-4 rounded-lg shadow-lg">
      {' '}
      <p className="mb-2">Установите Vay Deliver на свое устройство ?</p>
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-1 px-3 py-1 bg-gray-200 rounded"
        >
          Позже
        </button>
        <button onClick={handleInstall} className="flex-1 px-3 py-1 bg-blue-500 text-white rounded">
          Установить
        </button>
      </div>
    </div>
  );
};
