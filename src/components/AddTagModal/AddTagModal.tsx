import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addTagToOrders } from '../../store/slices/ordersSlice';
import { useAppDispatch } from '../../store/hooks';

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  selectedOrderIds?: string[];
  onSuccess?: (tagName: string) => void;
}

const AddTagModal: React.FC<AddTagModalProps> = ({
  isOpen,
  onClose,
  orderId,
  selectedOrderIds,
  onSuccess,
}) => {
  const [tagName, setTagName] = useState<string>('');
  const { t } = useTranslation('addTagModal');
  const dispatch = useAppDispatch();

  const handleAddTag = useCallback(async () => {
    if (!tagName.trim()) return;

    try {
      const orderIds = orderId ? [orderId] : selectedOrderIds || [];
      await dispatch(addTagToOrders({ tagName, orderIds })).unwrap();
      onSuccess?.(tagName);
      setTagName('');
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du tag:", error);
    }
  }, [dispatch, tagName, orderId, selectedOrderIds, onClose, onSuccess]);

  const handleConfirm = useCallback(() => {
    handleAddTag();
  }, [handleAddTag]);

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
