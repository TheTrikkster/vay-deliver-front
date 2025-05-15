import React, { lazy, Suspense, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { SyncManager } from './components/SyncManager/SyncManager';
import GeoPosition from './components/GeoPosition';
import LanguageSwitcher from './components/LanguageSwitcher';

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

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col">
      <h1 className="text-3xl font-bold mb-4">Страница не найдена</h1>
      <p className="text-lg">Страница, которую вы ищете, не существует.</p>
    </div>
  );
};

// Composant pour les routes protégées
const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <OfflineIndicator />
      <InstallPrompt />
      <SyncManager />
      {children}
    </div>
  );
};

// Enveloppez le composant avec withAuthenticator
const AuthProtectedRoutes = withAuthenticator(ProtectedRoutes);

function App() {
  const router = createBrowserRouter([
    // Routes publiques (sans authentification)
    {
      path: '/',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ClientProducts />
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
    {
      path: '/geo',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <GeoPosition />
        </Suspense>
      ),
    },

    // Routes protégées (avec authentification)
    {
      path: '/home',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AuthProtectedRoutes>
            <Home />
          </AuthProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: '/admin-products',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AuthProtectedRoutes>
            <AdminProducts />
          </AuthProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: '/create-product',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AuthProtectedRoutes>
            <CreateProduct />
          </AuthProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: '/modify-product/:id',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AuthProtectedRoutes>
            <ModifyProduct />
          </AuthProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: '/admin-orders',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AuthProtectedRoutes>
            <Orders />
          </AuthProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: '/admin-order/:id',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <AuthProtectedRoutes>
            <Order />
          </AuthProtectedRoutes>
        </Suspense>
      ),
    },
    {
      path: '*',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      ),
    },
  ]);

  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
      <SyncManager />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
