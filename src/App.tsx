import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { SyncManager } from './components/SyncManager';

const Home = lazy(() => import('./pages/Home'));
const AdminDeliveries = lazy(() => import('./pages/AdminDeliveries'));
const CreateProduct = lazy(() => import('./pages/CreateProduct'));
const ModifyProduct = lazy(() => import('./pages/ModifyProduct'));
const ProductsAvailable = lazy(() => import('./pages/ProductsAvailable'));

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
          <Home />
        </Suspense>
      ),
    },
    {
      path: '/deliveries',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AdminDeliveries />
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
      path: '/products-available',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ProductsAvailable />
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
