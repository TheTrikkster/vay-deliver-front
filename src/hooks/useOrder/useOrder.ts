import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/services/ordersApi';
import { Order, OrderStatus } from '../../types/order';
import { sumCurrency } from '../../utils/sumCurrency';

type ActionType = 'COMPLETE' | 'CANCEL' | 'DELETE';

// Type enrichi pour les items avec les détails du produit
interface OrderItemExtended {
  product: {
    name: string;
    price: number;
  };
  quantity: number;
}

// Extension du type Order pour inclure les détails du produit
interface OrderExtended extends Omit<Order, 'items'> {
  items: OrderItemExtended[];
}

interface UseOrderProps {
  id: string;
}

export const useOrder = ({ id }: UseOrderProps) => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderExtended | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersApi.getById(id);
        setOrderDetails(response.data);
      } catch (err) {
        setError('Error loading order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Calcul du total
  const calculateTotal = () => {
    if (!orderDetails?.items) return 0;

    const totalNum = orderDetails.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    return sumCurrency({ value: totalNum });
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    try {
      await ordersApi.updateStatus(id, status);

      // Mettre à jour l'état local après la réponse API réussie
      setOrderDetails(prevDetails => {
        if (prevDetails) {
          return { ...prevDetails, status };
        }
        return prevDetails;
      });

      return true;
    } catch (error) {
      console.error(`Error updating order to ${status}:`, error);
      return false;
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await ordersApi.deleteOrder(id);
      navigate(-1); // Retourner à la liste des commandes après suppression
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  };

  const handleActionClick = (action: ActionType) => {
    setCurrentAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    let success = false;

    switch (currentAction) {
      case 'COMPLETE':
        success = await handleUpdateStatus('COMPLETED');
        break;
      case 'CANCEL':
        success = await handleUpdateStatus('CANCELED');
        break;
      case 'DELETE':
        success = await handleDeleteOrder();
        break;
    }

    setIsConfirmModalOpen(false);
    setCurrentAction(null);
    return success;
  };

  const getConfirmationInfo = () => {
    switch (currentAction) {
      case 'COMPLETE':
        return {
          title: 'completeAction',
          message: 'confirmComplete',
        };
      case 'CANCEL':
        return {
          title: 'cancelAction',
          message: 'confirmCancel',
        };
      case 'DELETE':
        return {
          title: 'deleteAction',
          message: 'confirmDelete',
        };
      default:
        return {
          title: '',
          message: '',
        };
    }
  };

  const refreshOrderDetails = async () => {
    try {
      const response = await ordersApi.getById(id);
      setOrderDetails(response.data);
      return true;
    } catch (error) {
      console.error('Error refreshing order details:', error);
      return false;
    }
  };

  return {
    orderDetails,
    loading,
    error,
    total: calculateTotal(),
    handleActionClick,
    handleConfirmAction,
    currentAction,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    getConfirmationInfo,
    refreshOrderDetails,
  };
};
