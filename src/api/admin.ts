import { apiRequest, setToken } from './client';
import type {
  DashboardStats,
  Enrollment,
  PaginatedResponse,
  Payment,
  Product,
  User,
  WalletTransaction,
} from './types';

export async function adminLogin(email: string, password: string) {
  const result = await apiRequest<{ user: User; token: string }>('/admin/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setToken(result.token);
  return result.user;
}

export async function adminLogout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    setToken(null);
  }
}

export async function getMe() {
  const result = await apiRequest<{ user: User }>('/auth/me');
  return result.user;
}

export async function getDashboardStats() {
  const result = await apiRequest<{ data: DashboardStats }>('/admin/dashboard');
  return result.data;
}

export type ProductSort =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc';

export async function listProducts(params?: {
  search?: string;
  active?: boolean;
  sort?: ProductSort;
  page?: number;
  per_page?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.active !== undefined) q.set('active', String(params.active));
  if (params?.sort) q.set('sort', params.sort);
  if (params?.page) q.set('page', String(params.page));
  if (params?.per_page) q.set('per_page', String(params.per_page));
  return apiRequest<PaginatedResponse<Product>>(`/admin/products?${q}`);
}

export async function getProduct(id: number) {
  const result = await apiRequest<{ data: Product }>(`/admin/products/${id}`);
  return result.data;
}

export async function createProduct(body: Record<string, unknown>) {
  const result = await apiRequest<{ data: Product }>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return result.data;
}

export async function updateProduct(id: number, body: Record<string, unknown>) {
  const result = await apiRequest<{ data: Product }>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return result.data;
}

export async function uploadProductImage(id: number, file: File) {
  const form = new FormData();
  form.append('image', file);
  const result = await apiRequest<{ data: Product }>(`/admin/products/${id}/image`, {
    method: 'POST',
    formData: true,
    body: form,
  });
  return result.data;
}

export async function deleteProduct(id: number) {
  return apiRequest<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' });
}

export async function listUsers(params?: { search?: string; blocked?: boolean; page?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.blocked !== undefined) q.set('blocked', String(params.blocked));
  if (params?.page) q.set('page', String(params.page));
  return apiRequest<PaginatedResponse<User>>(`/admin/users?${q}`);
}

export async function getUser(id: number) {
  const result = await apiRequest<{ data: User }>(`/admin/users/${id}`);
  return result.data;
}

export async function updateUser(id: number, body: Record<string, unknown>) {
  const result = await apiRequest<{ data: User }>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return result.data;
}

export async function blockUser(id: number) {
  const result = await apiRequest<{ data: User }>(`/admin/users/${id}/block`, { method: 'POST' });
  return result.data;
}

export async function unblockUser(id: number) {
  const result = await apiRequest<{ data: User }>(`/admin/users/${id}/unblock`, { method: 'POST' });
  return result.data;
}

export async function updateUserWallet(id: number, balanceNaira: number) {
  const result = await apiRequest<{ data: User }>(`/admin/users/${id}/wallet`, {
    method: 'PUT',
    body: JSON.stringify({ balance_naira: balanceNaira }),
  });
  return result.data;
}

export async function listTransactions(params?: { type?: string; user_id?: number; page?: number }) {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.user_id) q.set('user_id', String(params.user_id));
  if (params?.page) q.set('page', String(params.page));
  return apiRequest<PaginatedResponse<WalletTransaction>>(`/admin/transactions?${q}`);
}

export async function listPayments(params?: { status?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.page) q.set('page', String(params.page));
  return apiRequest<PaginatedResponse<Payment>>(`/admin/payments?${q}`);
}

export type EnrollmentFulfillment =
  | 'awaiting_shipment'
  | 'in_transit'
  | 'delivered'
  | 'recently_completed';

export async function listEnrollments(params?: {
  status?: string;
  delivery_status?: string;
  fulfillment?: EnrollmentFulfillment;
  sort?: 'newest' | 'completed_recent' | 'delivered_recent';
  user_id?: number;
  page?: number;
}) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.delivery_status) q.set('delivery_status', params.delivery_status);
  if (params?.fulfillment) q.set('fulfillment', params.fulfillment);
  if (params?.sort) q.set('sort', params.sort);
  if (params?.user_id) q.set('user_id', String(params.user_id));
  if (params?.page) q.set('page', String(params.page));
  return apiRequest<PaginatedResponse<Enrollment>>(`/admin/enrollments?${q}`);
}

export async function updateEnrollmentDelivery(
  id: number,
  body: {
    delivery_status: string;
    carrier?: string;
    tracking_number?: string;
    shipping_notes?: string;
    delivery_address_snapshot?: string;
    recipient_phone_snapshot?: string;
  },
) {
  const result = await apiRequest<{ data: Enrollment; message: string }>(`/admin/enrollments/${id}/delivery`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return result.data;
}

export async function getEnrollment(id: number) {
  const result = await apiRequest<{ data: Enrollment }>(`/admin/enrollments/${id}`);
  return result.data;
}

export async function listUserEnrollments(userId: number) {
  const result = await apiRequest<{ data: Enrollment[] }>(`/admin/users/${userId}/enrollments`);
  return result.data;
}
