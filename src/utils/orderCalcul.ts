type ItemsObj = Record<string, number>;

export function toCents(amount: number) {
  return Math.round(amount * 100);
}

export const calculatePrice = (price: number, quantity: number): number => {
  return (toCents(price) * quantity) / 100;
};

export function mergeAndClean(items: ItemsObj, updates: any[]): ItemsObj {
  console.log(items, updates, 'params');
  // On transforme updates en Map pour lookup O(1)
  const updMap = new Map(updates.map(u => [u.details.productId, u.details.availableQuantity]));

  console.log(updMap, 'updMap');

  return Object.entries(items).reduce<ItemsObj>((acc, [id, oldVal]) => {
    // nouvelle valeur = valeur mise à jour si présente, sinon ancienne
    console.log(id, oldVal, 'israil');
    const newVal = updMap.has(id) ? updMap.get(id)! : oldVal;
    // on n’ajoute dans acc que si newVal !== 0
    console.log(newVal, 'israil');

    if (newVal !== 0) {
      acc[id] = newVal;
    }
    return acc;
  }, {});
}
