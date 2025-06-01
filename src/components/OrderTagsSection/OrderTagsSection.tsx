import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddTagModal from '../AddTagModal/AddTagModal';
import ConfirmModal from '../ConfirmModal';
import { useOrderTags } from '../../hooks/useOrderTags/useOrderTags';

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
    onAddTagSuccess: onTagsUpdated,
    onRemoveTagSuccess: onTagsUpdated,
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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-semibold text-gray-900">{t('notes')}</h3>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          onClick={() => setIsAddTagModalOpen(true)}
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {t('addTag')}
        </button>
      </div>

      {tagNames.length > 0 ? (
        <div className="flex flex-wrap gap-3 mb-4">
          {tagNames.map((tag: string, index: number) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleDeleteTag(tag)}
                className="ml-1 p-0.5 hover:bg-red-100 rounded-full transition-colors duration-200 group"
                disabled={loading}
                title="Supprimer cette note"
              >
                <svg
                  className="w-3 h-3 text-gray-400 group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">{t('noNotesAdded')}</p>
        </div>
      )}

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
        title={t('deleteTag')}
        message={t('deleteTagConfirmation')}
      />
    </div>
  );
};

export default OrderTagsSection;
