export function toCents(amount: number) {
  return Math.round(amount * 100);
}

export function fromCents(cents: number, currency = 'RUB', locale = 'ru-RU') {
  const value = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export const calculatePrice = (price: number, quantity: number): number => {
  return (toCents(price) * quantity) / 100;
};
