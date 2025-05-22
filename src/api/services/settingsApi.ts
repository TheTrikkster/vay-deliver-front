import api from '../config';
import { ENDPOINTS } from '../endpoints';

export const settingsApi = {
  getSettings: () => api.get(`${ENDPOINTS.SETTINGS.BASE}`),
  updateStatus: (status: string) => {
    console.log('should be alright');
    console.log(`${ENDPOINTS.SETTINGS.SITE_STATUS}?status=${status}`);
    return api.patch(`${ENDPOINTS.SETTINGS.SITE_STATUS}?status=${status}`);
  },
  updateOfflineMessage: (message: string) =>
    api.patch(`${ENDPOINTS.SETTINGS.OFFLINE_MESSAGE}?message=${message}`),
};
