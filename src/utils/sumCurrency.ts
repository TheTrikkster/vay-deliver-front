import React from 'react';
import currency from 'currency.js';

type SumCurrencyProps = {
  value: number;
  symbol?: string;
};

export const sumCurrency: React.FC<SumCurrencyProps> = ({ value, symbol = '€' }) => {
  const amount = currency(value, {
    symbol, // symbole monétaire
    precision: 2, // 2 décimales
    separator: ' ', // séparateur de milliers
    decimal: ',', // séparateur décimal
  });

  return amount.format({
    pattern: '# !', // ← here : nombre puis espace puis symbole
    symbol,
    decimal: ',',
    separator: ' ',
  });
};
