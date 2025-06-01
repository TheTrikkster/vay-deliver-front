import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AddTagModal from '../AddTagModal/AddTagModal';
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
  const [tagIndexToDelete, setTagIndexToDelete] = useState<number>(-1);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 🎯 État optimistic simplifié
  const [optimisticTags, setOptimisticTags] = useState<string[]>(tagNames);
  const [pendingTags, setPendingTags] = useState<Set<string>>(new Set());

  // Synchroniser avec les props
  useEffect(() => {
    setOptimisticTags(tagNames);
  }, [tagNames]);

  const { addTag, removeTag, loading } = useOrderTags({
    onAddTagSuccess: () => {
      // Success : enlever des tags pending
      setPendingTags(new Set());
    },
    onRemoveTagSuccess: () => {
      // Plus besoin de onTagsUpdated pour la suppression non plus !
      // L'optimistic update a déjà enlevé le tag
    },
  });

  const handleAddTag = useCallback(
    async (tagName: string) => {
      const trimmedTagName = tagName.trim();

      // Éviter les doublons
      if (optimisticTags.includes(trimmedTagName)) {
        return;
      }

      // ⚡ Update optimistic immédiat
      setOptimisticTags(prev => [...prev, trimmedTagName]);
      setPendingTags(prev => {
        const newSet = new Set(prev);
        newSet.add(trimmedTagName);
        return newSet;
      });

      try {
        await addTag(trimmedTagName, orderId);
        // ✅ Succès : le tag reste, on enlève juste du pending
        setPendingTags(prev => {
          const newSet = new Set(prev);
          newSet.delete(trimmedTagName);
          return newSet;
        });
      } catch (error) {
        // ❌ Erreur : rollback
        setOptimisticTags(prev => prev.filter(tag => tag !== trimmedTagName));
        setPendingTags(prev => {
          const newSet = new Set(prev);
          newSet.delete(trimmedTagName);
          return newSet;
        });
        throw error;
      }
    },
    [optimisticTags, addTag, orderId]
  );

  const handleDeleteTag = useCallback((tagName: string, index: number) => {
    setTagToDelete(tagName);
    setTagIndexToDelete(index);
    setIsConfirmModalOpen(true);
  }, []);

  const confirmDeleteTag = useCallback(async () => {
    if (tagToDelete && tagIndexToDelete >= 0) {
      setIsDeleting(true);

      // ⚡ Optimistic update immédiat - supprimer seulement l'instance spécifique !
      setOptimisticTags(prev => prev.filter((_, index) => index !== tagIndexToDelete));

      try {
        await removeTag(orderId, tagToDelete);
        // ✅ Succès : le tag est déjà supprimé de l'UI
        setIsDeleting(false);
        setIsConfirmModalOpen(false);
        setTagToDelete('');
        setTagIndexToDelete(-1);
      } catch (error) {
        // ❌ Erreur : rollback - remettre le tag à sa position
        setOptimisticTags(prev => {
          const newTags = [...prev];
          newTags.splice(tagIndexToDelete, 0, tagToDelete);
          return newTags;
        });
        setIsDeleting(false);
        console.error('Remove tag failed:', error);
        setIsConfirmModalOpen(false);
        setTagToDelete('');
        setTagIndexToDelete(-1);
      }
    }
  }, [tagToDelete, tagIndexToDelete, removeTag, orderId]);

  const cancelDeleteTag = useCallback(() => {
    // Empêcher la fermeture pendant la suppression
    if (isDeleting) return;

    setIsConfirmModalOpen(false);
    setTagToDelete('');
    setTagIndexToDelete(-1);
  }, [isDeleting]);

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

      {optimisticTags.length > 0 ? (
        <div className="flex flex-wrap gap-3 mb-4">
          {optimisticTags.map((tag: string, index: number) => {
            const isPending = pendingTags.has(tag);
            return (
              <div
                key={`${tag}-${index}`}
                className={`inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 ${
                  isPending ? 'opacity-70' : ''
                }`}
              >
                <span>{tag}</span>
                {isPending ? (
                  <div className="w-3 h-3 animate-spin rounded-full border border-gray-400 border-t-transparent"></div>
                ) : (
                  <button
                    onClick={() => handleDeleteTag(tag, index)}
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
                )}
              </div>
            );
          })}
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

      {/* Modal de confirmation personnalisé avec loading state */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">{t('deleteTag')}</h2>
            <p className="text-gray-600 mb-6">{t('deleteTagConfirmation')}</p>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={cancelDeleteTag}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmDeleteTag}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{t('deleting')}</span>
                  </div>
                ) : (
                  t('confirm')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTagsSection;
