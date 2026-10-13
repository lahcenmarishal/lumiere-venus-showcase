import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Sparkles, Truck, CreditCard, RotateCcw, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/lib/products.functions';
import { getSiteData } from '@/lib/site.functions';
import { SiteShell } from '@/components/boutique/site-shell';
import { FeaturedCarousel } from '@/components/boutique/featured-carousel';
import { TestimonialGallery } from '@/components/boutique/testimonials';
import hero from '@/assets/jamila-editorial.jpg';
import heroMobile from '@/assets/jamila-hero-mobile.jpg';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'JAMILA JEWELRY — Bijoux de luxe · Livraison partout au Maroc' },
    { name: 'description', content: 'Découvrez les bagues, colliers, bracelets et boucles d’oreilles JAMILA JEWELRY en acier inoxydable à 79 DH. Livraison partout au Maroc, paiement à la livraison.' },
    { property: 'og:title', content: 'JAMILA JEWELRY — Bijoux de luxe · Livraison partout au Maroc' },
    { property: 'og:description', content: 'Bagues, colliers, bracelets et boucles d’oreilles en acier inoxydable à 79 DH. Livraison partout au Maroc, paiement à la livraison.' },
    { property: 'og:site_name', content: 'JAMILA JEWELRY' },
    { property: 'og:locale', content: 'fr_MA' },
    { property: 'og:url', content: 'https://www.jamila-jewelry.com/' },
    { property: 'og:image', content: 'https://www.jamila-jewelry.com/images/jamila-jewelry-share.jpg' },
    { property: 'og:image:secure_url', content: 'https://www.jamila-jewelry.com/images/jamila-jewelry-share.jpg' },
    { property: 'og:image:type', content: 'image/jpeg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'Logo doré JAMILA JEWELRY sur fond noir' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'JAMILA JEWELRY — Bijoux de luxe · Livraison partout au Maroc' },
    { name: 'twitter:description', content: 'Bijoux en acier inoxydable à 79 DH. Livraison partout au Maroc, paiement à la livraison.' },
    { name: 'twitter:image', content: 'https://www.jamila-jewelry.com/images/jamila-jewelry-share.jpg' },
    { name: 'twitter:image:alt', content: 'Logo doré JAMILA JEWELRY sur fond noir' },
  ], links: [{ rel: 'canonical', href: 'https://www.jamila-jewelry.com/' }] }),
  loader: async () => { const [products, site] = await Promise.all([listProducts(), getSiteData()]); return { products, site }; },
  errorComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>Le site est momentanément indisponible. Veuillez réessayer.</p>,
  component: Home,
});

function Home() {
  const { products, site } = Route.useLoaderData();
  const featured = products.filter(p => p.featured).sort((a, b) => a.featuredOrder - b.featuredOrder).slice(0, 8);
  const c = site.content;
  return <SiteShell products={products} overlay>
    <section className="hero" id="accueil"><img className="hero-image" src={hero} width={1920} height={1088} alt="Bijoux lumineux portés dans un palais marocain" fetchPriority="high"/><img className="hero-image-mobile" src={heroMobile} width={1024} height={1280} alt="L’univers précieux de JAMILA JEWELRY" fetchPriority="high"/>
      <div className="site-width hero-content"><div className="eyebrow hero-eyebrow">L’ART DU PRÉCIEUX</div><h1>JAMILA JEWELRY</h1><div className="hero-title">L’éclat<br/>qui vous <em>ressemble.</em></div><p className="hero-description">Découvrez un univers de bijoux élégants, de lignes délicates et d’éclats précieux, pour sublimer les moments qui vous appartiennent.</p>
        <div className="hero-actions"><Button variant="hero" asChild><Link to="/collections">DÉCOUVRIR LES COLLECTIONS <ArrowUpRight/></Link></Button><Button variant="heroOutline" asChild><Link to="/boutique">COMMANDER MAINTENANT</Link></Button></div>
        <p className="hero-note"><Sparkles size={12}/> Bijoux de caractère · Élégance intemporelle</p></div></section>

    {site.categories.length > 0 && <section className="home-collections site-width">
      <div className="section-head"><span className="eyebrow">NOS COLLECTIONS</span><h2>Trouvez votre éclat</h2></div>
      <div className="collections-grid">{site.categories.map(cat => <Link key={cat.slug} to="/collections/$slug" params={{ slug: cat.slug }} className="category-card">
        <img src={cat.image} alt={cat.name} loading="lazy"/><div className="category-card-text"><h3>{cat.name}</h3><span>DÉCOUVRIR <ArrowUpRight size={12}/></span></div></Link>)}</div>
    </section>}

    {featured.length > 0 && <section className="collection site-width">
      <div className="section-top"><div><span className="eyebrow">NOTRE SÉLECTION</span><h2>Nos coups de cœur</h2><p>Une sélection de pièces choisies par la maison.</p></div><Button variant="coutureOutline" asChild><Link to="/boutique">VOIR TOUTE LA BOUTIQUE <ArrowUpRight size={12}/></Link></Button></div>
      <FeaturedCarousel products={featured}/>
    </section>}

    <section className="brand-band"><div className="site-width brand-band-inner">
      <div><span className="eyebrow">L’UNIVERS JAMILA</span><h2>Un bijou.<br/><em>Une émotion.</em></h2><p>{c.brand_intro}</p><Button variant="heroOutline" asChild><Link to="/a-propos">NOTRE HISTOIRE <ArrowUpRight/></Link></Button></div>
      <div className="brand-stats"><div><strong>{c.brand_since || '2023'}</strong><span>Depuis, dans l’univers de la bijouterie</span></div><div><strong>{c.brand_clients || '100+'}</strong><span>Clientes satisfaites</span></div><div><strong>Soin</strong><span>Une sélection exigeante et un accompagnement attentif</span></div></div>
    </div></section>

    {site.testimonials.length > 0 && <section className="review-band site-width"><span className="eyebrow text-primary">LA PAROLE À NOS CLIENTES</span><h2>Avis clients</h2><p>Retours partagés par nos clientes.</p><TestimonialGallery items={site.testimonials}/></section>}

    <section className="trust-band"><div className="site-width trust-grid four">
      <div className="trust-item"><Truck/><h3>Livraison au Maroc</h3><p>Livraison partout au Maroc, sans minimum d’achat.</p><Link className="couture-tool" to="/livraison">En savoir plus</Link></div>
      <div className="trust-item"><CreditCard/><h3>Paiement à la livraison</h3><p>Aucun paiement en ligne : vous réglez à la réception.</p><Link className="couture-tool" to="/conditions">Conditions de vente</Link></div>
      <div className="trust-item"><RotateCcw/><h3>Retours & échanges</h3><p>Selon la politique de la boutique, sur simple demande.</p><Link className="couture-tool" to="/retours">Consulter</Link></div>
      <div className="trust-item"><Headphones/><h3>Service client</h3><p>Une question ? Notre équipe vous répond sur WhatsApp.</p><Link className="couture-tool" to="/contact">Nous contacter</Link></div>
    </div></section>
  </SiteShell>;
}
