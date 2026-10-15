import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { unitPrice, sizes } from '@/data/catalog';
import { publicClient } from './public-client.server';
import { rowToProduct } from './products';

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^(?:\+212|0)[5-7][0-9]{8}$/),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(400),
  items: z.array(z.object({ productId: z.string().max(100), size: z.enum(sizes), quantity: z.number().int().min(1).max(10) })).min(1).max(20),
});

export const submitOrder = createServerFn({ method: 'POST' })
  .validator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const client = publicClient();
    const ids = [...new Set(data.items.map(i => i.productId))];
    const { data: rows, error: pErr } = await client.from('products').select('*').in('id', ids).eq('active', true);
    if (pErr) throw new Error('Les commandes sont momentanément indisponibles.');
    const catalog = new Map((rows ?? []).map(r => [r.id, rowToProduct(r)]));
    const items = data.items.map(item => {
      const p = catalog.get(item.productId);
      if (!p || !p.available || !p.sizes.includes(item.size)) throw new Error('Ce modèle ou cette taille n’est pas disponible.');
      return { productId: p.id, sku: p.sku, name: p.name, size: item.size, quantity: item.quantity, price: unitPrice(p), image: p.images[0] ?? '' };
    });
    const id = crypto.randomUUID();
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { error } = await client.from('orders').insert({ id, customer_name: data.customerName, phone: data.phone, city: data.city, address: data.address, items, total });
    if (error) throw new Error('Votre demande n’a pas pu être enregistrée. Veuillez réessayer.');
    return { reference: id.slice(0, 8).toUpperCase(), total };
  });
