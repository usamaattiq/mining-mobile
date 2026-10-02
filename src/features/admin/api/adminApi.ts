import { apiFetch } from '@/shared/services/api';
import type { ListingDto } from '@/features/listings/api/listingsApi';

export type AdminUserItem = {
  id: string;
  fullName: string;
  phoneE164: string;
  avatarUrl: string | null;
  accountType: 'individual' | 'company';
  companyName: string | null;
  status: 'active' | 'suspended';
  createdAt: string;
};

export type AdminListingItem = ListingDto;

export type AdminCategoryItem = {
  key: 'equipment' | 'services' | 'gold';
  count: number;
  labels: { id: string; name: string; parentId: string | null; count: number }[];
};

export type AdminUserDetail = {
  id: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  avatarUrl: string | null;
  accountType: 'individual' | 'company';
  companyName: string | null;
  status: 'active' | 'suspended';
  listings: { id: string; title: string; reference: string; category: 'equipment' | 'services' | 'gold'; status: string }[];
};

type Page<T> = { total: number; page: number; items: T[] };

export const adminApi = {
  listUsers(params: { search?: string; accountType?: string; status?: string; page?: number }): Promise<Page<AdminUserItem>> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.accountType) query.set('accountType', params.accountType);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/admin/users${suffix}`);
  },
  getUser(id: string): Promise<AdminUserDetail> {
    return apiFetch(`/admin/users/${id}`);
  },
  updateUser(
    id: string,
    body: {
      fullName: string;
      email: string | null;
      address: string | null;
      companyName?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    },
  ): Promise<{ id: string }> {
    return apiFetch(`/admin/users/${id}`, { method: 'PATCH', body });
  },
  setUserStatus(id: string, status: 'active' | 'suspended'): Promise<{ id: string; status: string }> {
    return apiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: { status } });
  },
  listListings(params: { search?: string; category?: string; status?: string; page?: number }): Promise<Page<AdminListingItem>> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/admin/listings${suffix}`);
  },
  setListingStatus(id: string, status: 'active' | 'archived'): Promise<{ id: string; status: string }> {
    return apiFetch(`/admin/listings/${id}/status`, { method: 'PATCH', body: { status } });
  },
  categories(): Promise<{ items: AdminCategoryItem[] }> {
    return apiFetch('/admin/categories');
  },
  createCategory(
    category: string,
    name: string,
    parentId?: string | null,
  ): Promise<{ id: string; name: string }> {
    return apiFetch('/admin/categories', { method: 'POST', body: { category, name, parentId } });
  },
  renameCategory(id: string, name: string): Promise<{ id: string; name: string }> {
    return apiFetch(`/admin/categories/${id}`, { method: 'PATCH', body: { name } });
  },
  deleteCategory(id: string): Promise<{ id: string }> {
    return apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
  },
};
