import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionType, OrderStatus } from '../../types/order';
import { useOutsideClick } from '../../hooks/useOutsideClick';
interface OrderActionsProps {
  orderStatus: OrderStatus;
  onActionClick: (action: ActionType) => void;
}

const OrderActions = ({ orderStatus, onActionClick }: OrderActionsProps) => {
  const { t } = useTranslation('order');
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(actionMenuRef, () => setShowActionMenu(false));

  const handleAction = (action: ActionType) => {
    onActionClick(action);
    setShowActionMenu(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-20" ref={actionMenuRef}>
      {showActionMenu && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg w-60 overflow-hidden mb-2">
          {/* Afficher "Terminer" uniquement si la commande est active */}
          {orderStatus === 'ACTIVE' && (
            <button
              onClick={() => handleAction('COMPLETE')}
              className="w-full text-left py-3 px-4 hover:bg-green-50 flex items-center gap-3 border-b border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span className="font-medium">{t('completeAction')}</span>
            </button>
          )}

          {/* Afficher "Annuler" uniquement si la commande est active */}
          {orderStatus === 'ACTIVE' && (
            <button
              onClick={() => handleAction('CANCEL')}
              className="w-full text-left py-3 px-4 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <span className="font-medium">{t('cancelAction')}</span>
            </button>
          )}

          {/* Supprimer disponible pour tous les statuts */}
          <button
            onClick={() => handleAction('DELETE')}
            className="w-full text-left py-3 px-4 hover:bg-red-50 flex items-center gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span className="font-medium text-red-600">{t('deleteAction')}</span>
          </button>
        </div>
      )}

      <button
        onClick={() => setShowActionMenu(!showActionMenu)}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all"
      >
        {showActionMenu ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        )}
      </button>
    </div>
  );
};

export default OrderActions;
