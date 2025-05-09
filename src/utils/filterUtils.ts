import { OrderStatus, Position } from '../types/order';

export function buildFilterString(params: {
  status: OrderStatus | '';
  tagNames: string[];
  position: Position;
}): string {
  const { status, tagNames, position } = params;

  console.log({ status, tagNames, position });
  const filters = new URLSearchParams();

  if (status) filters.append('status', status);
  if (tagNames.length > 0) filters.append('tagNames', tagNames.join(','));

  if (position.address || (position.lat && position.lng)) filters.append('sortBy', 'geoLocation');

  if (position.address) {
    filters.append('address', position.address);
  } else if (position.lat && position.lng) {
    filters.append('lat', position.lat);
    filters.append('lng', position.lng);
  }

  console.log(filters.toString(), 'helloooo');

  return filters.toString();
}
