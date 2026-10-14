import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, Truck, CreditCard, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/lib/products.functions';
import { CartDialog, WhatsAppIcon, openWhatsApp } from '@/components/boutique/commerce-dialogs';
import { useCartState, setCartState } from '@/lib/cart-store';
import { money, unitPrice, type Size } from '@/data/catalog';

const slugOf = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const Route = createFileRoute('/produit/$id')({
  loader: async ({ params }) => {
    const products = await listProducts();
    const product = products.find(p => p.id === params.id);
    if (!product) throw notFound();
    return { products, product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: 'Pièce introuvable — JAMILA JEWELRY' }, { name: 'robots', content: 'noindex' }] };
    const title = `${p.name} — ${p.category} | JAMILA JEWELRY`;
    const desc = `${p.description} ${p.material}. ${money(unitPrice(p))}, livraison partout au Maroc.`;
    return { meta: [{ title }, { name: 'description', content: desc }, { property: 'og:title', content: title }, { property: 'og:description', content: desc }, { property: 'og:type', content: 'product' }, { name: 'twitter:card', content: 'summary_large_image' }] };
  },
  notFoundComponent: () => <p style={{ padding: 40, textAlign: 'center' }}>Cette pièce n’existe pas ou n’est plus disponible. <Link to="/boutique">Voir la boutique</Link></p>,
  component: ProductPage,
});

function ProductPage() {
  const { products, product } = Route.useLoaderData();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<Size | null>(product.sizes.length === 1 ? product.sizes[0] ?? null : null);
  const [error, setError] = useState('');
  const { cart, cartOpen } = useCartState();
  function add() {
    if (!size) { setError('Veuillez sélectionner votre dimension.'); return; }
    const ex = cart.find(i => i.productId === product.id && i.size === size);
    setCartState({ cart: ex ? cart.map(i => i === ex ? { ...i, quantity: Math.min(10, i.quantity + 1) } : i) : [...cart, { productId: product.id, size, quantity: 1 }], cartOpen: true });
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
          <p className="detail-description">{product.detail || product.description}</p>
          <div className="detail-specs"><p><strong>Matière :</strong> {product.material}</p>{product.cut && <p><strong>Design :</strong> {product.cut}</p>}<p><strong>Couleur :</strong> {product.color}</p><p><strong>Référence :</strong> {product.sku}</p><p><strong>Disponibilité :</strong> {product.available ? 'En stock' : 'Indisponible'}</p></div>
          <div className="size-header"><span className="eyebrow">Votre dimension</span></div>
          <div className="size-buttons">{product.sizes.map(s => <Button key={s} variant="coutureOutline" className={`size-button ${size === s ? 'selected' : ''}`} onClick={() => { setSize(s); setError(''); }} aria-pressed={size === s}>{s}</Button>)}</div>
          {error && <p className="error-note" role="alert">{error}</p>}
          <div className="detail-cta"><Button variant="couture" onClick={add} disabled={!product.available}>AJOUTER AU PANIER <ArrowRight/></Button><Button variant="coutureOutline" onClick={() => openWhatsApp(product)}><WhatsAppIcon/> COMMANDER VIA WHATSAPP</Button></div>
          <ul className="detail-perks"><li><Truck/> Livraison partout au Maroc</li><li><CreditCard/> Paiement à la livraison</li><li><RotateCcw/> <Link to="/retours">Retours & échanges</Link></li></ul>
          <nav className="breadcrumb" aria-label="Fil d’Ariane"><Link to="/">Accueil</Link> / <Link to="/boutique">Boutique</Link> / <Link to="/collections/$slug" params={{ slug: slugOf(product.category) }}>{product.category}</Link> / <span>{product.name}</span></nav>
        </div>
      </div></div>
    </main>
    <CartDialog products={products} open={cartOpen} onClose={() => setCartState({ cartOpen: false })} items={cart} setItems={items => setCartState({ cart: items })}/>
  </>;
}
