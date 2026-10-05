import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  Review,
  Coupon,
  Banner,
  SiteSettings,
  UserProfile,
  ProductVariant,
  OrderStatus,
  Address,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from './initialData';
import { resolveImageUrl } from '../assets/images';
import { AdminAuthService } from './adminAuth';
import {
  supabase,
  isSupabaseConfigured,
  fetchCategoriesFromSupabase,
  fetchProductsFromSupabase,
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductInSupabase,
  updateVariantStockInSupabase,
  createCategoryInSupabase,
  updateCategoryInSupabase,
  deleteCategoryInSupabase,
  createOrderInSupabase,
  fetchCustomerOrdersFromSupabase,
  fetchAllOrdersForAdminFromSupabase,
  updateOrderStatusInSupabase,
  registerCustomerWithSupabase,
  loginCustomerWithSupabase,
  logoutCustomerFromSupabase,
  resetCustomerPasswordWithSupabase,
  updateCustomerProfileInSupabase,
  fetchCustomerAddressesFromSupabase,
  saveCustomerAddressInSupabase,
  deleteCustomerAddressInSupabase,
  fetchWishlistFromSupabase,
  toggleWishlistInSupabase,
  fetchBannersFromSupabase,
  updateBannerInSupabase,
  createBannerInSupabase,
  deleteBannerInSupabase,
  fetchCouponsFromSupabase,
  createCouponInSupabase,
  updateCouponInSupabase,
  deleteCouponInSupabase,
  fetchReviewsFromSupabase,
  submitReviewToSupabase,
  approveReviewInSupabase,
  deleteReviewInSupabase,
  fetchSiteSettingsFromSupabase,
  updateSiteSettingsInSupabase,
} from './supabase';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Products & Collections
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  reviews: Review[];
  settings: SiteSettings;
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  addresses: Address[];
  appliedCoupon: Coupon | null;
  currentUser: UserProfile | null;
  toasts: Toast[];
  isLoading: boolean;

  // Toast actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Cart actions
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => boolean;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist actions
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // Orders
  createOrder: (orderPayload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    province: string;
    postal_code?: string;
    notes?: string;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;

  // Product Admin actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateVariantStock: (productId: string, variantId: string, newStock: number) => Promise<void>;

  // Category Admin actions
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Review actions
  submitReview: (productId: string, customerName: string, rating: number, text: string) => Promise<void>;
  approveReview: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Coupon Admin actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'used_count'>) => Promise<Coupon>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  // Banner Admin actions
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<Banner>;
  deleteBanner: (id: string) => Promise<void>;
  setActiveHeroBanner: (id: string) => Promise<void>;

  // Settings
  updateSettings: (updates: Partial<SiteSettings>) => Promise<void>;

  // Customer Profile & Addresses
  updateProfile: (updates: { full_name?: string; phone?: string }) => Promise<boolean>;
  addAddress: (addr: Omit<Address, 'id' | 'user_id'>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;

  // Auth actions
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;

  // Refresh
  refreshCatalog: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'vortex_products_v1',
  CATEGORIES: 'vortex_categories_v1',
  BANNERS: 'vortex_banners_v1',
  COUPONS: 'vortex_coupons_v1',
  REVIEWS: 'vortex_reviews_v1',
  ORDERS: 'vortex_orders_v1',
  CART: 'vortex_cart_v1',
  WISHLIST: 'vortex_wishlist_v1',
  SETTINGS: 'vortex_settings_v1',
  USER: 'vortex_user_v1',
  ADDRESSES: 'vortex_addresses_v1',
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Storage read failed for', key, err);
  }
  return defaultValue;
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage write failed for', key, err);
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return (raw || []).map((p) => ({
      ...p,
      images: (p.images || []).map((img) => ({
        ...img,
        image_url: resolveImageUrl(img.image_url),
      })),
    }));
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const raw = getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return (raw || []).map((c) => ({
      ...c,
      image_url: resolveImageUrl(c.image_url),
    }));
  });
  const [banners, setBanners] = useState<Banner[]>(() => {
    const raw = getStorage<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    return (raw || []).map((b) => ({
      ...b,
      image_url: resolveImageUrl(b.image_url),
    }));
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS));
  const [reviews, setReviews] = useState<Review[]>(() => getStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS));
  const [orders, setOrders] = useState<Order[]>(() => getStorage(STORAGE_KEYS.ORDERS, []));
  const [cart, setCart] = useState<CartItem[]>(() => getStorage(STORAGE_KEYS.CART, []));
  const [wishlist, setWishlist] = useState<string[]>(() => getStorage(STORAGE_KEYS.WISHLIST, []));
  const [addresses, setAddresses] = useState<Address[]>(() => getStorage(STORAGE_KEYS.ADDRESSES, []));
  const [settings, setSettings] = useState<SiteSettings>(() => getStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStorage(STORAGE_KEYS.USER, null));
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => setStorage(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => setStorage(STORAGE_KEYS.CATEGORIES, categories), [categories]);
  useEffect(() => setStorage(STORAGE_KEYS.BANNERS, banners), [banners]);
  useEffect(() => setStorage(STORAGE_KEYS.COUPONS, coupons), [coupons]);
  useEffect(() => setStorage(STORAGE_KEYS.REVIEWS, reviews), [reviews]);
  useEffect(() => setStorage(STORAGE_KEYS.ORDERS, orders), [orders]);
  useEffect(() => setStorage(STORAGE_KEYS.CART, cart), [cart]);
  useEffect(() => setStorage(STORAGE_KEYS.WISHLIST, wishlist), [wishlist]);
  useEffect(() => setStorage(STORAGE_KEYS.ADDRESSES, addresses), [addresses]);
  useEffect(() => setStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => setStorage(STORAGE_KEYS.USER, currentUser), [currentUser]);

  // Toast manager
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 1. Load data from Supabase if configured
  const refreshCatalog = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);

    try {
      const [sbCategories, sbProducts, sbBanners, sbCoupons, sbReviews, sbSettings] = await Promise.all([
        fetchCategoriesFromSupabase(),
        fetchProductsFromSupabase(),
        fetchBannersFromSupabase(),
        fetchCouponsFromSupabase(),
        fetchReviewsFromSupabase(),
        fetchSiteSettingsFromSupabase(),
      ]);

      if (sbCategories && sbCategories.length > 0) {
        setCategories(sbCategories);
      }
      if (sbProducts && sbProducts.length > 0) {
        setProducts(sbProducts);
      }
      if (sbBanners && sbBanners.length > 0) {
        setBanners(sbBanners);
      }
      if (sbCoupons && sbCoupons.length > 0) {
        setCoupons(sbCoupons);
      }
      if (sbReviews && sbReviews.length > 0) {
        setReviews(sbReviews);
      }
      if (sbSettings) {
        setSettings((prev) => ({ ...prev, ...sbSettings }));
      }
    } catch (err) {
      console.warn('Error syncing Supabase catalog:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync Supabase Auth session on mount
  useEffect(() => {
    refreshCatalog();

    if (!isSupabaseConfigured) return;

    // Check active Supabase Auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()
          .then(({ data: prof }) => {
            const profile: UserProfile = {
              id: u.id,
              full_name: prof?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Customer',
              email: u.email || '',
              phone: prof?.phone || u.user_metadata?.phone || '',
              role: (prof?.role as any) || 'customer',
              created_at: u.created_at,
            };
            setCurrentUser(profile);

            // Fetch user specific data from Supabase
            fetchWishlistFromSupabase(u.id).then((w) => {
              if (w) setWishlist(w);
            });
            fetchCustomerOrdersFromSupabase(u.id, u.email).then((ords) => {
              if (ords && ords.length > 0) setOrders(ords);
            });
            fetchCustomerAddressesFromSupabase(u.id).then((addrs) => {
              if (addrs) setAddresses(addrs);
            });
          });
      }
    });

    // Listen for Auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single();
        const profile: UserProfile = {
          id: u.id,
          full_name: prof?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Customer',
          email: u.email || '',
          phone: prof?.phone || u.user_metadata?.phone || '',
          role: (prof?.role as any) || 'customer',
          created_at: u.created_at,
        };
        setCurrentUser(profile);

        const [userWishlist, userOrders, userAddresses] = await Promise.all([
          fetchWishlistFromSupabase(u.id),
          fetchCustomerOrdersFromSupabase(u.id, u.email),
          fetchCustomerAddressesFromSupabase(u.id),
        ]);

        if (userWishlist) setWishlist(userWishlist);
        if (userOrders && userOrders.length > 0) setOrders(userOrders);
        if (userAddresses) setAddresses(userAddresses);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAddresses([]);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refreshCatalog]);

  // Cart calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Authoritative database prices calculation
  const subtotal = cart.reduce((acc, item) => {
    const currentProd = products.find((p) => p.id === item.product_id);
    const unitPrice = currentProd
      ? (currentProd.sale_price ?? currentProd.base_price)
      : (item.variant.sale_price ?? item.variant.price);
    return acc + unitPrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minimum_order_amount) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
      if (appliedCoupon.maximum_discount && discountAmount > appliedCoupon.maximum_discount) {
        discountAmount = appliedCoupon.maximum_discount;
      }
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const shippingFee = subtotal >= settings.free_shipping_threshold || subtotal === 0 ? 0 : settings.standard_shipping_fee;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1): boolean => {
    if (!product.is_active || !variant.is_active) {
      showToast('This product variant is currently unavailable.', 'error');
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.variant_id === variant.id);
    const currentQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedQty = currentQty + quantity;

    if (requestedQty > variant.stock_quantity) {
      showToast(`Only ${variant.stock_quantity} units available in stock.`, 'error');
      return false;
    }

    setCart((prev) => {
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: requestedQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: variant.id,
          product_id: product.id,
          product,
          variant_id: variant.id,
          variant,
          quantity,
        },
      ];
    });

    showToast(`Added ${product.name} (${variant.color} - ${variant.size}) to cart.`, 'success');
    return true;
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variant_id !== variantId));
    showToast('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    const cartItem = cart.find((i) => i.variant_id === variantId);
    if (!cartItem) return;

    const prod = products.find((p) => p.id === cartItem.product_id);
    const currentVariant = prod?.variants.find((v) => v.id === variantId) || cartItem.variant;

    if (quantity > currentVariant.stock_quantity) {
      showToast(`Maximum available stock is ${currentVariant.stock_quantity}`, 'error');
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.variant_id === variantId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.is_active);

    if (!found) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }

    if (found.usage_limit && found.used_count >= found.usage_limit) {
      return { success: false, message: 'This coupon has reached its usage limit.' };
    }

    if (subtotal < found.minimum_order_amount) {
      return {
        success: false,
        message: `Minimum order amount of ${settings.currency_symbol} ${found.minimum_order_amount.toLocaleString()} required for this coupon.`,
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon ${found.code} applied: ${
        found.discount_type === 'percentage'
          ? `${found.discount_value}% OFF`
          : `${settings.currency_symbol} ${found.discount_value} OFF`
      }!`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  // Wishlist
  const toggleWishlist = async (productId: string) => {
    const exists = wishlist.includes(productId);
    const newWishlist = exists ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
    setWishlist(newWishlist);

    if (exists) {
      showToast('Removed from wishlist.', 'info');
    } else {
      showToast('Saved to your wishlist.', 'success');
    }

    if (currentUser?.id && isSupabaseConfigured) {
      await toggleWishlistInSupabase(currentUser.id, productId, exists);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Orders
  const createOrder = async (orderPayload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    province: string;
    postal_code?: string;
    notes?: string;
  }): Promise<{ success: boolean; order?: Order; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // 1. Strict Server-Side Inventory & Price Validation
    for (const item of cart) {
      const dbProduct = products.find((p) => p.id === item.product_id);
      if (!dbProduct || !dbProduct.is_active) {
        return { success: false, error: `Product "${item.product.name}" is no longer available.` };
      }
      const dbVariant = dbProduct.variants.find((v) => v.id === item.variant_id);
      if (!dbVariant || !dbVariant.is_active) {
        return {
          success: false,
          error: `Variant (${item.variant.color} - ${item.variant.size}) is unavailable.`,
        };
      }
      if (dbVariant.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${dbProduct.name}" (${dbVariant.color} - ${dbVariant.size}). Only ${dbVariant.stock_quantity} left.`,
        };
      }
    }

    // 2. Build secure Order Items with authoritative database pricing
    const orderItems = cart.map((item) => {
      const dbProduct = products.find((p) => p.id === item.product_id)!;
      const dbVariant = dbProduct.variants.find((v) => v.id === item.variant_id)!;
      const unitPrice = dbVariant.sale_price ?? (dbProduct.sale_price ?? dbProduct.base_price);
      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        order_id: '',
        product_id: dbProduct.id,
        variant_id: dbVariant.id,
        product_name: dbProduct.name,
        variant_description: `${dbVariant.color} / ${dbVariant.size}`,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
        image_url: dbProduct.images[0]?.image_url,
      };
    });

    const validatedSubtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);

    let validatedDiscount = 0;
    if (appliedCoupon && validatedSubtotal >= appliedCoupon.minimum_order_amount) {
      if (appliedCoupon.discount_type === 'percentage') {
        validatedDiscount = Math.round((validatedSubtotal * appliedCoupon.discount_value) / 100);
        if (appliedCoupon.maximum_discount && validatedDiscount > appliedCoupon.maximum_discount) {
          validatedDiscount = appliedCoupon.maximum_discount;
        }
      } else {
        validatedDiscount = appliedCoupon.discount_value;
      }
    }

    const validatedShipping = validatedSubtotal >= settings.free_shipping_threshold ? 0 : settings.standard_shipping_fee;
    const validatedTotal = Math.max(0, validatedSubtotal - validatedDiscount + validatedShipping);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VOR-${new Date().getFullYear()}-${randomNum}`;
    const orderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: currentUser?.id,
      customer_name: orderPayload.customer_name,
      customer_email: orderPayload.customer_email,
      customer_phone: orderPayload.customer_phone,
      shipping_address: orderPayload.shipping_address,
      city: orderPayload.city,
      province: orderPayload.province,
      postal_code: orderPayload.postal_code,
      payment_method: 'cod',
      payment_status: 'unpaid',
      order_status: 'pending',
      subtotal: validatedSubtotal,
      discount: validatedDiscount,
      shipping_cost: validatedShipping,
      total: validatedTotal,
      coupon_code: appliedCoupon?.code,
      notes: orderPayload.notes,
      items: orderItems.map((oi) => ({ ...oi, order_id: orderId })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 3. Connect and write to Supabase (Transactional / Database-Safe)
    if (isSupabaseConfigured) {
      const sbResult = await createOrderInSupabase(newOrder, newOrder.items);
      if (!sbResult.success) {
        return { success: false, error: sbResult.error || 'Failed to persist order in Supabase.' };
      }
      if (sbResult.orderId) {
        newOrder.id = sbResult.orderId;
      }
    }

    // 4. Update local state and decrement inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const itemsForProd = cart.filter((c) => c.product_id === prod.id);
        if (itemsForProd.length === 0) return prod;

        return {
          ...prod,
          variants: prod.variants.map((variant) => {
            const boughtItem = itemsForProd.find((c) => c.variant_id === variant.id);
            if (!boughtItem) return variant;
            return {
              ...variant,
              stock_quantity: Math.max(0, variant.stock_quantity - boughtItem.quantity),
            };
          }),
        };
      })
    );

    // 5. Update coupon usage
    if (appliedCoupon) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === appliedCoupon.id ? { ...c, used_count: c.used_count + 1 } : c))
      );
    }

    // 6. Append order to state and clear cart
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, order_status: status, updated_at: new Date().toISOString() } : ord))
    );
    if (isSupabaseConfigured) {
      await updateOrderStatusInSupabase(orderId, status);
    }
    AdminAuthService.logAction('ORDER_STATUS_CHANGED', 'ORDER', { orderId, status });
    showToast(`Order status updated to ${status.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const getOrderById = (orderId: string) => orders.find((o) => o.id === orderId);
  const getOrderByNumber = (orderNumber: string) => orders.find((o) => o.order_number === orderNumber);

  // Admin Actions for Products
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    let createdProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const sbProd = await createProductInSupabase(productData);
      if (sbProd) {
        createdProd = sbProd;
      }
    }

    setProducts((prev) => [createdProd, ...prev]);
    AdminAuthService.logAction('PRODUCT_CREATED', 'PRODUCT', { name: createdProd.name, sku: createdProd.sku, price: createdProd.base_price });
    showToast(`Product "${createdProd.name}" created successfully.`, 'success');
    return createdProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id ? { ...prod, ...updates, updated_at: new Date().toISOString() } : prod
      )
    );

    if (isSupabaseConfigured) {
      await updateProductInSupabase(id, updates);
    }

    AdminAuthService.logAction('PRODUCT_UPDATED', 'PRODUCT', { productId: id, updates });
    showToast('Product updated successfully.', 'success');
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured) {
      await deleteProductInSupabase(id);
    }
    AdminAuthService.logAction('PRODUCT_DELETED', 'PRODUCT', { productId: id });
    showToast('Product deleted.', 'info');
  };

  const updateVariantStock = async (productId: string, variantId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          variants: prod.variants.map((v) =>
            v.id === variantId ? { ...v, stock_quantity: Math.max(0, newStock) } : v
          ),
          updated_at: new Date().toISOString(),
        };
      })
    );

    if (isSupabaseConfigured) {
      await updateVariantStockInSupabase(variantId, newStock);
    }

    AdminAuthService.logAction('STOCK_CHANGED', 'INVENTORY', { productId, variantId, newStock });
    showToast('Inventory stock updated.', 'success');
  };

  // Categories
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    let newCat: Category = {
      ...catData,
      id: `c-${Date.now()}`,
    };

    if (isSupabaseConfigured) {
      const sbCat = await createCategoryInSupabase(catData);
      if (sbCat) {
        newCat = sbCat;
      }
    }

    setCategories((prev) => [...prev, newCat]);
    AdminAuthService.logAction('CATEGORY_CREATED', 'CATEGORY', { name: newCat.name });
    showToast(`Category "${newCat.name}" added.`, 'success');
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (isSupabaseConfigured) {
      await updateCategoryInSupabase(id, updates);
    }
    AdminAuthService.logAction('CATEGORY_UPDATED', 'CATEGORY', { categoryId: id });
    showToast('Category updated.', 'success');
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured) {
      await deleteCategoryInSupabase(id);
    }
    AdminAuthService.logAction('CATEGORY_DELETED', 'CATEGORY', { categoryId: id });
    showToast('Category removed.', 'info');
  };

  // Reviews
  const submitReview = async (productId: string, customerName: string, rating: number, text: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      product_id: productId,
      user_id: currentUser?.id || 'guest',
      customer_name: customerName,
      rating,
      review_text: text,
      is_approved: false, // requires admin approval
      created_at: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    if (isSupabaseConfigured) {
      await submitReviewToSupabase({
        product_id: productId,
        user_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        customer_name: customerName,
        rating,
        review_text: text,
        is_approved: false,
      });
    }

    showToast('Thank you! Your review has been submitted for approval.', 'success');
  };

  const approveReview = async (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r)));
    if (isSupabaseConfigured) {
      await approveReviewInSupabase(id);
    }
    AdminAuthService.logAction('REVIEW_APPROVED', 'REVIEW', { reviewId: id });
    showToast('Review approved and published.', 'success');
  };

  const deleteReview = async (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseConfigured) {
      await deleteReviewInSupabase(id);
    }
    AdminAuthService.logAction('REVIEW_DELETED', 'REVIEW', { reviewId: id });
    showToast('Review deleted.', 'info');
  };

  // Coupons
  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'used_count'>): Promise<Coupon> => {
    let newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      used_count: 0,
    };

    if (isSupabaseConfigured) {
      const sbCoupon = await createCouponInSupabase(couponData);
      if (sbCoupon) {
        newCoupon = sbCoupon;
      }
    }

    setCoupons((prev) => [newCoupon, ...prev]);
    AdminAuthService.logAction('COUPON_CREATED', 'COUPON', { code: newCoupon.code, discount: newCoupon.discount_value });
    showToast(`Coupon ${newCoupon.code} created.`, 'success');
    return newCoupon;
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (isSupabaseConfigured) {
      await updateCouponInSupabase(id, updates);
    }
    AdminAuthService.logAction('COUPON_UPDATED', 'COUPON', { couponId: id });
    showToast('Coupon updated.', 'success');
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured) {
      await deleteCouponInSupabase(id);
    }
    AdminAuthService.logAction('COUPON_DELETED', 'COUPON', { couponId: id });
    showToast('Coupon deleted.', 'info');
  };

  // Banners & Settings
  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    if (isSupabaseConfigured) {
      await updateBannerInSupabase(id, updates);
    }
    AdminAuthService.logAction('BANNER_UPDATED', 'BANNER', { bannerId: id, updates });
    showToast('Hero banner updated successfully.', 'success');
  };

  const addBanner = async (bannerPayload: Omit<Banner, 'id'>): Promise<Banner> => {
    const newBanner: Banner = {
      ...bannerPayload,
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    if (bannerPayload.is_active) {
      setBanners((prev) => [newBanner, ...prev.map((b) => ({ ...b, is_active: false }))]);
    } else {
      setBanners((prev) => [newBanner, ...prev]);
    }

    if (isSupabaseConfigured) {
      const created = await createBannerInSupabase(bannerPayload);
      if (created) {
        newBanner.id = created.id;
      }
    }

    AdminAuthService.logAction('BANNER_CREATED', 'BANNER', { title: newBanner.title });
    showToast('New hero banner created.', 'success');
    return newBanner;
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    if (isSupabaseConfigured) {
      await deleteBannerInSupabase(id);
    }
    AdminAuthService.logAction('BANNER_DELETED', 'BANNER', { bannerId: id });
    showToast('Hero banner deleted.', 'info');
  };

  const setActiveHeroBanner = async (id: string) => {
    setBanners((prev) =>
      prev.map((b) => ({
        ...b,
        is_active: b.id === id,
      }))
    );

    if (isSupabaseConfigured) {
      // Update the activated banner and deactivate others
      await updateBannerInSupabase(id, { is_active: true });
      const others = banners.filter((b) => b.id !== id);
      for (const other of others) {
        if (other.is_active) {
          await updateBannerInSupabase(other.id, { is_active: false });
        }
      }
    }

    AdminAuthService.logAction('BANNER_ACTIVATED', 'BANNER', { activeBannerId: id });
    showToast('Active homepage hero banner updated.', 'success');
  };

  const updateSettings = async (updates: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    if (isSupabaseConfigured) {
      await updateSiteSettingsInSupabase(updates);
    }
    AdminAuthService.logAction('SETTINGS_CHANGED', 'SETTINGS', updates);
    showToast('Site settings updated.', 'success');
  };

  // Customer Profile & Address Management
  const updateProfile = async (updates: { full_name?: string; phone?: string }): Promise<boolean> => {
    if (!currentUser) return false;
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));

    if (isSupabaseConfigured && currentUser.id) {
      await updateCustomerProfileInSupabase(currentUser.id, updates);
    }

    showToast('Profile information updated.', 'success');
    return true;
  };

  const addAddress = async (addrData: Omit<Address, 'id' | 'user_id'>): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please sign in to save shipping addresses.', 'error');
      return false;
    }

    const payload: Omit<Address, 'id'> = {
      ...addrData,
      user_id: currentUser.id,
    };

    let newAddress: Address = {
      ...payload,
      id: `addr-${Date.now()}`,
    };

    if (isSupabaseConfigured) {
      const saved = await saveCustomerAddressInSupabase(payload);
      if (saved) {
        newAddress = saved;
      }
    }

    setAddresses((prev) => [newAddress, ...prev]);
    showToast('Shipping address saved.', 'success');
    return true;
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (isSupabaseConfigured) {
      await deleteCustomerAddressInSupabase(id);
    }
    showToast('Address removed.', 'info');
    return true;
  };

  // Auth - Regular Storefront Login / Register (Customer Only, Supabase Auth Integration)
  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const res = await loginCustomerWithSupabase(email, pass);
    if (!res.success || !res.user) {
      return { success: false, message: res.error || 'Invalid credentials' };
    }

    setCurrentUser(res.user);

    // Fetch customer data
    if (isSupabaseConfigured) {
      const [userWishlist, userOrders, userAddresses] = await Promise.all([
        fetchWishlistFromSupabase(res.user.id),
        fetchCustomerOrdersFromSupabase(res.user.id, res.user.email),
        fetchCustomerAddressesFromSupabase(res.user.id),
      ]);
      if (userWishlist) setWishlist(userWishlist);
      if (userOrders && userOrders.length > 0) setOrders(userOrders);
      if (userAddresses) setAddresses(userAddresses);
    }

    showToast(`Signed in as ${res.user.email}`, 'success');
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await registerCustomerWithSupabase(name, email, pass, phone);
    if (!res.success || !res.user) {
      return { success: false, message: res.error || 'Registration failed' };
    }

    setCurrentUser(res.user);
    showToast(`Account created. Welcome to The Vortex Wear, ${name}!`, 'success');
    return { success: true };
  };

  const logout = async () => {
    await logoutCustomerFromSupabase();
    setCurrentUser(null);
    setAddresses([]);
    showToast('Signed out successfully.', 'info');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const res = await resetCustomerPasswordWithSupabase(email);
    if (!res.success) {
      return { success: false, message: res.error || 'Password reset request failed' };
    }
    return { success: true, message: `Password reset instructions sent to ${email}` };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        coupons,
        reviews,
        settings,
        orders,
        cart,
        wishlist,
        addresses,
        appliedCoupon,
        currentUser,
        toasts,
        isLoading,
        showToast,
        removeToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getOrderByNumber,
        addProduct,
        updateProduct,
        deleteProduct,
        updateVariantStock,
        addCategory,
        updateCategory,
        deleteCategory,
        submitReview,
        approveReview,
        deleteReview,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateBanner,
        addBanner,
        deleteBanner,
        setActiveHeroBanner,
        updateSettings,
        updateProfile,
        addAddress,
        deleteAddress,
        login,
        register,
        logout,
        resetPassword,
        refreshCatalog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
