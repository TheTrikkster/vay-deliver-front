import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddTagModal from '../AddTagModal/AddTagModal';
import ConfirmModal from '../ConfirmModal';
import { useOrderTags } from '../../hooks/useOrderTags';

interface OrderTagsSectionProps {
  orderId: string;
  tagNames: string[];
  onTagsUpdated: () => void;
}

const OrderTagsSection = ({ orderId, tagNames, onTagsUpdated }: OrderTagsSectionProps) => {
  const { t } = useTranslation('order');
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [tagToDelete, setTagToDelete] = useState<string>('');

  const { addTag, removeTag, loading } = useOrderTags({
    onSuccess: onTagsUpdated,
  });

  const handleAddTag = async (tagName: string) => {
    await addTag(tagName, orderId);
    setIsAddTagModalOpen(false);
  };

  const handleDeleteTag = (tagName: string) => {
    setTagToDelete(tagName);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteTag = async () => {
    if (tagToDelete) {
      await removeTag(orderId, tagToDelete);
      setIsConfirmModalOpen(false);
      setTagToDelete('');
    }
  };

  const cancelDeleteTag = () => {
    setIsConfirmModalOpen(false);
    setTagToDelete('');
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-normal text-gray-800">{t('notes')}</h3>
        <button
          className="text-lg font-normal text-gray-800"
          onClick={() => setIsAddTagModalOpen(true)}
          disabled={loading}
        >
          {t('addTag')} +
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {tagNames.map((tag: string, index: number) => (
          <div key={index} className="font-medium bg-gray-100 rounded-lg p-2 text-sm">
            {tag}
            <button
              onClick={() => handleDeleteTag(tag)}
              className="text-gray-500 ml-2 text-base"
              disabled={loading}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <AddTagModal
        isOpen={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(false)}
        orderId={orderId}
        onConfirm={handleAddTag}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={cancelDeleteTag}
        onConfirm={confirmDeleteTag}
        title={t('deleteTagTitle')}
        message={t('deleteTagConfirmation')}
      />
    </div>
  );
};

export default OrderTagsSection;
