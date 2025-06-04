import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tagName: string, orderIds: string[] | string) => void;
  orderId?: string;
  selectedOrderIds?: string[];
}

const AddTagModal: React.FC<AddTagModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  selectedOrderIds,
}) => {
  const [tagName, setTagName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('addTagModal');

  const handleConfirm = useCallback(async () => {
    const name = tagName.trim();
    if (name.length < 2) return;

    const ids = orderId ? [orderId] : selectedOrderIds || [];
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(name, ids);
      // Succès : réinitialiser et fermer
      setTagName('');
      setIsLoading(false);
      onClose();
    } catch (error) {
      // Erreur : afficher le message d'erreur et garder le modal ouvert
      setIsLoading(false);
      setError(t('error'));
      console.error('Add tag error:', error);
    }
  }, [tagName, orderId, selectedOrderIds, onConfirm, onClose, t]);

  const handleClose = useCallback(() => {
    // Empêcher la fermeture pendant le loading
    if (isLoading) return;

    setTagName('');
    setError(null);
    onClose();
  }, [onClose, isLoading]);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTagName(e.target.value);
      // Effacer l'erreur quand l'utilisateur tape
      if (error) setError(null);
    },
    [error]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
        <h2 className="text-2xl font-medium mb-4">{t('title')}</h2>

        <textarea
          className="w-full border rounded-lg p-3 min-h-[100px] mb-4"
          placeholder={t('placeholder')}
          value={tagName}
          onChange={handleTextareaChange}
          disabled={isLoading}
        />

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={tagName.trim().length < 2 || isLoading}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-green-300 disabled:hover:bg-green-300 disabled:cursor-not-allowed relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>{t('adding')}</span>
              </div>
            ) : (
              t('confirm')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTagModal;
