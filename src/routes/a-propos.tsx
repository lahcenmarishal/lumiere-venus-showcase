import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Diamond, Feather, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/lib/products.functions';
import { getSiteData } from '@/lib/site.functions';
import { SiteShell } from '@/components/boutique/site-shell';
import { metaFor } from '@/components/boutique/info-page';
import editorial from '@/assets/jamila-editorial.jpg';
import necklace from '@/assets/jamila-necklace.jpg';

export const Route = createFileRoute('/a-propos')({
  head: () => metaFor('À propos', 'L’histoire de JAMILA JEWELRY depuis 2023 : vision, valeurs et engagement envers nos clientes.'),
  loader: async () => { const [products, site] = await Promise.all([listProducts(), getSiteData()]); return { products, site }; },
  component: About,
});

function About() {
  const { products, site } = Route.useLoaderData();
  const c = site.content;
  return <SiteShell products={products}>
    <section className="about-hero"><img src={editorial} alt="L’univers JAMILA JEWELRY"/><div className="site-width about-hero-content"><span className="eyebrow">DEPUIS {c.brand_since || '2023'}</span><h1>L’histoire<br/><em>JAMILA JEWELRY</em></h1></div></section>
    <section className="site-width about-story"><div><span className="eyebrow">NOTRE HISTOIRE</span><h2>Une passion devenue maison</h2><p>{c.about_story}</p></div><img src={necklace} alt="Collier doré JAMILA JEWELRY" loading="lazy"/></section>
    <section className="about-vision"><div className="site-width"><span className="eyebrow">NOTRE VISION</span><blockquote>« {c.about_vision} »</blockquote></div></section>
    <section className="site-width about-values">
      {[{ Icon: Diamond, t: 'Sélection exigeante', d: 'Chaque pièce est choisie pour sa finition, sa tenue et son allure.' }, { Icon: Feather, t: 'Élégance accessible', d: 'Des bijoux raffinés en acier inoxydable, à des prix justes.' }, { Icon: Heart, t: 'Vous accompagner', d: `Plus de ${(c.brand_clients || '100').replace('+', '')} clientes nous font confiance, conseillées avec attention.` }].map(({ Icon, t, d }) => <div key={t}><Icon/><h3>{t}</h3><p>{d}</p></div>)}
    </section>
    <section className="site-width about-cta"><h2>Trouvez la pièce qui vous ressemble</h2><Button variant="couture" asChild><Link to="/boutique">DÉCOUVRIR LA BOUTIQUE <ArrowUpRight size={14}/></Link></Button></section>
  </SiteShell>;
}
