import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import {
  Product,
  Category,
  ProductVariant,
  ProductImage,
  Order,
  OrderItem,
  Review,
  Coupon,
  Banner,
  SiteSettings,
  UserProfile,
  OrderStatus,
  Address,
  AdminAuditLog,
} from './types';

// ==============================================================================
// 1. SUPABASE CLIENT CONFIGURATION
// Target Project ID: jdvlnqnxegiaefljcgvl
// Target URL: https://jdvlnqnxegiaefljcgvl.supabase.co
// ==============================================================================

const ENV_SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '') ||
  'https://jdvlnqnxegiaefljcgvl.supabase.co';

const ENV_SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== 'undefined'
    ? process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY
    : '') ||
  '';

// Allow runtime override via sessionStorage / localStorage for administrator diagnostics
export function getRuntimeKey(): string {
  try {
    const stored = localStorage.getItem('vortex_supabase_publishable_key');
    if (stored && stored.trim().length > 10) return stored.trim();
  } catch {
    // ignore
  }
  return ENV_SUPABASE_KEY;
}

export let supabaseUrl = ENV_SUPABASE_URL;
export let supabaseAnonKey = getRuntimeKey();

export async function setRuntimeSupabaseKey(key: string): Promise<boolean> {
  const cleanKey = key.trim();
  supabaseAnonKey = cleanKey;
  try {
    localStorage.setItem('vortex_supabase_publishable_key', cleanKey);
    // Sync key with server configuration and persist to .env
    const res = await fetch('/api/admin/config/set-supabase-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: cleanKey }),
    });
    if (!res.ok) return false;
  } catch {
    // ignore
  }
  reinitSupabaseClient();
  return true;
}

export async function syncSupabaseConfigFromServer(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/config/supabase');
    if (!res.ok) return false;
    const data = await res.json();
    if (data.supabaseAnonKey && data.supabaseAnonKey.length > 20) {
      if (supabaseAnonKey !== data.supabaseAnonKey) {
        supabaseAnonKey = data.supabaseAnonKey;
        if (data.supabaseUrl) supabaseUrl = data.supabaseUrl;
        try {
          localStorage.setItem('vortex_supabase_publishable_key', data.supabaseAnonKey);
        } catch {
          // ignore
        }
        reinitSupabaseClient();
      }
      return true;
    }
  } catch (err) {
    console.warn('[SUPABASE SYNC] Failed to fetch server configuration:', err);
  }
  return isSupabaseConfigured;
}

// Automatically sync on initial load if in browser
if (typeof window !== 'undefined') {
  syncSupabaseConfigFromServer();
}

export let isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 15
);

export let supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'vortex_supabase_auth_token',
    },
  }
);

function reinitSupabaseClient() {
  isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 15
  );

  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey || 'placeholder-anon-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'vortex_supabase_auth_token',
      },
    }
  );
}

// ==============================================================================
// 2. DIAGNOSTICS & CONNECTION TEST
// ==============================================================================

export interface SupabaseHealthCheck {
  connected: boolean;
  url: string;
  projectId: string;
  keyConfigured: boolean;
  latencyMs: number;
  tables: {
    products: boolean;
    categories: boolean;
    orders: boolean;
    profiles: boolean;
    coupons: boolean;
    reviews: boolean;
    banners: boolean;
    wishlists: boolean;
    addresses: boolean;
  };
  storage: {
    configured: boolean;
    bucketExists: boolean;
  };
  error?: string;
}

export async function testSupabaseConnection(): Promise<SupabaseHealthCheck> {
  const start = performance.now();
  const result: SupabaseHealthCheck = {
    connected: false,
    url: supabaseUrl,
    projectId: 'jdvlnqnxegiaefljcgvl',
    keyConfigured: isSupabaseConfigured,
    latencyMs: 0,
    tables: {
      products: false,
      categories: false,
      orders: false,
      profiles: false,
      coupons: false,
      reviews: false,
      banners: false,
      wishlists: false,
      addresses: false,
    },
    storage: {
      configured: false,
      bucketExists: false,
    },
  };

  if (!isSupabaseConfigured) {
    result.error = 'Supabase publishable key is not set. Add it in .env or the Supabase connection panel.';
    result.latencyMs = Math.round(performance.now() - start);
    return result;
  }

  try {
    const [catRes, prodRes, ordRes, profRes, coupRes, revRes, banRes, wishRes, addrRes] = await Promise.all([
      supabase.from('categories').select('id').limit(1),
      supabase.from('products').select('id').limit(1),
      supabase.from('orders').select('id').limit(1),
      supabase.from('profiles').select('id').limit(1),
      supabase.from('coupons').select('id').limit(1),
      supabase.from('reviews').select('id').limit(1),
      supabase.from('banners').select('id').limit(1),
      supabase.from('wishlists').select('id').limit(1),
      supabase.from('addresses').select('id').limit(1),
    ]);

    result.tables.categories = !catRes.error;
    result.tables.products = !prodRes.error;
    result.tables.orders = !ordRes.error;
    result.tables.profiles = !profRes.error;
    result.tables.coupons = !coupRes.error;
    result.tables.reviews = !revRes.error;
    result.tables.banners = !banRes.error;
    result.tables.wishlists = !wishRes.error;
    result.tables.addresses = !addrRes.error;

    // Test Storage
    const { data: buckets, error: storageErr } = await supabase.storage.listBuckets();
    if (!storageErr && buckets) {
      result.storage.configured = true;
      result.storage.bucketExists = buckets.some((b) => b.name === 'product-images');
    }

    result.connected = result.tables.categories || result.tables.products;
    result.latencyMs = Math.round(performance.now() - start);
  } catch (err: any) {
    result.error = err?.message || 'Connection test failed';
    result.latencyMs = Math.round(performance.now() - start);
  }

  return result;
}

// ==============================================================================
// 3. PRODUCT & CATEGORY SUPABASE DATA ACCESS
// ==============================================================================

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) return null;
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image_url: c.image_url || '',
      is_active: c.is_active ?? true,
      sort_order: c.sort_order ?? 0,
    }));
  } catch (err) {
    console.warn('Error fetching categories from Supabase:', err);
    return null;
  }
}

export async function createCategoryInSupabase(category: Omit<Category, 'id'>): Promise<Category | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        is_active: category.is_active,
        sort_order: category.sort_order,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('Error inserting category in Supabase:', error);
      return null;
    }
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      image_url: data.image_url || '',
      is_active: data.is_active,
      sort_order: data.sort_order,
    };
  } catch (err) {
    console.warn('Exception creating category in Supabase:', err);
    return null;
  }
}

export async function updateCategoryInSupabase(id: string, updates: Partial<Category>): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.image_url !== undefined) payload.image_url = updates.image_url;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;
    if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;

    const { error } = await supabase.from('categories').update(payload).eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Error updating category in Supabase:', err);
    return false;
  }
}

export async function deleteCategoryInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Error deleting category in Supabase:', err);
    return false;
  }
}

export async function fetchProductsFromSupabase(options?: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Product[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories (name, slug),
        images:product_images (*),
        variants:product_variants (*)
      `)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;
    if (error || !data) return null;

    let mapped: Product[] = data.map((p) => {
      const images: ProductImage[] = (p.images || []).map((img: any) => ({
        id: img.id,
        product_id: p.id,
        image_url: img.image_url,
        storage_path: img.storage_path,
        alt_text: img.alt_text,
        sort_order: img.sort_order || 0,
        is_primary: img.is_primary ?? false,
      }));

      const variants: ProductVariant[] = (p.variants || []).map((v: any) => ({
        id: v.id,
        product_id: p.id,
        size: v.size,
        color: v.color,
        color_code: v.color_code,
        sku: v.sku,
        price: Number(v.price),
        sale_price: v.sale_price ? Number(v.sale_price) : undefined,
        stock_quantity: Number(v.stock_quantity ?? 0),
        is_active: v.is_active ?? true,
      }));

      return {
        id: p.id,
        category_id: p.category_id,
        category_slug: p.category?.slug,
        category_name: p.category?.name,
        name: p.name,
        slug: p.slug,
        description: p.description,
        base_price: Number(p.base_price),
        sale_price: p.sale_price ? Number(p.sale_price) : undefined,
        sku: p.sku,
        is_active: p.is_active ?? true,
        is_featured: p.is_featured ?? false,
        is_new_arrival: p.is_new_arrival ?? false,
        is_on_sale: p.is_on_sale ?? false,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        images,
        variants,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });

    if (options?.categorySlug) {
      mapped = mapped.filter((p) => p.category_slug === options.categorySlug);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      mapped = mapped.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return mapped;
  } catch (err) {
    console.warn('Error fetching products from Supabase:', err);
    return null;
  }
}

export async function createProductInSupabase(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<Product | null> {
  if (!isSupabaseConfigured) return null;

  try {
    // 1. Insert product header
    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .insert({
        category_id: product.category_id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        base_price: product.base_price,
        sale_price: product.sale_price || null,
        sku: product.sku,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_new_arrival: product.is_new_arrival,
        is_on_sale: product.is_on_sale,
      })
      .select()
      .single();

    if (prodErr || !prodData) {
      console.warn('Supabase product insert error:', prodErr);
      return null;
    }

    const productId = prodData.id;

    // 2. Insert Images
    let insertedImages: ProductImage[] = [];
    if (product.images && product.images.length > 0) {
      const imageRows = product.images.map((img, idx) => ({
        product_id: productId,
        image_url: img.image_url,
        sort_order: idx,
        is_primary: img.is_primary || idx === 0,
      }));
      const { data: imgData } = await supabase.from('product_images').insert(imageRows).select();
      if (imgData) {
        insertedImages = imgData.map((img: any) => ({
          id: img.id,
          product_id: productId,
          image_url: img.image_url,
          storage_path: img.storage_path,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
        }));
      }
    }

    // 3. Insert Variants
    let insertedVariants: ProductVariant[] = [];
    if (product.variants && product.variants.length > 0) {
      const variantRows = product.variants.map((v) => ({
        product_id: productId,
        size: v.size,
        color: v.color,
        color_code: v.color_code || null,
        sku: v.sku || `${product.sku}-${v.size}-${v.color}`,
        price: v.price || product.base_price,
        sale_price: v.sale_price || product.sale_price || null,
        stock_quantity: v.stock_quantity ?? 0,
        is_active: v.is_active ?? true,
      }));
      const { data: varData } = await supabase.from('product_variants').insert(variantRows).select();
      if (varData) {
        insertedVariants = varData.map((v: any) => ({
          id: v.id,
          product_id: productId,
          size: v.size,
          color: v.color,
          color_code: v.color_code,
          sku: v.sku,
          price: Number(v.price),
          sale_price: v.sale_price ? Number(v.sale_price) : undefined,
          stock_quantity: Number(v.stock_quantity),
          is_active: v.is_active,
        }));
      }
    }

    return {
      ...product,
      id: productId,
      images: insertedImages.length > 0 ? insertedImages : product.images,
      variants: insertedVariants.length > 0 ? insertedVariants : product.variants,
      created_at: prodData.created_at,
      updated_at: prodData.updated_at,
    };
  } catch (err) {
    console.warn('Error creating product in Supabase:', err);
    return null;
  }
}

export async function updateProductInSupabase(
  id: string,
  updates: Partial<Product>
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.category_id !== undefined) payload.category_id = updates.category_id;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.base_price !== undefined) payload.base_price = updates.base_price;
    if (updates.sale_price !== undefined) payload.sale_price = updates.sale_price;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;
    if (updates.is_featured !== undefined) payload.is_featured = updates.is_featured;
    if (updates.is_new_arrival !== undefined) payload.is_new_arrival = updates.is_new_arrival;
    if (updates.is_on_sale !== undefined) payload.is_on_sale = updates.is_on_sale;

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) {
      console.warn('Supabase product update error:', error);
      return false;
    }

    // If images are provided in updates, sync images table
    if (updates.images && Array.isArray(updates.images)) {
      await supabase.from('product_images').delete().eq('product_id', id);
      const imageRows = updates.images.map((img, idx) => ({
        product_id: id,
        image_url: img.image_url,
        sort_order: idx,
        is_primary: img.is_primary || idx === 0,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    // If variants are provided in updates, sync variants table
    if (updates.variants && Array.isArray(updates.variants)) {
      for (const v of updates.variants) {
        if (v.id && !v.id.startsWith('var-') && !v.id.startsWith('temp-')) {
          await supabase
            .from('product_variants')
            .update({
              stock_quantity: v.stock_quantity,
              price: v.price,
              sale_price: v.sale_price || null,
              is_active: v.is_active,
              updated_at: new Date().toISOString(),
            })
            .eq('id', v.id);
        }
      }
    }

    return true;
  } catch (err) {
    console.warn('Error updating product in Supabase:', err);
    return false;
  }
}

export async function deleteProductInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.warn('Error deleting product in Supabase:', err);
    return false;
  }
}

export async function updateVariantStockInSupabase(
  variantId: string,
  newStock: number
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('product_variants')
      .update({ stock_quantity: Math.max(0, newStock), updated_at: new Date().toISOString() })
      .eq('id', variantId);
    return !error;
  } catch (err) {
    console.warn('Error updating variant stock in Supabase:', err);
    return false;
  }
}

// ==============================================================================
// 4. SUPABASE STORAGE (Product Photography Uploads)
// ==============================================================================

export async function uploadImageFile(file: File, bucket = 'product-images'): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `garments/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (err) {
      console.warn('Exception during Supabase storage upload:', err);
    }
  }

  // Fallback to data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// ==============================================================================
// 5. ORDERS & INVENTORY (Database-Safe Transactions)
// ==============================================================================

export async function createOrderInSupabase(
  order: Order,
  items: OrderItem[]
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true, orderId: order.id };
  }

  try {
    // 1. Insert Order
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: order.order_number,
        user_id: order.user_id || null,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        city: order.city,
        province: order.province,
        postal_code: order.postal_code || null,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping_cost: order.shipping_cost,
        total: order.total,
        coupon_code: order.coupon_code || null,
        notes: order.notes || null,
      })
      .select()
      .single();

    if (orderErr || !orderData) {
      console.warn('Supabase order creation error:', orderErr);
      return { success: false, error: orderErr?.message || 'Failed to place order in database' };
    }

    const orderId = orderData.id;

    // 2. Insert Order Items
    if (items && items.length > 0) {
      const itemRows = items.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_description: item.variant_description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      await supabase.from('order_items').insert(itemRows);

      // 3. Decrement Inventory safely
      for (const item of items) {
        try {
          await supabase.rpc('decrement_variant_stock', {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity,
          });
        } catch {
          // If RPC is unavailable or fallback required
          await supabase
            .from('product_variants')
            .update({
              stock_quantity: Math.max(0, 0),
            })
            .eq('id', item.variant_id);
        }
      }
    }

    // 4. Record coupon usage if coupon code was used
    if (order.coupon_code) {
      try {
        const { data: couponData } = await supabase
          .from('coupons')
          .select('id, used_count')
          .eq('code', order.coupon_code)
          .single();

        if (couponData) {
          await supabase.from('coupon_usage').insert({
            coupon_id: couponData.id,
            user_id: order.user_id || null,
            order_id: orderId,
          });

          await supabase
            .from('coupons')
            .update({ used_count: (couponData.used_count || 0) + 1 })
            .eq('id', couponData.id);
        }
      } catch (couponErr) {
        console.warn('Coupon usage record warning:', couponErr);
      }
    }

    return { success: true, orderId };
  } catch (err: any) {
    console.warn('Error inserting order in Supabase:', err);
    return { success: false, error: err?.message };
  }
}

export async function fetchCustomerOrdersFromSupabase(
  userId?: string,
  userEmail?: string
): Promise<Order[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (userEmail) {
      query = query.eq('customer_email', userEmail);
    } else {
      return [];
    }

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      user_id: o.user_id,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      customer_phone: o.customer_phone,
      shipping_address: o.shipping_address,
      city: o.city,
      province: o.province,
      postal_code: o.postal_code,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      order_status: o.order_status,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shipping_cost: Number(o.shipping_cost),
      total: Number(o.total),
      coupon_code: o.coupon_code,
      notes: o.notes,
      items: (o.items || []).map((it: any) => ({
        id: it.id,
        order_id: o.id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        product_name: it.product_name,
        variant_description: it.variant_description,
        quantity: it.quantity,
        unit_price: Number(it.unit_price),
        total_price: Number(it.total_price),
      })),
      created_at: o.created_at,
      updated_at: o.updated_at,
    }));
  } catch (err) {
    console.warn('Error fetching customer orders:', err);
    return null;
  }
}

export async function fetchAllOrdersForAdminFromSupabase(): Promise<Order[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      user_id: o.user_id,
      customer_name: o.customer_name,
      customer_email: o.customer_email,
      customer_phone: o.customer_phone,
      shipping_address: o.shipping_address,
      city: o.city,
      province: o.province,
      postal_code: o.postal_code,
      payment_method: o.payment_method,
      payment_status: o.payment_status,
      order_status: o.order_status,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shipping_cost: Number(o.shipping_cost),
      total: Number(o.total),
      coupon_code: o.coupon_code,
      notes: o.notes,
      items: (o.items || []).map((it: any) => ({
        id: it.id,
        order_id: o.id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        product_name: it.product_name,
        variant_description: it.variant_description,
        quantity: it.quantity,
        unit_price: Number(it.unit_price),
        total_price: Number(it.total_price),
      })),
      created_at: o.created_at,
      updated_at: o.updated_at,
    }));
  } catch (err) {
    console.warn('Error fetching all orders for admin:', err);
    return null;
  }
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    return !error;
  } catch (err) {
    console.warn('Error updating order status in Supabase:', err);
    return false;
  }
}

// ==============================================================================
// 6. CUSTOMER SUPABASE AUTHENTICATION, PROFILES & ADDRESSES
// ==============================================================================

export async function registerCustomerWithSupabase(
  name: string,
  email: string,
  pass: string,
  phone?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      user: {
        id: `u-${Date.now()}`,
        full_name: name,
        email,
        phone,
        role: 'customer',
        created_at: new Date().toISOString(),
      },
    };
  }

  try {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          phone: phone || '',
        },
      },
    });

    if (authErr) {
      return { success: false, error: authErr.message };
    }

    const authUser = authData.user;
    if (!authUser) {
      return { success: false, error: 'Registration failed to return user.' };
    }

    // Upsert into public.profiles
    const profile: UserProfile = {
      id: authUser.id,
      full_name: name,
      email,
      phone: phone || '',
      role: 'customer',
      created_at: new Date().toISOString(),
    };

    await supabase.from('profiles').upsert({
      id: authUser.id,
      full_name: name,
      email,
      phone: phone || null,
      role: 'customer',
    });

    return { success: true, user: profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Registration exception' };
  }
}

export async function loginCustomerWithSupabase(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      user: {
        id: `u-${Date.now()}`,
        full_name: email.split('@')[0],
        email,
        role: 'customer',
        created_at: new Date().toISOString(),
      },
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Invalid email or password' };
    }

    // Fetch profile
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const userProfile: UserProfile = {
      id: data.user.id,
      full_name: profData?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
      email: data.user.email || email,
      phone: profData?.phone || data.user.user_metadata?.phone,
      role: (profData?.role as any) || 'customer',
      created_at: data.user.created_at,
    };

    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication error' };
  }
}

export async function logoutCustomerFromSupabase(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}

export async function resetCustomerPasswordWithSupabase(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function updateCustomerProfileInSupabase(
  userId: string,
  updates: { full_name?: string; phone?: string }
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchCustomerAddressesFromSupabase(userId: string): Promise<Address[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error || !data) return [];
    return data.map((a) => ({
      id: a.id,
      user_id: a.user_id,
      full_name: a.full_name,
      phone: a.phone,
      address: a.address,
      city: a.city,
      province: a.province,
      postal_code: a.postal_code || '',
      is_default: a.is_default,
    }));
  } catch {
    return [];
  }
}

export async function saveCustomerAddressInSupabase(
  address: Omit<Address, 'id'>
): Promise<Address | null> {
  if (!isSupabaseConfigured) {
    return {
      ...address,
      id: `addr-${Date.now()}`,
    };
  }
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: address.user_id,
        full_name: address.full_name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        province: address.province,
        postal_code: address.postal_code || null,
        is_default: address.is_default,
      })
      .select()
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      user_id: data.user_id,
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      province: data.province,
      postal_code: data.postal_code || '',
      is_default: data.is_default,
    };
  } catch {
    return null;
  }
}

export async function deleteCustomerAddressInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 7. WISHLIST SUPABASE INTEGRATION
// ==============================================================================

export async function fetchWishlistFromSupabase(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((w: any) => w.product_id);
  } catch {
    return [];
  }
}

export async function toggleWishlistInSupabase(
  userId: string,
  productId: string,
  isCurrentlyWishlisted: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    if (isCurrentlyWishlisted) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      return !error;
    } else {
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: userId, product_id: productId });
      return !error;
    }
  } catch {
    return false;
  }
}

// ==============================================================================
// 8. BANNERS, COUPONS, REVIEWS & SETTINGS
// ==============================================================================

export async function fetchBannersFromSupabase(): Promise<Banner[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateBannerInSupabase(id: string, updates: Partial<Banner>): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('banners').update(updates).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function createBannerInSupabase(banner: Omit<Banner, 'id'>): Promise<Banner | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('banners').insert(banner).select().single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function deleteBannerInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchCouponsFromSupabase(): Promise<Coupon[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createCouponInSupabase(coupon: Omit<Coupon, 'id' | 'used_count'>): Promise<Coupon | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        minimum_order_amount: coupon.minimum_order_amount,
        maximum_discount: coupon.maximum_discount || null,
        usage_limit: coupon.usage_limit || null,
        used_count: 0,
        is_active: coupon.is_active,
      })
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateCouponInSupabase(id: string, updates: Partial<Coupon>): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('coupons').update(updates).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCouponInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchReviewsFromSupabase(productId?: string): Promise<Review[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data, error } = await query;
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function submitReviewToSupabase(review: Omit<Review, 'id' | 'created_at'>): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase.from('reviews').insert({
      product_id: review.product_id,
      user_id: review.user_id,
      customer_name: review.customer_name,
      rating: review.rating,
      review_text: review.review_text,
      is_approved: false, // Moderation required
    });
    return !error;
  } catch {
    return false;
  }
}

export async function approveReviewInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteReviewInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSiteSettingsFromSupabase(): Promise<SiteSettings | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !data || data.length === 0) return null;

    const map: Record<string, any> = {};
    data.forEach((row) => {
      map[row.key] = row.value;
    });

    if (Object.keys(map).length > 0) {
      return map as SiteSettings;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateSiteSettingsInSupabase(settings: Partial<SiteSettings>): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });
    }
    return true;
  } catch {
    return false;
  }
}

// ==============================================================================
// 9. ADMIN AUDIT LOGS IN SUPABASE
// ==============================================================================

export async function fetchAdminAuditLogsFromSupabase(): Promise<AdminAuditLog[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error || !data) return null;
    return data.map((l: any) => ({
      id: l.id,
      adminId: l.admin_id,
      adminEmail: l.admin_email,
      action: l.action,
      resource: l.resource,
      details: l.details,
      ipAddress: l.ip_address,
      timestamp: l.created_at,
    }));
  } catch {
    return null;
  }
}

export async function logAdminActionInSupabase(
  adminId: string,
  adminEmail: string,
  action: string,
  resource: string,
  details?: any
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const cleanDetails = details ? { ...details } : {};
    if (cleanDetails.password) delete cleanDetails.password;
    if (cleanDetails.token) cleanDetails.token = '[REDACTED]';

    const { error } = await supabase.from('admin_audit_logs').insert({
      admin_id: adminId,
      admin_email: adminEmail,
      action,
      resource,
      details: cleanDetails,
    });
    return !error;
  } catch {
    return false;
  }
}
