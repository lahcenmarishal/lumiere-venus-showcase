import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CartNotification } from '@/components/boutique/cart-notification';
import { addToCart, setCartState } from '@/lib/cart-store';
import type { Product } from '@/data/catalog';

vi.mock('@/components/boutique/quick-order-form', () => ({ QuickOrderForm: () => null }));
const product: Product = { id: 'test', sku: 'TEST', name: 'Test', category: 'Bagues', price: 79, salePrice: null, description: '', detail: '', material: '', cut: '', images: ['/bijoux/bagues/01.jpg'], color: '', colorToken: 'noire', sizes: ['Unique'], available: true, active: true, label: '', featured: false, featuredOrder: 0, sortOrder: 0 };

beforeEach(() => { vi.useFakeTimers(); setCartState({ cart: [], cartOpen: false, addition: null }); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

it('reste ouverte après sept secondes et attend la fermeture du visiteur', () => {
  addToCart(product, 'Unique');
  render(<CartNotification products={[product]}/>);
  act(() => { vi.advanceTimersByTime(7000); });
  expect(screen.getByRole('complementary')).toBeInTheDocument();
  act(() => { vi.advanceTimersByTime(60000); });
  expect(screen.getByRole('complementary')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Fermer la notification' }));
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
});
