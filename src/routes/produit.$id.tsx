import { createFileRoute, notFound } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { Storefront } from '@/components/boutique/storefront';

export const Route = createFileRoute('/produit/$id')({
  loader: async ({ params }) => {
    const products = await listProducts();
    const product = products.find(p => p.id === params.id);
    if (!product) throw notFound();
    return { products, product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — JAMILA JEWELRY` : 'Pièce — JAMILA JEWELRY';
    const desc = p ? `${p.name} : ${p.description}. Collection de bijoux JAMILA JEWELRY, livraison au Maroc.` : 'Un bijou de la collection JAMILA JEWELRY.';
    return { meta: [
      { title }, { name: 'description', content: desc },
      { property: 'og:title', content: title }, { property: 'og:description', content: desc },
      { property: 'og:type', content: 'product' }, { name: 'twitter:card', content: 'summary_large_image' },
    ] };
  },
  errorComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>Cette pièce est momentanément indisponible.</p>,
  notFoundComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>Cette pièce n’existe pas ou n’est plus disponible. <a href="/">Voir la sélection</a></p>,
  component: ProductPage,
});

function ProductPage() {
  const { products, product } = Route.useLoaderData();
  return <Storefront products={products} productId={product.id} />;
}
