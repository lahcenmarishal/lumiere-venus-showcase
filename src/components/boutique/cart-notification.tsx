import { useEffect, useState } from 'react';
import { Check, X, ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money, unitPrice, type Product } from '@/data/catalog';
import { setCartState, useCartState } from '@/lib/cart-store';
import { QuickOrderForm } from '@/components/boutique/quick-order-form';

export function CartNotification({ products }: { products: Product[] }) {
  const { addition, cart, cartOpen } = useCartState();
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setExpanded(false); }, [addition?.id]);
  useEffect(() => {
    if (!addition) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setCartState({ addition: null }); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [addition]);
  if (!addition || cartOpen) return null;
  const { product, size } = addition;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId);
    return sum + (p ? unitPrice(p) * item.quantity : 0);
  }, 0);
  const close = () => setCartState({ addition: null });
  return <aside key={addition.id} className={`cart-notification ${expanded ? 'expanded' : ''}`} aria-label="Confirmation d’ajout au panier">
    <div className="cart-notification-header">
      <span role="status"><Check size={18}/> Ajouté à votre panier</span>
      <Button variant="tool" aria-label="Fermer la notification" onClick={close}><X size={18}/></Button>
    </div>
    <div className="cart-notification-product">
      <img src={product.images[0]} alt={product.name} width={80} height={96}/>
      <div><h2>{product.name}</h2><p>{size}{product.color ? ` · ${product.color}` : ''}</p><strong>{money(unitPrice(product))}</strong></div>
    </div>
    <div className="cart-notification-subtotal"><span>Sous-total · {count} article{count > 1 ? 's' : ''}</span><strong>{money(subtotal)}</strong></div>
    {expanded
      ? <QuickOrderForm items={cart} products={products} onSuccess={() => setCartState({ cart: [] })} onContinue={close}/>
      : <>
        <Button variant="couture" className="cart-notification-cta" onClick={() => setExpanded(true)}><Zap size={16}/> COMMANDER MAINTENANT <ArrowRight size={16}/></Button>
        <Button variant="coutureOutline" className="cart-notification-order" onClick={() => setCartState({ addition: null, cartOpen: true })}><ShoppingBag size={16}/> Voir mon panier</Button>
        <Button variant="tool" className="cart-notification-continue" onClick={close}>Continuer mes achats</Button>
      </>}
  </aside>;
}
