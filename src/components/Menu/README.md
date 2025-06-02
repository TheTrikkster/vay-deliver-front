# Composant Menu

Le composant Menu fournit une navigation cohérente avec support intégré pour le bouton retour, respectant les bonnes pratiques d'accessibilité et de design.

## Fonctionnalités

- **Menu hamburger** : Navigation principale avec overlay fullscreen
- **Bouton retour intégré** : Navigation arrière avec respect des standards d'accessibilité
- **Bouton d'ajout produit** : Lien rapide pour créer un nouveau produit
- **Accessibilité complète** : Support clavier, lecteurs d'écran, et standards tactiles

## Utilisation

```tsx
import Menu from '../../components/Menu/Menu';

// Menu basique
<Menu />

// Menu avec bouton retour
<Menu showBackButton={true} />

// Menu avec bouton retour et action personnalisée
<Menu
  showBackButton={true}
  backButtonAction={() => console.log('Action personnalisée')}
/>

// Menu avec bouton d'ajout de produit
<Menu showAddProd={true} />

// Menu complet
<Menu
  showBackButton={true}
  showAddProd={true}
  backButtonAction={handleCustomBack}
/>
```

## Props

| Prop               | Type         | Défaut      | Description                                                                        |
| ------------------ | ------------ | ----------- | ---------------------------------------------------------------------------------- |
| `showAddProd`      | `boolean`    | `false`     | Affiche le bouton d'ajout de produit                                               |
| `showBackButton`   | `boolean`    | `false`     | Affiche le bouton retour                                                           |
| `backButtonAction` | `() => void` | `undefined` | Action personnalisée pour le bouton retour. Si non fournie, utilise `navigate(-1)` |

## Standards d'accessibilité respectés

### Taille des boutons tactiles

- **Taille minimale** : 44x44px (conforme Apple HIG et Material Design)
- **Zone de clic** : Garantie par `min-w-[44px] min-h-[44px]`
- **Taille effective** : `w-11 h-11` (44x44px)

### Feedback visuel

- **Style épuré** : Boutons sans contour pour un design moderne et minimaliste
- **Hover** : Changement subtil de couleur de fond `hover:bg-gray-100`
- **Active** : Animation de clic avec `active:scale-95`
- **Focus** : Ring bleu visible avec `focus:ring-2 focus:ring-blue-500`
- **Icône moderne** : Chevron-left de Heroicons pour une meilleure lisibilité

### Accessibilité clavier

- **Navigation** : Tous les boutons sont focusables
- **Échappement** : Fermeture du menu avec la touche Escape
- **Labels** : Aria-labels appropriés pour les lecteurs d'écran

### Sémantique HTML

- **Rôles ARIA** : `dialog`, `aria-modal` pour le menu overlay
- **États ARIA** : `aria-expanded` pour l'état du menu
- **Labels** : `aria-label` descriptifs en plusieurs langues

## Structure CSS

```css
/* Bouton standard respectant les bonnes pratiques - Style épuré */
.menu-button {
  min-width: 44px;
  min-height: 44px;
  width: 2.75rem; /* 44px */
  height: 2.75rem; /* 44px */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px; /* rounded-full */
  transition: all 200ms;
  /* Pas de border ni de background par défaut pour un style épuré */
}

/* États interactifs */
.menu-button:hover {
  background-color: rgb(243 244 246); /* gray-100 */
}

.menu-button:focus {
  outline: none;
  ring: 2px solid rgb(59 130 246); /* blue-500 */
  ring-offset: 1px;
}

.menu-button:active {
  transform: scale(0.95);
}
```

## Tests

Le composant inclut des tests complets pour :

- Affichage conditionnel des boutons
- Respect des standards d'accessibilité (taille 44x44px)
- Navigation et actions personnalisées
- Interaction clavier et mouse
- États ARIA appropriés

```bash
npm test src/components/Menu/Menu.test.tsx
```

## Bonnes pratiques implémentées

1. **Respect des standards Material Design/Apple HIG**
2. **Accessibilité WCAG 2.1 niveau AA**
3. **Support multi-plateforme** (desktop/mobile)
4. **Internationalisation** via react-i18next
5. **Tests unitaires complets**
6. **Architecture modulaire et réutilisable**
