import { ResourcesConfig } from 'aws-amplify';

// Configuration pour Amplify v6
const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_AWS_USER_POOLS_ID || '',
      userPoolClientId: process.env.REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID || '',
      identityPoolId: process.env.REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID || '',
      loginWith: {
        email: true,
        phone: false,
        username: false,
      },
    },
  },
};

// Vérification pour s'assurer que les variables d'environnement sont bien chargées
// et alerter en développement si ce n'est pas le cas
if (process.env.NODE_ENV === 'development') {
  const missingVars = [
    'REACT_APP_AWS_USER_POOLS_ID',
    'REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID',
    'REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID',
  ].filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("⚠️ Variables d'environnement manquantes:", missingVars);
    console.error('Vérifiez votre fichier .env et le chargement des variables');
  }
}

export default awsConfig;
