import { createServerFn } from '@tanstack/react-start';
import { publicClient } from './public-client.server';
import { rowToProduct } from './products';
import { cached } from './server-cache';

export const listProducts = createServerFn({ method: 'GET' }).handler(() => cached('products', 60_000, async () => {
  const { data, error } = await publicClient().from('products').select('*').eq('active', true).order('sort_order').order('created_at');
  if (error) throw new Error('Impossible de charger la sélection.');
  return (data ?? []).map(rowToProduct);
}));
