import api from '../config';
import { ENDPOINTS } from '../endpoints';
import { Tag } from '../../types/order';

export const tagsApi = {
  suggest: (query: string) => api.get<Tag[]>(`${ENDPOINTS.TAGS.SUGGEST}?q=${query}`),
};
