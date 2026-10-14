import { useState, type FormEvent, type ReactNode } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Check, Truck, CreditCard, PhoneCall, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money, unitPrice, type CartItem, type Product } from '@/data/catalog';
import { submitOrder } from '@/lib/orders.functions';
import { trackPurchase } from '@/lib/pixel';

export function QuickOrderForm({ items, products, onSuccess, onContinue, title = 'Commander maintenant', secondaryAction }: { items: CartItem[]; products: Product[]; onSuccess?: () => void; onContinue: () => void; title?: string; secondaryAction?: ReactNode }) {
  const sendOrder = useServerFn(submitOrder);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ reference: string; total: number } | null>(null);
  const subtotal = items.reduce((s, i) => { const p = products.find(p => p.id === i.productId); return s + (p ? unitPrice(p) * i.quantity : 0); }, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) { setError('Veuillez sélectionner votre dimension.'); return; }
    const form = new FormData(event.currentTarget); setPending(true); setError('');
    try {
      const result = await sendOrder({ data: { customerName: String(form.get('customerName') ?? ''), phone: String(form.get('phone') ?? '').replace(/\s/g, ''), city: String(form.get('city') ?? ''), address: String(form.get('address') ?? ''), items } });
      trackPurchase(result.total, items.map(i => i.productId));
      setDone(result); onSuccess?.();
    } catch { setError('Votre demande n’a pas pu être enregistrée. Vérifiez les informations et réessayez.'); }
    finally { setPending(false); }
  }

  if (done) return <div className="quick-order-success" role="status">
    <span className="quick-order-check"><Check size={26}/></span>
    <h3>Commande confirmée !</h3>
    <p className="eyebrow">Référence {done.reference}</p>
    <p>Merci ! Notre équipe vous appelle très vite pour confirmer la livraison. Total à régler à la livraison : <strong>{money(done.total)}</strong>.</p>
    <Button variant="couture" className="w-full" onClick={onContinue}>CONTINUER MES ACHATS</Button>
  </div>;

  return <form className="quick-order" onSubmit={submit}>
    <div className="quick-order-heading"><h3>{title}</h3>{secondaryAction}</div>
    <ul className="quick-order-perks"><li><CreditCard size={14}/> Paiement à la livraison</li><li><Truck size={14}/> Livraison partout au Maroc</li><li><PhoneCall size={14}/> Confirmation par téléphone</li></ul>
    <label>Nom complet<input name="customerName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Votre nom et prénom" disabled={pending}/></label>
    <label>Téléphone<input name="phone" type="tel" autoComplete="tel" pattern="(?:\+212|0)[5-7][0-9]{8}" title="Numéro marocain : 06XXXXXXXX ou +2126XXXXXXXX" required placeholder="06XXXXXXXX" disabled={pending}/></label>
    <label>Ville<input name="city" autoComplete="address-level2" required minLength={2} maxLength={80} placeholder="Votre ville" disabled={pending}/></label>
    <label>Adresse<textarea name="address" autoComplete="street-address" required minLength={5} maxLength={400} rows={2} placeholder="Rue, numéro, quartier…" disabled={pending}/></label>
    <div className="quick-order-summary">
      <div><span>Articles</span><span>{money(subtotal)}</span></div>
      <div className="total"><span>Total des articles</span><strong>{money(subtotal)}</strong></div>
    </div>
    {error && <p className="error-note" role="alert">{error}</p>}
    <Button type="submit" variant="couture" className="w-full" disabled={pending}>{pending ? 'ENVOI…' : 'CONFIRMER MA COMMANDE'} <Check size={16}/></Button>
    <p className="quick-order-note">Notre équipe vous contactera pour confirmer votre commande et les frais de livraison.</p>
    <p className="quick-order-secure"><ShieldCheck size={14}/> Aucun paiement en ligne · vos données restent privées</p>
  </form>;
}
