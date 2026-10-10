import type { Database } from '@/integrations/supabase/types';
import { sizes, type Product, type Size } from '@/data/catalog';

export type ProductRow = Database['public']['Tables']['products']['Row'];

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id, sku: r.sku, name: r.name, category: r.category, price: Number(r.price),
    salePrice: r.sale_price == null ? null : Number(r.sale_price),
    description: r.description, detail: r.detail, material: r.material, cut: r.cut,
    images: r.images, color: r.color, colorToken: r.color_token,
    sizes: r.sizes.filter((s): s is Size => (sizes as readonly string[]).includes(s)),
    available: r.available, active: r.active, label: r.label, featured: r.featured, featuredOrder: r.featured_order, sortOrder: r.sort_order,
  };
}
