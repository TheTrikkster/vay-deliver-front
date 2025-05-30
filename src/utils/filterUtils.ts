import { OrderStatus, Position } from '../types/order';

export function buildFilterString(params: {
  status: OrderStatus | '';
  tagNames: string[];
  position: Position;
}): string {
  const { status, tagNames, position } = params;
  const filters = new URLSearchParams();

  if (status) filters.append('status', status);
  if (tagNames.length > 0) filters.append('tagNames', tagNames.join(','));

  if (position.address) {
    filters.append('sortBy', 'geoLocation');
    filters.append('address', position.address);
  }

  return filters.toString();
}
