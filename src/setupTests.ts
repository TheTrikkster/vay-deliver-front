// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Supprimer uniquement les avertissements React 18 spécifiques pendant les tests
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args[0];

  // Ne filtrer que les warnings React spécifiques
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported in React 18') ||
      message.includes('Warning: unmountComponentAtNode is deprecated') ||
      message.includes('Warning: `ReactDOMTestUtils.act` is deprecated') ||
      (message.includes('Warning:') && message.includes('React.act')))
  ) {
    return;
  }

  // Laisser passer toutes les autres erreurs (vraies erreurs applicatives)
  originalError(...args);
};

console.warn = (...args) => {
  const message = args[0];

  // Ne filtrer que les warnings React spécifiques
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported in React 18') ||
      message.includes('Warning: unmountComponentAtNode is deprecated') ||
      message.includes('Warning: `ReactDOMTestUtils.act` is deprecated') ||
      (message.includes('Warning:') && message.includes('React.act')))
  ) {
    return;
  }

  // Laisser passer tous les autres warnings
  originalWarn(...args);
};
