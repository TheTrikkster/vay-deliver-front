// Types de base pour les produits dans tout le système

// Étape 5: Utiliser des enums pour les valeurs fixes
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Étape 4: Interface commune pour les produits
export interface BaseProduct {
  id?: number;
  name: string;
  description?: string;
}

export interface Product extends BaseProduct {
  unitExpression: string;
  availableQuantity: number;
  minOrder: string;
  price: number;
}

// Interface pour les données envoyées à l'API
export interface ProductApiData extends BaseProduct {
  unitExpression: string;
  price: number;
  availableQuantity: number;
  minOrder: number;
  status?: ProductStatus;
}

// Interface pour les produits affichés dans l'inventaire
export interface InventoryProduct extends BaseProduct {
  id: number;
  price: number;
  availableQuantity: number;
  unitExpression: string;
  minOrder: number;
  status: ProductStatus;
}

// Interface pour les produits disponibles à la commande
export interface AvailableProduct extends BaseProduct {
  id: number;
  price: number;
  unitExpression: string;
  stock: number;
  categorie: string;
}
