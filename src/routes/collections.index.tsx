import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { listProducts } from '@/lib/products.functions';
import { getSiteData } from '@/lib/site.functions';
import { SiteShell, PageHero } from '@/components/boutique/site-shell';

export const Route = createFileRoute('/collections/')({
  head: () => ({ meta: [
    { title: 'Collections — Bagues, colliers, bracelets | JAMILA JEWELRY' },
    { name: 'description', content: 'Explorez les collections JAMILA JEWELRY : bagues, colliers, bracelets et boucles d’oreilles.' },
    { property: 'og:title', content: 'Les collections JAMILA JEWELRY' },
    { property: 'og:description', content: 'Une collection pour chaque style.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  loader: async () => { const [products, site] = await Promise.all([listProducts(), getSiteData()]); return { products, site }; },
  component: Collections,
});

function Collections() {
  const { products, site } = Route.useLoaderData();
  return <SiteShell products={products}>
    <PageHero eyebrow="NOS COLLECTIONS" title="Une collection pour chaque style" intro="Choisissez votre univers et découvrez les pièces qui le composent."/>
    <section className="site-width collections-list">{site.categories.map((cat, i) => {
      const n = products.filter(p => p.category === cat.name).length;
      return <Link key={cat.slug} to="/collections/$slug" params={{ slug: cat.slug }} className={`collection-row ${i % 2 ? 'reverse' : ''}`}>
        <img src={cat.image} alt={cat.name} loading="lazy"/>
        <div><span className="eyebrow">{String(i + 1).padStart(2, '0')} · {n} pièce{n > 1 ? 's' : ''}</span><h2>{cat.name}</h2><p>{cat.intro}</p><span className="collection-cta">DÉCOUVRIR LA COLLECTION <ArrowUpRight size={14}/></span></div>
      </Link>;
    })}</section>
  </SiteShell>;
}
