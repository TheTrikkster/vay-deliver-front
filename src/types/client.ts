export interface ProductType {
  _id: string;
  name: string;
  description: string;
  minOrder: number;
  maxOrder: number;
  price: number;
  unitExpression: string;
}

export interface ClientCardProps {
  product: ProductType | undefined;
  quantity: number;
  cartActions: {
    onAdd: (id: string) => void;
    onRemove: (id: string) => void;
  };
}
