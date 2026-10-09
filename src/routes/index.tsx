import { createFileRoute } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { Storefront } from '@/components/boutique/storefront';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'LUMIERE VENUS — Sélection premium de pièces féminines au Maroc' },
    { name: 'description', content: 'Découvrez la sélection exclusive LUMIERE VENUS : pièces féminines soigneusement choisies, élégance et packaging premium. Livraison au Maroc.' },
    { property: 'og:title', content: 'LUMIERE VENUS — L’élégance qui vous ressemble' },
    { property: 'og:description', content: 'Des pièces féminines soigneusement choisies pour leur élégance et leur caractère, avec un packaging premium. Livraison au Maroc.' },
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
