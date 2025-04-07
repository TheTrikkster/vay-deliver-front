import React, { useState, useEffect } from 'react';

export const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
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
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <p className="mb-2">Installer Vay Deliver sur votre appareil ?</p>
      <div className="flex space-x-2">
        <button 
          onClick={() => setShowPrompt(false)}
          className="px-3 py-1 bg-gray-200 rounded">
          Plus tard
        </button>
        <button 
          onClick={handleInstall}
          className="px-3 py-1 bg-blue-500 text-white rounded">
          Installer
        </button>
      </div>
    </div>
  );
};