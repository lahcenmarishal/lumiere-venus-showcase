import { useSyncExternalStore } from 'react';
import type { CartItem, Product, Size } from '@/data/catalog';

type Addition = { product: Product; size: Size; id: number };
type State = { cart: CartItem[]; cartOpen: boolean; addition: Addition | null };
let state: State = { cart: [], cartOpen: false, addition: null };
const listeners = new Set<() => void>();
const serverState: State = { cart: [], cartOpen: false, addition: null };
export function setCartState(patch: Partial<State>) { state = { ...state, ...patch }; listeners.forEach(l => l()); }
export function addToCart(product: Product, size: Size) {
  if (!product.available || !product.sizes.includes(size)) return false;
  const existing = state.cart.find(i => i.productId === product.id && i.size === size);
  if (existing && existing.quantity >= 10) return false;
  const cart = existing
    ? state.cart.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i)
    : [...state.cart, { productId: product.id, size, quantity: 1 }];
  setCartState({ cart, addition: { product, size, id: (state.addition?.id ?? 0) + 1 } });
  return true;
}
export function useCartState() {
  return useSyncExternalStore(l => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => serverState);
}
