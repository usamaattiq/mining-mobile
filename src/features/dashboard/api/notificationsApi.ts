import { apiFetch } from '@/shared/services/api';
import type { InAppNotification } from '@/features/dashboard/types/notification.types';

export const notificationsApi = {
  list(options?: { signal?: AbortSignal }): Promise<InAppNotification[]> {
    return apiFetch('/notifications', { signal: options?.signal });
  },

  markRead(id: string): Promise<{ read: boolean }> {
    return apiFetch(`/notifications/${id}/read`, { method: 'POST' });
  },

  markAllRead(): Promise<{ read: boolean }> {
    return apiFetch('/notifications/read-all', { method: 'POST' });
  },
};
