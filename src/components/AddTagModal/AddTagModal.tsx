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
  const { t } = useTranslation('addTagModal');

  const handleConfirm = useCallback(async () => {
    const name = tagName.trim();
    if (name.length < 2) return;
    const ids = orderId ? [orderId] : selectedOrderIds || [];
    try {
      await onConfirm(name, ids);
      setTagName('');
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [tagName, orderId, selectedOrderIds, onConfirm, onClose]);

  const handleClose = useCallback(() => {
    setTagName('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
        <h2 className="text-2xl font-medium mb-4">{t('title')}</h2>

        <textarea
          className="w-full border rounded-lg p-3 min-h-[100px] mb-4"
          placeholder={t('placeholder')}
          value={tagName}
          onChange={e => setTagName(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={tagName.trim().length < 2}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-green-300 disabled:hover:bg-green-300 disabled:cursor-not-allowed"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTagModal;
