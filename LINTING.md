# Configuration ESLint et Prettier

Ce projet utilise ESLint et Prettier pour maintenir un style de code cohérent et détecter les erreurs potentielles.

## Configuration

- **ESLint**: Nous utilisons ESLint v9 avec le nouveau format de configuration `eslint.config.js`
- **Prettier**: Configuration dans `.prettierrc.json`
- **Integration**: ESLint et Prettier sont configurés pour fonctionner ensemble avec `eslint-plugin-prettier`

## Scripts disponibles

```bash
# Exécuter ESLint pour vérifier les erreurs
yarn lint

# Exécuter ESLint et corriger automatiquement les erreurs
yarn lint:fix

# Exécuter Prettier pour formater le code
yarn format

# Vérifier si le code est bien formaté avec Prettier
yarn format:check

# Exécuter à la fois Prettier et ESLint avec correction automatique
yarn fix
```

## Fichiers de configuration

- `eslint.config.js` - Configuration ESLint
- `.prettierrc.json` - Configuration Prettier
- `.prettierignore` - Fichiers à ignorer par Prettier

## Extensions VS Code recommandées

Pour une meilleure expérience de développement, nous recommandons d'installer les extensions VS Code suivantes :

- ESLint
- Prettier - Code formatter

Avec ces extensions, vous pouvez configurer VS Code pour formater automatiquement votre code lors de la sauvegarde.
