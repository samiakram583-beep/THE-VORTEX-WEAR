import heroVortexFashion from './hero_vortex_fashion_1790956344973.jpg';
import categoryShirtsVortex from './category_shirts_vortex_1790956364111.jpg';
import categoryPantsVortex from './category_pants_vortex_1790956382275.jpg';
import productBlackShirtVortex from './product_black_shirt_vortex_1790956397815.jpg';
import productCargoPantsVortex from './product_cargo_pants_vortex_1790956411636.jpg';

export {
  heroVortexFashion,
  categoryShirtsVortex,
  categoryPantsVortex,
  productBlackShirtVortex,
  productCargoPantsVortex,
};

/**
 * Resolves local image paths or fallback strings to Vite-processed asset URLs.
 * Real Supabase Storage URLs, external URLs, and blob/data URIs are left untouched.
 */
export function resolveImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url) return fallback || heroVortexFashion;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (url.includes('hero_vortex_fashion')) return heroVortexFashion;
  if (url.includes('category_shirts_vortex')) return categoryShirtsVortex;
  if (url.includes('category_pants_vortex')) return categoryPantsVortex;
  if (url.includes('product_black_shirt_vortex')) return productBlackShirtVortex;
  if (url.includes('product_cargo_pants_vortex')) return productCargoPantsVortex;
  return fallback || url;
}
