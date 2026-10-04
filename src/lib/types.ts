export type UserRole = 'customer' | 'admin' | 'manager' | 'inventory_manager' | 'support';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;
  color: string;
  color_code?: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path?: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  category_slug?: string;
  category_name?: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  sale_price?: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  meta_title?: string;
  meta_description?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string; // unique item key e.g. variant_id
  product_id: string;
  product: Product;
  variant_id: string;
  variant: ProductVariant;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'online';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  province: string;
  postal_code?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  coupon_code?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  customer_name: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  starts_at?: string;
  expires_at?: string;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  button_text: string;
  button_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export interface SiteSettings {
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  store_name: string;
  business_email: string;
  whatsapp_number: string;
  currency: string;
  currency_symbol: string;
  announcement: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  timestamp: string;
}

export interface AdminSession {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: 'admin';
  };
  expiresAt: number;
}
