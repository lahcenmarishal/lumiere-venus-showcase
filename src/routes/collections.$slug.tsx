import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { getSiteData } from '@/lib/site.functions';
import { SiteShell, PageHero } from '@/components/boutique/site-shell';
import { ProductCatalog } from '@/components/boutique/catalog';

export const Route = createFileRoute('/collections/$slug')({
  loader: async ({ params }) => {
    const [products, site] = await Promise.all([listProducts(), getSiteData()]);
    const category = site.categories.find(c => c.slug === params.slug);
    if (!category) throw notFound();
    return { products, category, others: site.categories.filter(c => c.slug !== params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: 'Collection introuvable — JAMILA JEWELRY' }, { name: 'robots', content: 'noindex' }] };
    const t = `${loaderData.category.name} — Collection JAMILA JEWELRY`;
    return { meta: [{ title: t }, { name: 'description', content: loaderData.category.intro }, { property: 'og:title', content: t }, { property: 'og:description', content: loaderData.category.intro }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
  },
  notFoundComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>Cette collection n’existe pas. <Link to="/collections">Voir les collections</Link></p>,
  component: CollectionPage,
});

function CollectionPage() {
  const { products, category, others } = Route.useLoaderData();
  const items = products.filter(p => p.category === category.name);
  return <SiteShell products={products}>
    <PageHero eyebrow="COLLECTION" title={category.name} intro={category.intro} image={category.image}/>
    <section className="collection site-width"><ProductCatalog key={category.slug} products={items}/>
      <div className="other-collections"><span className="eyebrow">AUTRES COLLECTIONS</span>{others.map(o => <Link key={o.slug} to="/collections/$slug" params={{ slug: o.slug }}>{o.name}</Link>)}</div>
    </section>
  </SiteShell>;
}
