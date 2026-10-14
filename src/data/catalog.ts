export const boutique = { name: 'JAMILA JEWELRY', whatsapp: '212717055482', instagram: '', pricesProvisional: true };
export const sizes = ['S', 'M', 'L', 'XL', '50', '52', '54', '56', '58', 'Unique', 'Ajustable'] as const;
export type Size = typeof sizes[number];
export type Product = { id: string; sku: string; name: string; category: string; price: number; salePrice: number | null; description: string; detail: string; material: string; cut: string; images: string[]; color: string; colorToken: string; sizes: readonly Size[]; available: boolean; active: boolean; label: string; featured: boolean; featuredOrder: number; sortOrder: number };
export const money = (amount: number) => `${new Intl.NumberFormat('fr-MA').format(amount)} DH`;
export type CartItem = { productId: string; size: Size; quantity: number };
export const unitPrice = (p: Product) => p.salePrice ?? p.price;
