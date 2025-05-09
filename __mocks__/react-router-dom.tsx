import React from 'react';

// Composants de base
export const BrowserRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="mock-browser-router">{children}</div>
);

export const Link: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <a data-testid="mock-link" href={to}>
    {children}
  </a>
);

// Navigation hooks
export const useNavigate = () => jest.fn();
export const useParams = () => ({ id: '1' });
export const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null });
export const useRouteMatch = () => ({ path: '/', url: '/' });

// Autres composants
export const Routes = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const Route = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const Navigate = ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />;
