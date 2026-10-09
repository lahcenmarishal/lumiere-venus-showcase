import { useSyncExternalStore } from 'react';
import type { CartItem } from '@/data/catalog';

type State = { cart: CartItem[]; cartOpen: boolean };
let state: State = { cart: [], cartOpen: false };
const listeners = new Set<() => void>();
const serverState: State = { cart: [], cartOpen: false };
export function setCartState(patch: Partial<State>) { state = { ...state, ...patch }; listeners.forEach(l => l()); }
export function useCartState() {
  return useSyncExternalStore(l => { listeners.add(l); return () => listeners.delete(l); }, () => state, () => serverState);
}
