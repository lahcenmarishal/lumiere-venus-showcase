import { createFileRoute } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { getSiteData } from '@/lib/site.functions';
import { SiteShell, PageHero } from '@/components/boutique/site-shell';
import { ProductCatalog } from '@/components/boutique/catalog';

export const Route = createFileRoute('/boutique')({
  head: () => ({ meta: [
    { title: 'Boutique — Tous les bijoux | JAMILA JEWELRY' },
    { name: 'description', content: 'Le catalogue complet JAMILA JEWELRY : bagues, colliers, bracelets et boucles d’oreilles. Filtres par catégorie, prix et style.' },
    { property: 'og:title', content: 'La boutique JAMILA JEWELRY' },
    { property: 'og:description', content: 'Tous nos bijoux, livrés partout au Maroc.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  loader: async () => { const [products, site] = await Promise.all([listProducts(), getSiteData()]); return { products, site }; },
  component: Shop,
});

function Shop() {
  const { products, site } = Route.useLoaderData();
  return <SiteShell products={products}>
    <PageHero eyebrow="LA BOUTIQUE" title="Tous nos bijoux" intro="Le catalogue complet de la maison, à filtrer selon vos envies."/>
    <section className="collection site-width"><ProductCatalog products={products} categories={site.categories.map(c => c.name)}/></section>
  </SiteShell>;
}
