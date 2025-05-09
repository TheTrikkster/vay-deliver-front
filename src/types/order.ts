export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Item {
  _id: string;
  quantity: number;
}

export interface Order {
  _id: string;
  address: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: string;
  tagNames: string[];
  items: Item[];
  unitExpression: string;
  geoLocation: GeoLocation;
}

export interface Tag {
  _id: string;
  name: string;
  usageCount: number;
}

export type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELED';

export type Position = {
  lat: string;
  lng: string;
  address: string;
};
