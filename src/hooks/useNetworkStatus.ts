import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setOnlineStatus, selectOrdersIsOnline } from '../store/slices/ordersSlice';
import { useAppDispatch } from '../store/hooks';

export function useNetworkStatus() {
  const dispatch = useAppDispatch();

  const isOnline = useSelector(selectOrdersIsOnline);

  useEffect(() => {
    const goOnline = () => dispatch(setOnlineStatus(true));
    const goOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [dispatch]);

  return { isOnline };
}
