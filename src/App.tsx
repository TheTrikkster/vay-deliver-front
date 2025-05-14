import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { SyncManager } from './components/SyncManager/SyncManager';
import GeoPosition from './components/GeoPosition';

const Home = lazy(() => import('./pages/Home'));
const AdminProducts = lazy(() => import('./pages/AdminProducts/AdminProducts'));
const CreateProduct = lazy(() => import('./pages/CreateProduct/CreateProduct'));
const ModifyProduct = lazy(() => import('./pages/ModifyProduct/ModifyProduct'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const Order = lazy(() => import('./pages/Order/Order'));
const ClientProducts = lazy(() => import('./pages/ClientProducts/ClientProducts'));
const ClientOrder = lazy(() => import('./pages/ClientOrder/ClientOrder'));
const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-neutral-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ClientProducts />
        </Suspense>
      ),
    },
    {
      path: '/admin-products',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AdminProducts />
        </Suspense>
      ),
    },
    {
      path: '/create-product',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <CreateProduct />
        </Suspense>
      ),
    },
    {
      path: '/modify-product/:id',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ModifyProduct />
        </Suspense>
      ),
    },
    {
      path: '/admin-orders',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <Orders />
        </Suspense>
      ),
    },
    {
      path: '/admin-order/:id',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <Order />
        </Suspense>
      ),
    },
    {
      path: '/geo',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <GeoPosition />
        </Suspense>
      ),
    },
    {
      path: '/order',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ClientOrder />
        </Suspense>
      ),
    },
  ]);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <OfflineIndicator />
          <InstallPrompt />
          <SyncManager />
          <RouterProvider router={router} />
        </div>
      )}
    </Authenticator>
  );
}

export default withAuthenticator(App);
