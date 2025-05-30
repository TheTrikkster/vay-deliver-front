import api from '../config';
import { ENDPOINTS } from '../endpoints';

export const settingsApi = {
  getSettings: () => api.get(`${ENDPOINTS.SETTINGS.BASE}`),
  updateStatus: (status: string) => {
    return api.patch(`${ENDPOINTS.SETTINGS.SITE_STATUS}?status=${status}`);
  },
  updateOfflineMessage: (message: string) =>
    api.patch(`${ENDPOINTS.SETTINGS.OFFLINE_MESSAGE}?message=${message}`),
};
