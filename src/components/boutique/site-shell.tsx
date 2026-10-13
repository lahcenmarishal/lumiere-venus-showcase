import { Link } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, Menu, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CartDialog, WhatsAppIcon, openWhatsApp } from '@/components/boutique/commerce-dialogs';
import { useCartState, setCartState } from '@/lib/cart-store';
import type { Product } from '@/data/catalog';
import { BrandMark } from '@/components/boutique/brand-mark';

const nav = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/boutique' },
  { label: 'Collections', to: '/collections' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
] as const;

/** Shared header, footer, cart and WhatsApp button for every public page. */
export function SiteShell({ products, children, overlay = false }: { products: Product[]; children: ReactNode; overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, cartOpen } = useCartState();
  useEffect(() => { const h = () => setScrolled(window.scrollY > 90); h(); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const whatsapp = () => { openWhatsApp(); };
  return <>
    <div className="announcement"><span>LIVRAISON PARTOUT AU MAROC</span><span className="separator">✦</span><span>PAIEMENT À LA LIVRAISON</span></div>
    <header className={`header ${overlay ? '' : 'solid'} ${scrolled ? 'scrolled' : ''}`}><div className="site-width header-inner">
      <Link className="brand" to="/" aria-label="JAMILA JEWELRY — Accueil"><BrandMark decorative label="Jamila Jewelry"/></Link>
      <nav className="navigation" aria-label="Navigation principale">{nav.map(n => <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === '/' }} activeProps={{ className: 'nav-active' }}>{n.label}</Link>)}</nav>
      <div className="header-tools">
        <Button variant="tool" className="header-whatsapp" aria-label="Contacter sur WhatsApp" onClick={whatsapp}><WhatsAppIcon/></Button>
        <Button variant="tool" className="cart-button" aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`} onClick={() => setCartState({ cartOpen: true })}><ShoppingBag/><span className="cart-count">{count}</span></Button>
        <Button variant="tool" className="mobile-menu-button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(true)}><Menu/></Button>
      </div>
    </div></header>
    <main>{children}</main>
    <footer className="footer"><div className="site-width">
      <div className="footer-top"><div><BrandMark className="footer-logo" label="Logo Jamila Jewelry"/><p className="footer-tagline">L’élégance commence par un bijou qui vous ressemble.</p></div>
        <div className="footer-links">
          <div><h3>LA MAISON</h3><Link to="/boutique">Boutique</Link><Link to="/collections">Collections</Link><Link to="/a-propos">À propos</Link><Link to="/contact">Contact</Link></div>
          <div><h3>INFORMATIONS</h3><Link to="/livraison">Livraison</Link><Link to="/retours">Retours & échanges</Link><Link to="/conditions">Conditions de vente</Link><Link to="/confidentialite">Confidentialité</Link></div>
        </div></div>
      <div className="footer-bottom"><span>© 2026 JAMILA JEWELRY — Tous droits réservés.</span><span>Avec élégance, au Maroc.</span></div>
    </div></footer>
    <Button variant="tool" className="whatsapp-float" aria-label="Assistance WhatsApp" onClick={whatsapp}><WhatsAppIcon/></Button>
    <CartDialog products={products} open={cartOpen} onClose={() => setCartState({ cartOpen: false })} items={cart} setItems={c => setCartState({ cart: c })}/>
    <Dialog open={menuOpen} onOpenChange={setMenuOpen}><DialogContent className="boutique-dialog small-dialog"><DialogTitle>JAMILA JEWELRY</DialogTitle><DialogDescription className="sr-only">Navigation</DialogDescription>
      <nav className="mobile-nav">{nav.map(n => <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}>{n.label} <ArrowUpRight size={14}/></Link>)}</nav>
    </DialogContent></Dialog>
  </>;
}

export function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: string; intro?: string | undefined; image?: string | undefined }) {
  return <section className={`page-hero ${image ? 'with-image' : ''}`}>
    {image && <img src={image} alt="" className="page-hero-image"/>}
    <div className="site-width page-hero-content"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{intro && <p>{intro}</p>}</div>
  </section>;
}
