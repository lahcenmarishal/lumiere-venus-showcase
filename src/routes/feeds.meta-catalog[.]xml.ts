import { createFileRoute } from '@tanstack/react-router';
import { publicClient } from '@/lib/public-client.server';
import { rowToProduct } from '@/lib/products';
import { boutique, type Product } from '@/data/catalog';

// Meta Commerce Manager product feed (RSS 2.0 + g: namespace). Read live from the products table.
const SITE = 'https://www.jamila-jewelry.com';

const esc = (v: string) => v
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const abs = (u: string) => /^https?:\/\//i.test(u) ? u : `${SITE}${u.startsWith('/') ? '' : '/'}${encodeURI(u)}`;
const mad = (n: number) => `${n.toFixed(2)} MAD`;
const tag = (name: string, value: string) => `      <g:${name}>${esc(value)}</g:${name}>`;

function item(p: Product) {
  const desc = [p.description, p.detail].filter(Boolean).join(' — ') || p.name;
  const images = p.images.filter(Boolean);
  const lines = [
    tag('id', p.id),
    tag('title', p.name.slice(0, 150)),
    tag('description', desc.slice(0, 9999)),
    tag('availability', p.available ? 'in stock' : 'out of stock'),
    tag('condition', 'new'),
    tag('price', mad(p.price)),
    ...(p.salePrice != null && p.salePrice < p.price ? [tag('sale_price', mad(p.salePrice))] : []),
    tag('link', `${SITE}/produit/${encodeURIComponent(p.id)}`),
    tag('image_link', abs(images[0] ?? '')),
    ...images.slice(1, 11).map(i => tag('additional_image_link', abs(i))),
    tag('brand', 'JAMILA JEWELRY'),
    tag('mpn', p.sku || p.id),
    tag('product_type', p.category),
    ...(p.material ? [tag('material', p.material)] : []),
    tag('google_product_category', '188'),
  ];
  return `    <item>\n${lines.join('\n')}\n    </item>`;
}

export const Route = createFileRoute('/feeds/meta-catalog.xml')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await publicClient().from('products').select('*').eq('active', true).order('sort_order').order('created_at');
          if (error) throw error;
          const products = (data ?? []).map(rowToProduct).filter(p => p.images.some(Boolean) && p.price > 0);
          const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(boutique.name)}</title>
    <link>${SITE}</link>
    <description>Catalogue produits ${esc(boutique.name)}</description>
${products.map(item).join('\n')}
  </channel>
</rss>`;
          return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=300' } });
        } catch (e) {
          console.error('meta feed error', e);
          return new Response('<?xml version="1.0" encoding="UTF-8"?><error>Flux momentanément indisponible</error>', { status: 503, headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '300' } });
        }
      },
    },
  },
});
