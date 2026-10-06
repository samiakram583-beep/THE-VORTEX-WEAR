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
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
} from './initialData';

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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vortex_supabase_config_updated'));
  }
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
        window.dispatchEvent(new CustomEvent('vortex_supabase_config_updated'));
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

export async function createCategoryInSupabase(
  category: Omit<Category, 'id'>
): Promise<{ success: boolean; category?: Category; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase client is not configured.' };
  }
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
      return { success: false, error: error?.message || 'Database error creating category.' };
    }
    return {
      success: true,
      category: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        image_url: data.image_url || '',
        is_active: data.is_active,
        sort_order: data.sort_order,
      },
    };
  } catch (err: any) {
    console.warn('Exception creating category in Supabase:', err);
    return { success: false, error: err?.message || 'Exception creating category.' };
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
    const { data: cat } = await supabase.from('categories').select('image_url').eq('id', id).maybeSingle();
    if (cat?.image_url) {
      const path = extractStoragePathFromUrl(cat.image_url, 'product-images');
      if (path) {
        try {
          await supabase.storage.from('product-images').remove([path]);
        } catch {
          // ignore
        }
      }
    }
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

/**
 * Safely extracts relative bucket storage path from Supabase storage URLs
 * e.g. https://.../storage/v1/object/public/product-images/garments/123.jpg -> garments/123.jpg
 */
export function extractStoragePathFromUrl(url: string | null | undefined, bucket = 'product-images'): string | null {
  if (!url || typeof url !== 'string') return null;
  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(publicMarker);
  if (idx !== -1) {
    return decodeURIComponent(url.substring(idx + publicMarker.length).split('?')[0]);
  }
  const signMarker = `/storage/v1/object/sign/${bucket}/`;
  const sIdx = url.indexOf(signMarker);
  if (sIdx !== -1) {
    return decodeURIComponent(url.substring(sIdx + signMarker.length).split('?')[0]);
  }
  if (url.startsWith('garments/') || url.startsWith('banners/')) {
    return url;
  }
  return null;
}

export async function createProductInSupabase(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; product?: Product; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  if (!product.category_id || !product.category_id.trim()) {
    return { success: false, error: 'A valid category is required to create a product.' };
  }

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
      return { success: false, error: prodErr?.message || 'Database error inserting product record.' };
    }

    const productId = prodData.id;

    // 2. Insert Images
    let insertedImages: ProductImage[] = [];
    if (product.images && product.images.length > 0) {
      const imageRows = product.images.map((img, idx) => ({
        product_id: productId,
        image_url: img.image_url,
        storage_path: img.storage_path || extractStoragePathFromUrl(img.image_url, 'product-images') || null,
        sort_order: idx + 1,
        is_primary: img.is_primary || idx === 0,
        alt_text: img.alt_text || product.name,
      }));
      const { data: imgData, error: imgErr } = await supabase.from('product_images').insert(imageRows).select();
      if (imgErr) {
        console.warn('Supabase product_images insert warning:', imgErr);
      }
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
      const { data: varData, error: varErr } = await supabase.from('product_variants').insert(variantRows).select();
      if (varErr) {
        console.error('Supabase product_variants insert error:', varErr);
        return { success: false, error: `Product created, but variants failed: ${varErr.message}` };
      }
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

    const createdProduct: Product = {
      ...product,
      id: productId,
      images: insertedImages.length > 0 ? insertedImages : product.images,
      variants: insertedVariants.length > 0 ? insertedVariants : product.variants,
      created_at: prodData.created_at,
      updated_at: prodData.updated_at,
    };

    return { success: true, product: createdProduct };
  } catch (err: any) {
    console.warn('Error creating product in Supabase:', err);
    return { success: false, error: err?.message || 'Exception creating product.' };
  }
}

export async function updateProductInSupabase(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase client is not configured.' };

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
      return { success: false, error: error.message };
    }

    // If images are provided in updates, sync images table and delete removed files from storage
    if (updates.images && Array.isArray(updates.images)) {
      const { data: existingImgs } = await supabase
        .from('product_images')
        .select('image_url, storage_path')
        .eq('product_id', id);

      const newUrls = new Set(updates.images.map((img) => img.image_url));
      const removedImgs = (existingImgs || []).filter((img) => !newUrls.has(img.image_url));

      const pathsToDelete: string[] = [];
      for (const img of removedImgs) {
        const path = img.storage_path || extractStoragePathFromUrl(img.image_url, 'product-images');
        if (path) pathsToDelete.push(path);
      }
      if (pathsToDelete.length > 0) {
        try {
          await supabase.storage.from('product-images').remove(pathsToDelete);
        } catch (storageErr) {
          console.warn('Could not remove replaced images from storage:', storageErr);
        }
      }

      await supabase.from('product_images').delete().eq('product_id', id);
      const imageRows = updates.images.map((img, idx) => ({
        product_id: id,
        image_url: img.image_url,
        storage_path: img.storage_path || extractStoragePathFromUrl(img.image_url, 'product-images') || null,
        sort_order: idx + 1,
        is_primary: img.is_primary || idx === 0,
        alt_text: img.alt_text || updates.name || '',
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    // If variants are provided in updates, sync variants table
    if (updates.variants && Array.isArray(updates.variants)) {
      for (const v of updates.variants) {
        if (v.id && !v.id.startsWith('var-') && !v.id.startsWith('temp-') && !v.id.startsWith('v1') && !v.id.startsWith('v2')) {
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

    return { success: true };
  } catch (err: any) {
    console.warn('Error updating product in Supabase:', err);
    return { success: false, error: err?.message || 'Exception updating product.' };
  }
}

export async function deleteProductInSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase client is not configured.' };
  try {
    // 1. Find all image URLs for this product to clean up from Supabase Storage
    const { data: imgRows } = await supabase
      .from('product_images')
      .select('image_url, storage_path')
      .eq('product_id', id);

    if (imgRows && imgRows.length > 0) {
      const storagePaths: string[] = [];
      for (const img of imgRows) {
        const path = img.storage_path || extractStoragePathFromUrl(img.image_url, 'product-images');
        if (path) storagePaths.push(path);
      }
      if (storagePaths.length > 0) {
        try {
          await supabase.storage.from('product-images').remove(storagePaths);
        } catch (storageErr) {
          console.warn('Could not remove product images from storage:', storageErr);
        }
      }
    }

    // 2. Authoritatively delete product row in database
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting product from Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Error deleting product in Supabase:', err);
    return { success: false, error: err?.message || 'Exception deleting product.' };
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
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!allowedMimes.includes(file.type)) {
    throw new Error(`Unsupported image type (${file.type || 'unknown'}). Please upload a JPEG, PNG, or WebP image.`);
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image file is too large. Maximum allowed file size is 10 MB.');
  }

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
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(`Supabase Storage upload error: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (!data?.publicUrl) {
        throw new Error('Could not retrieve public URL for uploaded image.');
      }
      return data.publicUrl;
    } catch (err: any) {
      console.warn('Supabase storage upload error:', err?.message || err);
      throw err;
    }
  }

  throw new Error('Supabase Storage is not configured. Connect your Supabase credentials in Admin Settings to upload images.');
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
  userId?: string
): Promise<Order[] | null> {
  if (!isSupabaseConfigured) return null;
  if (!userId || !userId.trim()) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (*)
      `)
      .eq('user_id', userId.trim())
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) console.warn('[SUPABASE ORDERS FETCH]', error.message);
      return [];
    }

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

export async function fetchOrderByNumberFromSupabase(
  orderNumber: string
): Promise<Order | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (*)
      `)
      .eq('order_number', orderNumber.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      order_number: data.order_number,
      user_id: data.user_id,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      shipping_address: data.shipping_address,
      city: data.city,
      province: data.province,
      postal_code: data.postal_code,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      order_status: data.order_status,
      subtotal: Number(data.subtotal),
      discount: Number(data.discount),
      shipping_cost: Number(data.shipping_cost),
      total: Number(data.total),
      coupon_code: data.coupon_code,
      notes: data.notes,
      items: (data.items || []).map((it: any) => ({
        id: it.id,
        order_id: data.id,
        product_id: it.product_id,
        variant_id: it.variant_id,
        product_name: it.product_name,
        variant_description: it.variant_description,
        quantity: it.quantity,
        unit_price: Number(it.unit_price),
        total_price: Number(it.total_price),
      })),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (err) {
    console.warn('Error fetching order by number from Supabase:', err);
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
      success: false,
      error: 'Supabase authentication service is not configured. Please configure API credentials.',
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
      success: false,
      error: 'Supabase authentication service is not configured. Please configure API credentials.',
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
    const { data: banner } = await supabase.from('banners').select('image_url').eq('id', id).maybeSingle();
    if (banner?.image_url) {
      const path = extractStoragePathFromUrl(banner.image_url, 'product-images');
      if (path) {
        try {
          await supabase.storage.from('product-images').remove([path]);
        } catch {
          // ignore
        }
      }
    }
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

// ==============================================================================
// 10. SAFE ONE-TIME DATABASE INITIALIZATION (SEED DATA RULE COMPLIANT)
// ==============================================================================
export async function initializeSupabaseStoreIfEmpty(): Promise<{
  success: boolean;
  message: string;
  alreadyInitialized?: boolean;
}> {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    // 1. Strict guard: Check if store has already been initialized (site_settings flag)
    const { data: initFlag } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'store_initialized')
      .maybeSingle();

    if (initFlag?.value?.initialized) {
      return {
        success: true,
        alreadyInitialized: true,
        message: 'Store was previously initialized. Seeding blocked to protect intentional production deletions.',
      };
    }

    // 2. Strict guard: Check if any products or categories already exist in database
    const [prodCheck, catCheck] = await Promise.all([
      supabase.from('products').select('id').limit(1),
      supabase.from('categories').select('id').limit(1),
    ]);

    if ((prodCheck.data && prodCheck.data.length > 0) || (catCheck.data && catCheck.data.length > 0)) {
      // Mark as initialized so no deployment will ever attempt to re-seed
      await supabase.from('site_settings').upsert({
        key: 'store_initialized',
        value: { initialized: true, marked_at: new Date().toISOString() },
      });
      return {
        success: true,
        alreadyInitialized: true,
        message: 'Existing production database detected. Marked store as initialized.',
      };
    }

    // 3. Database is truly empty and has NEVER been initialized:
    // Populate baseline categories & products
    for (const cat of INITIAL_CATEGORIES) {
      await supabase.from('categories').upsert(
        {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image_url: cat.image_url,
          is_active: cat.is_active,
          sort_order: cat.sort_order,
        },
        { onConflict: 'slug' }
      );
    }

    const { data: dbCategories } = await supabase.from('categories').select('*');
    const shirtsCat = dbCategories?.find((c) => c.slug === 'shirts');
    const pantsCat = dbCategories?.find((c) => c.slug === 'pants');

    for (const prod of INITIAL_PRODUCTS) {
      const categoryId = prod.category_slug === 'pants' ? pantsCat?.id : shirtsCat?.id;
      if (!categoryId) continue;

      const { data: insertedProd } = await supabase
        .from('products')
        .insert({
          category_id: categoryId,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          base_price: prod.base_price,
          sale_price: prod.sale_price || null,
          sku: prod.sku,
          is_active: prod.is_active,
          is_featured: prod.is_featured,
          is_new_arrival: prod.is_new_arrival,
          is_on_sale: prod.is_on_sale,
        })
        .select()
        .single();

      if (insertedProd?.id) {
        if (prod.images && prod.images.length > 0) {
          const imgRows = prod.images.map((img, idx) => ({
            product_id: insertedProd.id,
            image_url: img.image_url,
            storage_path: img.storage_path || extractStoragePathFromUrl(img.image_url, 'product-images') || null,
            sort_order: idx + 1,
            is_primary: idx === 0,
          }));
          await supabase.from('product_images').insert(imgRows);
        }

        if (prod.variants && prod.variants.length > 0) {
          const varRows = prod.variants.map((v) => ({
            product_id: insertedProd.id,
            size: v.size,
            color: v.color,
            color_code: v.color_code || null,
            sku: v.sku,
            price: v.price,
            sale_price: v.sale_price || null,
            stock_quantity: v.stock_quantity,
            is_active: v.is_active,
          }));
          await supabase.from('product_variants').insert(varRows);
        }
      }
    }

    for (const b of INITIAL_BANNERS) {
      await supabase.from('banners').insert({
        title: b.title,
        description: b.description,
        image_url: b.image_url,
        button_text: b.button_text,
        button_url: b.button_url,
        is_active: b.is_active,
        sort_order: b.sort_order,
      });
    }

    for (const coup of INITIAL_COUPONS) {
      await supabase.from('coupons').upsert(
        {
          code: coup.code,
          discount_type: coup.discount_type,
          discount_value: coup.discount_value,
          minimum_order_amount: coup.minimum_order_amount,
          maximum_discount: coup.maximum_discount || null,
          usage_limit: coup.usage_limit || null,
          is_active: coup.is_active,
        },
        { onConflict: 'code' }
      );
    }

    // Record initialization marker permanently in Supabase
    await supabase.from('site_settings').upsert({
      key: 'store_initialized',
      value: { initialized: true, initialized_at: new Date().toISOString() },
    });

    return { success: true, message: 'Store database successfully initialized with production catalog.' };
  } catch (err: any) {
    console.warn('Error initializing store data:', err);
    return { success: false, message: err?.message || 'Initialization failed' };
  }
}
