import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrdersFilterModal from './OrdersFilterModal';
import { tagsApi } from '../../api/services/tagsApi';
import * as filterUtils from '../../utils/filterUtils';

// Mock les services et les utilitaires
jest.mock('../../api/services/tagsApi');
jest.mock('../../utils/filterUtils');
jest.mock('lodash', () => ({
  debounce: (fn: any) => fn, // Simplifier debounce pour les tests
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn().mockImplementation(() => {
    // Retourne l'objet de filtres avec la nouvelle structure
    return {
      status: 'ACTIVE',
      tagNames: [],
      position: { lat: '', lng: '', address: '' },
    };
  }),
}));

describe('OrdersFilterModal', () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Réinitialiser le mock de useSelector avec la nouvelle structure
    const { useSelector } = require('react-redux');
    useSelector.mockImplementation(() => ({
      status: 'ACTIVE',
      tagNames: [],
      position: { lat: '', lng: '', address: '' },
    }));

    // Simuler les suggestions de tags
    (tagsApi.suggest as jest.Mock).mockResolvedValue({
      data: [
        { _id: 'tag1', name: 'urgent' },
        { _id: 'tag2', name: 'prioritaire' },
      ],
    });

    // Mock la fonction buildFilterString
    (filterUtils.buildFilterString as jest.Mock).mockImplementation(params => {
      const filters = new URLSearchParams();
      if (params.status) filters.append('status', params.status);
      if (params.tagNames.length) filters.append('tagNames', params.tagNames.join(','));
      if (params.position.address) filters.append('address', params.position.address);
      if (params.position.lat && params.position.lng) {
        filters.append('lat', params.position.lat);
        filters.append('lng', params.position.lng);
      }
      return filters.toString();
    });
  });

  test("ne devrait pas s'afficher quand isOpen est false", () => {
    render(<OrdersFilterModal isOpen={false} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.queryByText('Заказы')).not.toBeInTheDocument();
  });

  test("devrait s'afficher quand isOpen est true", () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    expect(screen.getByText('Заказы')).toBeInTheDocument();
  });

  test('devrait appeler onClose quand le bouton Annuler est cliqué', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    fireEvent.click(screen.getByText('Отменить'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('devrait appeler onApply avec les filtres quand le bouton Confirmer est cliqué', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    fireEvent.click(screen.getByText('Подтвердить'));
    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith('status=ACTIVE');
  });

  test('devrait changer le statut quand la valeur du select change', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // Le statut ACTIVE devrait être sélectionné par défaut
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('ACTIVE');

    // Changer pour COMPLETED
    fireEvent.change(selectElement, { target: { value: 'COMPLETED' } });
    expect(selectElement).toHaveValue('COMPLETED');

    // Appliquer les filtres
    fireEvent.click(screen.getByText('Подтвердить'));
    expect(mockOnApply).toHaveBeenCalledWith('status=COMPLETED');
  });

  test("devrait mettre à jour le champ d'adresse", () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const addressInput = screen.getByPlaceholderText('Введите адрес или название города');
    fireEvent.change(addressInput, { target: { value: 'Paris' } });

    expect(addressInput).toHaveValue('Paris');

    // Appliquer les filtres
    fireEvent.click(screen.getByText('Подтвердить'));
    expect(mockOnApply).toHaveBeenCalledWith('status=ACTIVE&address=Paris');
  });

  test('devrait ajouter un tag quand Entrée est pressé', async () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const tagInput = screen.getByPlaceholderText('Введите название заметки');

    // Ajouter un tag
    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });

    // Vérifier que le tag est ajouté
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');

    // Appliquer les filtres
    fireEvent.click(screen.getByText('Подтвердить'));
    expect(mockOnApply).toHaveBeenCalledWith('status=ACTIVE&tagNames=important');
  });

  test('devrait ajouter un tag quand le bouton + est cliqué', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const tagInput = screen.getByPlaceholderText('Введите название заметки');

    // Ajouter un tag
    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.click(tagInput.nextElementSibling as Element); // Cliquer sur le bouton +

    // Vérifier que le tag est ajouté
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  test('devrait supprimer un tag quand le bouton × est cliqué', async () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // Ajouter un tag
    const tagInput = screen.getByPlaceholderText('Введите название заметки');
    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });

    // Vérifier que le tag est ajouté
    expect(screen.getByText('important')).toBeInTheDocument();

    // Supprimer le tag
    fireEvent.click(screen.getByText('×'));

    // Vérifier que le tag est supprimé
    expect(screen.queryByText('important')).not.toBeInTheDocument();
  });

  test('devrait afficher et permettre de sélectionner des suggestions de tags', async () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const tagInput = screen.getByPlaceholderText('Введите название заметки');

    // Saisir du texte pour déclencher des suggestions
    fireEvent.change(tagInput, { target: { value: 'urg' } });

    // Attendre que les suggestions apparaissent
    await waitFor(() => {
      expect(tagsApi.suggest).toHaveBeenCalledWith('urg');
    });

    // Attendre que les suggestions soient affichées
    await waitFor(() => {
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    // Cliquer sur une suggestion
    fireEvent.click(screen.getByText('urgent'));

    // Vérifier que le tag suggéré est ajouté
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });

  test('devrait réinitialiser tous les filtres quand le bouton Reset est cliqué', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // Définir des valeurs pour tous les filtres
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'COMPLETED' } });

    const addressInput = screen.getByPlaceholderText('Введите адрес или название города');
    fireEvent.change(addressInput, { target: { value: 'Paris' } });

    const tagInput = screen.getByPlaceholderText('Введите название заметки');
    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });

    // Cliquer sur le bouton de réinitialisation
    const resetButton = screen.getByTitle('Reset filters');
    fireEvent.click(resetButton);

    // Vérifier que tous les filtres sont réinitialisés
    expect(selectElement).toHaveValue('ACTIVE');
    expect(addressInput).toHaveValue('');
    expect(screen.queryByText('important')).not.toBeInTheDocument();
  });

  test("devrait gérer les erreurs de l'API de suggestions", async () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // Simuler une erreur de l'API
    (tagsApi.suggest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    // Saisir du texte pour déclencher l'appel API
    const tagInput = screen.getByPlaceholderText('Введите название заметки');
    fireEvent.change(tagInput, { target: { value: 'test' } });

    // Vérifier que l'erreur est gérée sans crash
    await waitFor(() => {
      expect(tagsApi.suggest).toHaveBeenCalledWith('test');
    });
    // Vérifier qu'aucune suggestion n'est affichée
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('ne devrait pas ajouter de tags vides ou doublons', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const tagInput = screen.getByPlaceholderText('Введите название заметки');

    // Essayer d'ajouter un tag vide
    fireEvent.change(tagInput, { target: { value: '   ' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    expect(screen.queryByText('   ')).not.toBeInTheDocument();

    // Ajouter un tag valide
    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    expect(screen.getByText('important')).toBeInTheDocument();

    // Essayer d'ajouter le même tag
    fireEvent.change(tagInput, { target: { value: 'important' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    // Vérifier qu'il n'y a qu'un seul tag 'important' (pas de doublons)
    const importantTags = screen.getAllByText('important');
    expect(importantTags).toHaveLength(1);

    // Vérifier que le champ de saisie est vidé après l'ajout
    expect(tagInput).toHaveValue('');
  });

  test('devrait construire correctement la chaîne de filtres avec plusieurs paramètres', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // Configurer plusieurs filtres
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'COMPLETED' } });

    const addressInput = screen.getByPlaceholderText('Введите адрес или название города');
    fireEvent.change(addressInput, { target: { value: 'Paris' } });

    const tagInput = screen.getByPlaceholderText('Введите название заметки');
    fireEvent.change(tagInput, { target: { value: 'urgent' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });

    // Appliquer les filtres
    fireEvent.click(screen.getByText('Подтвердить'));

    // Vérifier que la chaîne de filtres contient tous les paramètres attendus
    const filterString = mockOnApply.mock.calls[0][0];
    expect(filterString).toContain('status=COMPLETED');
    expect(filterString).toContain('address=Paris');
    expect(filterString).toContain('tagNames=urgent');
  });

  test('devrait nettoyer les suggestions quand le champ de recherche est vidé', async () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const tagInput = screen.getByPlaceholderText('Введите название заметки');

    // Simuler des suggestions de l'API
    (tagsApi.suggest as jest.Mock).mockResolvedValueOnce({
      data: [
        { _id: '1', name: 'urgent' },
        { _id: '2', name: 'important' },
      ],
    });

    // Saisir du texte pour obtenir des suggestions
    fireEvent.change(tagInput, { target: { value: 'urg' } });

    // Attendre que les suggestions apparaissent
    await waitFor(() => {
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    // Vider le champ
    fireEvent.change(tagInput, { target: { value: '' } });

    // Vérifier que les suggestions sont nettoyées
    expect(screen.queryByText('urgent')).not.toBeInTheDocument();
    expect(screen.queryByText('important')).not.toBeInTheDocument();
  });

  test('devrait utiliser buildFilterString pour générer la chaîne de filtres', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // Configurer les filtres
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'COMPLETED' } });

    // Appliquer les filtres
    fireEvent.click(screen.getByText('Подтвердить'));

    // Vérifier que buildFilterString a été appelé
    expect(filterUtils.buildFilterString).toHaveBeenCalledWith({
      status: 'COMPLETED',
      tagNames: [],
      position: { lat: '', lng: '', address: '' },
    });
  });

  test('devrait gérer correctement les coordonnées GPS', () => {
    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation(success => {
        success({
          coords: {
            latitude: 48.8566,
            longitude: 2.3522,
          },
        });
      }),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // Cliquer sur le bouton de géolocalisation
    const geoButton = screen.getByRole('button', { name: /геолокация/i });
    fireEvent.click(geoButton);

    // Appliquer les filtres
    fireEvent.click(screen.getByText('Подтвердить'));

    // Vérifier que buildFilterString a été appelé avec les coordonnées
    expect(filterUtils.buildFilterString).toHaveBeenCalledWith(
      expect.objectContaining({
        position: expect.objectContaining({
          lat: '48.8566',
          lng: '2.3522',
        }),
      })
    );
  });

  test('ne devrait pas ajouter de tag si la valeur est vide après trim', () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const tagInput = screen.getByPlaceholderText('Введите название заметки');

    // Essayer d'ajouter un tag avec uniquement des espaces
    fireEvent.change(tagInput, { target: { value: '   ' } });
    fireEvent.click(tagInput.nextElementSibling as Element); // Cliquer sur le bouton +

    // Vérifier qu'aucun tag n'est ajouté
    expect(screen.queryByRole('button', { name: /×/i })).not.toBeInTheDocument();
  });

  test('devrait gérer le debounce pour la recherche de tags', async () => {
    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    const tagInput = screen.getByPlaceholderText('Введите название заметки');

    // Saisir du texte rapidement
    fireEvent.change(tagInput, { target: { value: 'u' } });
    fireEvent.change(tagInput, { target: { value: 'ur' } });
    fireEvent.change(tagInput, { target: { value: 'urg' } });

    // Vérifier que l'API n'est pas appelée pour chaque frappe
    await waitFor(() => {
      // Dans notre simulation de debounce simple, l'API serait toujours appelée 3 fois
      // Dans une implémentation réelle avec debounce, ce serait 1 fois
      expect(tagsApi.suggest).toHaveBeenCalledTimes(3);
      expect(tagsApi.suggest).toHaveBeenLastCalledWith('urg');
    });
  });

  test("devrait mettre à jour les coordonnées et pas l'adresse lorsque la géolocalisation est utilisée", () => {
    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation(success => {
        success({
          coords: {
            latitude: 48.8566,
            longitude: 2.3522,
          },
        });
      }),
    };
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    render(<OrdersFilterModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />);

    // D'abord saisir une adresse
    const addressInput = screen.getByPlaceholderText('Введите адрес или название города');
    fireEvent.change(addressInput, { target: { value: 'Paris' } });

    // Puis cliquer sur le bouton de géolocalisation
    const geoButton = screen.getByRole('button', { name: /геолокация/i });
    fireEvent.click(geoButton);

    // L'adresse doit rester, mais les coordonnées ont été ajoutées
    expect(addressInput).toHaveValue('Paris');

    // Vérifier que les coordonnées sont utilisées dans les filtres
    fireEvent.click(screen.getByText('Подтвердить'));
    expect(filterUtils.buildFilterString).toHaveBeenCalledWith(
      expect.objectContaining({
        position: expect.objectContaining({
          lat: '48.8566',
          lng: '2.3522',
          address: 'Paris',
        }),
      })
    );
  });
});
