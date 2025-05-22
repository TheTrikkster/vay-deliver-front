import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Settings from './Settings';
import { settingsApi } from '../../api/services/settingsApi';

// Mocks
jest.mock('../../api/services/settingsApi', () => ({
  settingsApi: {
    getSettings: jest.fn().mockResolvedValue({
      data: { siteStatus: 'OFFLINE', offlineMessage: 'Site en maintenance' },
    }),
    updateStatus: jest.fn().mockResolvedValue({}),
    updateOfflineMessage: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: () => ({ signOut: jest.fn(), user: { username: 'testuser' } }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const tr: Record<string, string> = {
        title: 'Paramètres',
        logout: 'Déconnexion',
        siteEnabled: 'Site activé',
        siteDisabled: 'Le projet est inactif',
        visitorMessage: 'Message pour les visiteurs',
        placeholder: 'Par exemple: Les commandes sont temporairement fermées...',
        confirm: 'Confirmer',
        messageSaved: 'Message enregistré',
      };
      return tr[key] || key;
    },
    i18n: { changeLanguage: jest.fn() },
  }),
}));
jest.mock('../../components/Menu/Menu', () => () => <div data-testid="menu" />);
jest.mock('../../components/LanguageSwitcher', () => () => <div data-testid="lang-switcher" />);

const mockStore = configureStore([]);

describe('Settings Component', () => {
  let store: any;
  const renderComponent = () =>
    render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      client: { siteStatus: 'OFFLINE', offlineMessage: 'Site en maintenance' },
    });
  });

  it('renders static parts and initial offline state', async () => {
    renderComponent();
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Le projet est inactif')).toBeInTheDocument());
  });

  it('shows offline message form when OFFLINE', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByLabelText('Message pour les visiteurs')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Par exemple: Les commandes sont temporairement fermées...')
      ).toBeInTheDocument();
      expect(screen.getByText('Confirmer')).toBeInTheDocument();
    });
  });

  it('toggles status and updates UI', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText('Le projet est inactif')).toBeInTheDocument());
    const toggle = screen.getByRole('button', { pressed: false });

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(settingsApi.updateStatus).toHaveBeenCalledWith('ONLINE');
      expect(screen.getByText('Site activé')).toBeInTheDocument();
      expect(screen.queryByLabelText('Message pour les visiteurs')).toBeNull();
    });

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(settingsApi.updateStatus).toHaveBeenCalledWith('OFFLINE');
      expect(screen.getByText('Le projet est inactif')).toBeInTheDocument();
      expect(screen.getByLabelText('Message pour les visiteurs')).toBeInTheDocument();
    });
  });

  it('updates textarea value', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText('Message pour les visiteurs')).toBeInTheDocument()
    );
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test msg' } });
    expect(textarea.value).toBe('Test msg');
  });

  it('calls signOut on logout click', () => {
    const signOutSpy = jest.fn();
    jest.spyOn(require('@aws-amplify/ui-react'), 'useAuthenticator').mockReturnValue({
      signOut: signOutSpy,
      user: { username: 'testuser' },
    });
    renderComponent();
    fireEvent.click(screen.getByText('Déconnexion'));
    expect(signOutSpy).toHaveBeenCalledTimes(1);
  });
});
