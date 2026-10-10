import type { ReactNode } from 'react';
import type { Product } from '@/data/catalog';
import { SiteShell, PageHero } from '@/components/boutique/site-shell';

/** Layout for informational/policy pages: hero + readable text column. */
export function InfoPage({ products, eyebrow, title, intro, children }: { products: Product[]; eyebrow: string; title: string; intro?: string; children: ReactNode }) {
  return <SiteShell products={products}>
    <PageHero eyebrow={eyebrow} title={title} intro={intro}/>
    <article className="site-width info-body">{children}</article>
  </SiteShell>;
}

export const metaFor = (title: string, description: string) => ({ meta: [
  { title: `${title} — JAMILA JEWELRY` }, { name: 'description', content: description },
  { property: 'og:title', content: `${title} — JAMILA JEWELRY` }, { property: 'og:description', content: description },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
] });
