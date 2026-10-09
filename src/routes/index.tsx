import { createFileRoute } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { Storefront } from '@/components/boutique/storefront';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'JAMILA JEWELRY — Bijoux de luxe au Maroc' },
    { name: 'description', content: 'Découvrez la collection JAMILA JEWELRY : bagues, colliers et boucles d’oreilles, un univers précieux et raffiné. Livraison au Maroc.' },
    { property: 'og:title', content: 'JAMILA JEWELRY — L’éclat qui vous ressemble' },
    { property: 'og:description', content: 'Des bijoux aux lignes délicates, un éclat intemporel et une élégance singulière. Livraison au Maroc.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  loader: () => listProducts(),
  errorComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>La sélection est momentanément indisponible. Veuillez réessayer.</p>,
  notFoundComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>Page introuvable.</p>,
  component: Index,
});

function Index() {
  return <Storefront products={Route.useLoaderData()} />;
}
