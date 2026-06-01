export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  delivery_address: string | null;
  role: string;
  is_blocked: boolean;
  wallet_balance_naira?: number;
  enrollments_count?: number;
  bank_account?: {
    bank_name: string;
    account_number: string;
    account_name: string;
  } | null;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price_naira: number;
  installment_count_daily: number;
  installment_count_weekly: number;
  installment_count_monthly: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  type: string;
  amount_naira: number;
  balance_after_naira: number;
  reference: string;
  meta: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface Payment {
  id: number;
  user_id: number;
  purpose: string;
  reference: string;
  amount_naira: number;
  channel: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  user?: User;
}

export interface PaymentSchedule {
  id: number;
  sequence: number;
  due_at: string;
  amount_naira: number;
  status: string;
  paid_at: string | null;
}

export interface Enrollment {
  id: number;
  product: Product;
  user?: User;
  duration_type: string;
  custom_frequency: string | null;
  status: string;
  delivery_status: string | null;
  delivery_status_label?: string;
  shipped_at?: string | null;
  shipping?: EnrollmentShipping;
  total_naira: number;
  delivery_fee_naira: number;
  installment_count: number;
  amount_per_installment_naira: number;
  start_date: string;
  completed_at: string | null;
  payment_schedules?: PaymentSchedule[];
  created_at: string;
}

export interface DashboardStats {
  users_count: number;
  products_count: number;
  active_products_count: number;
  enrollments_count: number;
  active_enrollments_count: number;
  awaiting_shipment_count: number;
  in_transit_count: number;
  delivered_count: number;
  recently_completed_count: number;
  wallet_transactions_count: number;
  payments_count: number;
}

export interface EnrollmentShipping {
  status: string;
  status_label: string;
  carrier: string | null;
  tracking_number: string | null;
  notes: string | null;
  address: string | null;
  phone: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
}
