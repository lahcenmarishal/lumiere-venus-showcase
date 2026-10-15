import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { QuickOrderForm } from '@/components/boutique/quick-order-form';
import { ProductTestimonialCarousel } from '@/components/boutique/product-testimonial-carousel';
import { getSiteData } from '@/lib/site.functions';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ShoppingBag, Truck, CreditCard, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/lib/products.functions';
import { CartDialog } from '@/components/boutique/commerce-dialogs';
import { useCartState, setCartState, addToCart } from '@/lib/cart-store';
import { money, unitPrice, type Size } from '@/data/catalog';
import { isOrderBarVisible } from '@/lib/order-bar-visibility';

const slugOf = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const Route = createFileRoute('/produit/$id')({
  loader: async ({ params }) => {
    const [products, site] = await Promise.all([listProducts(), getSiteData()]);
    const product = products.find(p => p.id === params.id);
    if (!product) throw notFound();
    return { products, product, testimonials: site.testimonials };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: 'Pièce introuvable — JAMILA JEWELRY' }, { name: 'robots', content: 'noindex' }] };
    const title = `${p.name} — ${p.category} | JAMILA JEWELRY`;
    const desc = `${p.description} ${p.material}. ${money(unitPrice(p))}, livraison partout au Maroc.`;
    return { meta: [{ title }, { name: 'description', content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  notFoundComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>Cette pièce n’existe pas ou n’est plus disponible. <Link to="/boutique">Voir la boutique</Link></p>,
  component: ProductPage,
});

function ProductPage() {
  const { products, product, testimonials } = Route.useLoaderData();
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<Size | null>(product.sizes.length === 1 ? product.sizes[0] ?? null : null);
  const [error, setError] = useState('');
  const { cart, cartOpen } = useCartState();
  const orderRef = useRef<HTMLElement>(null);
  const [orderBarVisible, setOrderBarVisible] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => { setOrdered(false); }, [product.id]);

  useEffect(() => {
    if (ordered) { setOrderBarVisible(false); return; }
    const update = () => {
      const column = document.querySelector<HTMLElement>('.product-page .detail-info');
      const inner = column && column.scrollHeight > column.clientHeight + 4 ? column.scrollTop : 0;
      const submitBounds = orderRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      setOrderBarVisible(isOrderBarVisible({ mobile: window.matchMedia('(max-width:760px)').matches, scroll: Math.max(window.scrollY, inner), submitBottom: submitBounds?.bottom ?? null, viewportTop, viewportHeight: viewport?.height ?? window.innerHeight }));
    };
    const observer = new IntersectionObserver(update);
    if (orderRef.current) observer.observe(orderRef.current);
    update();
    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, [product.id, ordered]);

  function add() {
    if (!size) { setError('Veuillez sélectionner votre dimension.'); return; }
    if (!addToCart(product, size)) { setError('La quantité maximale pour cette dimension est déjà dans votre panier.'); return; }
    setError('');
  }

  function orderNow() {
    const node = orderRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!size) { setError('Veuillez sélectionner votre dimension.'); return; }
    window.setTimeout(() => node.querySelector<HTMLInputElement>('input[name="customerName"]')?.focus({ preventScroll: true }), 450);
  }

  return <>
    <main className="product-page product-focus" key={product.id}>
      <div className="product-presentation"><div className="product-page-grid">
        <div className="gallery"><div className="gallery-main"><img src={product.images[img] ?? product.images[0]} alt={product.name}/></div>
          {product.images.length > 1 && <div className="gallery-thumbs">{product.images.map((src, i) => <Button variant="tool" type="button" key={`${src}-${i}`} className={i === img ? 'active' : ''} onClick={() => setImg(i)} aria-pressed={i === img} aria-label={`Photo ${i + 1}`}><img src={src} alt=""/></Button>)}</div>}</div>
        <div className="detail-info">
          <Button variant="tool" className="product-close" asChild><Link to="/boutique" aria-label="Fermer la fiche produit"><X size={18}/></Link></Button>
          {product.label && <span className="eyebrow text-primary">{product.label}</span>}
          <h1>{product.name}</h1>
          <div className="detail-price">{product.salePrice != null && <s>{money(product.price)}</s>} {money(unitPrice(product))}</div>
          <div className="size-header"><span className="eyebrow">Votre dimension</span></div>
          <div className="size-buttons">{product.sizes.map(s => <Button key={s} variant="coutureOutline" className={`size-button ${size === s ? 'selected' : ''}`} onClick={() => { setSize(s); setError(''); }} aria-pressed={size === s}>{s}</Button>)}</div>
          {error && <p className="error-note" role="alert">{error}</p>}
          {product.available ? <section className="product-quick-order" aria-label="Commande directe" ref={orderRef}><QuickOrderForm key={product.id} title="Commander directement" items={size ? [{ productId: product.id, size, quantity: 1 }] : []} products={products} secondaryAction={<Button type="button" variant="coutureOutline" className="product-cart-alternative" onClick={add}><ShoppingBag size={15}/> Ajouter au panier</Button>} onSuccess={() => setOrdered(true)} onContinue={() => navigate({ to: '/boutique' })}/></section> : <p className="detail-note">Cette pièce est actuellement indisponible.</p>}
          <p className="detail-description">{product.detail || product.description}</p>
          <div className="detail-specs"><p><strong>Matière :</strong> {product.material}</p>{product.cut && <p><strong>Design :</strong> {product.cut}</p>}<p><strong>Couleur :</strong> {product.color}</p><p><strong>Référence :</strong> {product.sku}</p><p><strong>Disponibilité :</strong> {product.available ? 'En stock' : 'Indisponible'}</p></div>
          <ul className="detail-perks"><li><Truck/> Livraison partout au Maroc</li><li><CreditCard/> Paiement à la livraison</li><li><RotateCcw/> <Link to="/retours">Retours & échanges</Link></li></ul>
          <nav className="breadcrumb" aria-label="Fil d’Ariane"><Link to="/">Accueil</Link> / <Link to="/boutique">Boutique</Link> / <Link to="/collections/$slug" params={{ slug: slugOf(product.category) }}>{product.category}</Link> / <span>{product.name}</span></nav>
          <ProductTestimonialCarousel key={product.id} items={testimonials}/>
        </div>
      </div></div>
    </main>
    {product.available && !ordered && <aside className={`product-order-bar ${orderBarVisible ? 'is-visible' : ''}`} aria-label="Commande rapide">
      <div className="product-order-bar-inner">
        <Button variant="hero" className="product-order-bar-cta" onClick={orderNow}>COMMANDER MAINTENANT <ArrowRight size={16}/></Button>
      </div>
    </aside>}
    <CartDialog products={products} open={cartOpen} onClose={() => setCartState({ cartOpen: false })} items={cart} setItems={items => setCartState({ cart: items })}/>
  </>;
}
