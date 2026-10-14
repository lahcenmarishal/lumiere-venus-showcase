import { useEffect } from 'react';
import { Check, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money, unitPrice, type Product } from '@/data/catalog';
import { setCartState, useCartState } from '@/lib/cart-store';

export function CartNotification({ products }: { products: Product[] }) {
  const { addition, cart, cartOpen } = useCartState();
  useEffect(() => {
    if (!addition) return;
    const timer = window.setTimeout(() => setCartState({ addition: null }), 7000);
    return () => window.clearTimeout(timer);
  }, [addition]);
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
  return <aside key={addition.id} className="cart-notification" aria-label="Confirmation d’ajout au panier">
    <div className="cart-notification-header">
      <span role="status"><Check size={18}/> Ajouté à votre panier</span>
      <Button variant="tool" aria-label="Fermer la notification" onClick={() => setCartState({ addition: null })}><X size={18}/></Button>
    </div>
    <div className="cart-notification-product">
      <img src={product.images[0]} alt={product.name} width={80} height={96}/>
      <div><h2>{product.name}</h2><p>{size}{product.color ? ` · ${product.color}` : ''}</p><strong>{money(unitPrice(product))}</strong></div>
    </div>
    <div className="cart-notification-subtotal"><span>Sous-total · {count} article{count > 1 ? 's' : ''}</span><strong>{money(subtotal)}</strong></div>
    <Button variant="couture" className="cart-notification-cta" onClick={() => setCartState({ addition: null, cartOpen: true })}><ShoppingBag size={16}/> VOIR MON PANIER <ArrowRight size={16}/></Button>
    <Button variant="tool" className="cart-notification-continue" onClick={() => setCartState({ addition: null })}>Continuer mes achats</Button>
    <div className="cart-notification-progress" aria-hidden="true"/>
  </aside>;
}
