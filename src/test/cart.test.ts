import { beforeEach, describe, expect, it } from 'vitest';
import { addToCart, setCartState } from '@/lib/cart-store';
import type { Product } from '@/data/catalog';

const product: Product = { id: 'test', sku: 'TEST', name: 'Test', category: 'Bracelets', price: 99, salePrice: null, description: '', detail: '', material: '', cut: '', images: [], color: '', colorToken: 'noire', sizes: ['Unique'], available: true, active: true, label: '', featured: false, featuredOrder: 0, sortOrder: 0 };

describe('Ajout au panier depuis le catalogue', () => {
  beforeEach(() => setCartState({ cart: [], cartOpen: false, addition: null }));
  it('accepte la dimension proposée du produit', () => {
    expect(addToCart(product, 'Unique')).toBe(true);
  });
  it('refuse une dimension absente du produit', () => {
    expect(addToCart(product, '52')).toBe(false);
  });
  it('refuse un produit indisponible', () => {
    expect(addToCart({ ...product, available: false }, 'Unique')).toBe(false);
  });
  it('préserve la limite existante de dix exemplaires', () => {
    for (let i = 0; i < 10; i++) expect(addToCart(product, 'Unique')).toBe(true);
    expect(addToCart(product, 'Unique')).toBe(false);
  });
});
