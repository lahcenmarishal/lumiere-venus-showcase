import { useState, type FormEvent } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Check, Minus, Plus, Trash2, ZoomIn, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { boutique, deliveryFee, money, unitPrice, type CartItem, type Product, type Size } from '@/data/catalog';
import { submitOrder } from '@/lib/orders.functions';
import { trackPurchase } from '@/lib/pixel';
import { returnExamples } from '@/data/trust-examples';

export function WhatsAppIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8 7.5c.4-.5 1-.4 1.2.1l.7 1.7c.2.4-.2.8-.6 1.1.8 1.8 1.7 2.7 3.6 3.5.3-.4.7-1 1.1-.8l1.8.8c.6.2.6.7.2 1.2-.8 1.1-2.2 1.2-3.8.5-2.5-1.1-4.5-3.2-5.2-5.5-.3-1-.1-1.9 1-2.6Z"/></svg>;
}

export type InfoKind = 'contact' | 'sizes' | 'delivery' | 'returns' | 'terms' | 'privacy' | 'instagram';
export function InfoDialog({ kind, onClose }: { kind: InfoKind | null; onClose: () => void }) {
  const titles: Record<InfoKind, string> = { contact: 'À votre écoute', sizes: 'Guide des tailles', delivery: 'Livraison gratuite au Maroc', returns: 'Retours & échanges', terms: 'Conditions de vente', privacy: 'Votre confidentialité', instagram: 'Retrouvez-nous sur Instagram' };
  return <Dialog open={kind !== null} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="boutique-dialog small-dialog"><DialogTitle>{kind ? titles[kind] : ''}</DialogTitle><DialogDescription className="sr-only">Informations LUMIERE VENUS</DialogDescription>
    {kind === 'contact' && <><p>Une question sur un modèle ou une taille ? Notre équipe vous accompagne dans votre choix.</p><p className="mt-4">Contactez-nous directement sur WhatsApp au 06 71 58 83 56, ou envoyez votre demande de commande depuis le panier.</p></>}
    {kind === 'sizes' && <><p>Les tailles proposées sont S, M, L et XL. Leur disponibilité et les mesures exactes sont à confirmer pour chaque modèle avant la validation de votre commande.</p><table className="size-guide"><thead><tr><th>Taille</th><th>Mesures du modèle</th></tr></thead><tbody>{['S','M','L','XL'].map(size => <tr key={size}><td>{size}</td><td>À confirmer avec la boutique</td></tr>)}</tbody></table><p className="mt-4">Ne choisissez pas votre taille à partir de mesures génériques : chaque coupe est différente.</p></>}
    {kind === 'delivery' && <><p>Livraison gratuite partout au Maroc, sans minimum d’achat, et paiement à la livraison. Votre adresse et la disponibilité du modèle sont vérifiées par notre équipe avant l’envoi.</p><p className="mt-4">Le délai de livraison vous sera communiqué avant la confirmation définitive. Aucun paiement n’est demandé sur ce site.</p></>}
    {kind === 'terms' && <><p>Votre envoi constitue une demande de commande. La vente est confirmée uniquement après vérification du prix, de la taille, de la disponibilité avec la boutique. La livraison est gratuite au Maroc.</p><p className="mt-4">Les conditions détaillées de retour, d’échange et les mentions légales de la marque sont en cours de confirmation. Vous pouvez les demander avant de confirmer votre achat.</p></>}
    {kind === 'returns' && <><p className="return-example-notice">Exemple de politique de retour — proposition non confirmée par la boutique. Ces conditions ne constituent pas un engagement commercial.</p><ol className="return-examples">{returnExamples.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol><p>Confirmez les conditions applicables avant votre achat sur WhatsApp au 06 71 58 83 56.</p><Button variant="coutureOutline" className="mt-6 w-full" onClick={() => openWhatsApp()}><WhatsAppIcon/> CONTACTER LA BOUTIQUE</Button></>}
    {kind === 'privacy' && <><p>Les informations du formulaire (nom, téléphone, ville, adresse et articles) sont utilisées pour traiter votre demande et organiser la livraison. Elles ne sont pas consultables par les autres visiteurs.</p><p className="mt-4">Aucune donnée de carte bancaire n’est collectée. Les coordonnées du responsable et les modalités détaillées d’exercice de vos droits seront ajoutées avant l’ouverture commerciale.</p></>}
    {kind === 'instagram' && <p>Le compte officiel LUMIERE VENUS sera communiqué prochainement.</p>}
  </DialogContent></Dialog>;
}

export function ProductDialog({ product, onClose, onOrder, onWhatsApp, onGuide }: { product: Product | null; onClose: () => void; onOrder: (p: Product, size: Size) => void; onWhatsApp: (p?: Product) => void; onGuide: () => void }) {
  const [size, setSize] = useState<Size | null>(null);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(false);
  function order() { if (!product) return; if (!size) { setError('Veuillez sélectionner votre taille.'); return; } onOrder(product, size); }
  return <><Dialog open={!!product} onOpenChange={open => { if (!open) { onClose(); setSize(null); setError(''); } }}><DialogContent className="boutique-dialog"><DialogDescription className="sr-only">Détails du modèle, choix de taille et commande</DialogDescription>{product && <div className="product-detail">
    <div className="detail-image"><img src={product.images[0]} alt={product.name} width={768} height={1152}/><Button variant="tool" className="absolute bottom-4 right-4" title="Agrandir la photo" aria-label="Agrandir la photo" onClick={() => setZoom(true)}><ZoomIn/></Button></div>
    <div className="detail-info"><span className="eyebrow text-primary">{product.label}</span><DialogTitle>{product.name}</DialogTitle><div className="detail-price">{money(unitPrice(product))}</div><p className="detail-description">{product.detail}</p><div className="detail-specs"><p><strong>Matière :</strong> {product.material}</p><p><strong>Coupe :</strong> {product.cut}</p><p><strong>Couleur :</strong> {product.color}</p><p><strong>Référence :</strong> {product.sku}</p></div>
    <div className="size-header"><span className="eyebrow">Votre taille</span><Button variant="tool" onClick={onGuide}>Guide des tailles</Button></div><div className="size-buttons">{product.sizes.map(s => <Button key={s} variant="coutureOutline" className={`size-button ${size === s ? 'selected' : ''}`} onClick={() => { setSize(s); setError(''); }} aria-pressed={size === s}>{s}</Button>)}</div>{error && <p className="error-note" role="alert">{error}</p>}<p className="detail-note">Disponibilité et taille confirmées par notre équipe.</p><div className="detail-cta"><Button variant="couture" onClick={order} disabled={!product.available}>COMMANDER CETTE PIÈCE <ArrowRight/></Button><Button variant="coutureOutline" onClick={() => onWhatsApp(product)}><WhatsAppIcon/> COMMANDER VIA WHATSAPP</Button></div><p className="detail-note">Paiement à la livraison · Livraison gratuite au Maroc<br/>Prix indicatif à confirmer avec la boutique.</p></div>
  </div>}</DialogContent></Dialog><Dialog open={zoom && !!product} onOpenChange={setZoom}><DialogContent className="boutique-dialog zoom-dialog"><DialogTitle className="sr-only">Photo de {product?.name}</DialogTitle><DialogDescription className="sr-only">Vue agrandie du produit</DialogDescription><img src={product?.images[0]} alt={product?.name}/></DialogContent></Dialog></>;
}

export function CartDialog({ open, onClose, items, setItems, products }: { open: boolean; onClose: () => void; items: CartItem[]; setItems: (items: CartItem[]) => void; products: Product[] }) {
  const getProduct = (id: string) => products.find(p => p.id === id);
  const [checkout, setCheckout] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const sendOrder = useServerFn(submitOrder);
  const total = items.reduce((sum, item) => { const p = getProduct(item.productId); return sum + (p ? unitPrice(p) * item.quantity : 0); }, 0);
  function close() { onClose(); setCheckout(false); setError(''); setReference(''); }
  function changeQuantity(index: number, amount: number) { setItems(items.map((item, i) => i === index ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + amount)) } : item)); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setPending(true); setError('');
    try { const result = await sendOrder({ data: { customerName: String(form.get('customerName') ?? ''), phone: String(form.get('phone') ?? '').replace(/\s/g, ''), city: String(form.get('city') ?? ''), address: String(form.get('address') ?? ''), items } }); setReference(result.reference); trackPurchase(result.total, items.map(i => i.productId)); setItems([]); }
    catch { setError('Votre demande n’a pas pu être enregistrée. Vérifiez les informations et réessayez.'); }
    finally { setPending(false); }
  }
  return <Dialog open={open} onOpenChange={value => { if (!value && !pending) close(); }}><DialogContent className="boutique-dialog checkout-dialog"><DialogTitle>{reference ? 'Merci pour votre commande' : checkout ? 'Votre commande' : 'Votre panier'}</DialogTitle><DialogDescription className="sr-only">Récapitulatif et formulaire de demande de commande</DialogDescription>
    {reference ? <div className="success-state"><Check/><span className="eyebrow">Demande {reference}</span><p>Notre équipe vous contactera pour confirmer les informations de livraison, la taille et le prix de vos pièces.</p><Button variant="couture" onClick={close}>CONTINUER LA DÉCOUVERTE</Button></div> : items.length === 0 ? <div className="success-state"><p>Votre prochaine pièce d’exception vous attend.</p><Button variant="couture" onClick={close}>DÉCOUVRIR LA SÉLECTION</Button></div> : <>
    {items.map((item, index) => { const p = getProduct(item.productId); if (!p) return null; return <div className="cart-row" key={`${item.productId}-${item.size}`}><img src={p.images[0]} alt={p.name} width={64} height={88}/><div className="cart-row-info"><h3>{p.name}</h3><p>{p.color} · Taille {item.size}</p><div className="cart-quantity"><Button variant="tool" aria-label={`Diminuer la quantité de ${p.name}`} onClick={() => changeQuantity(index,-1)} disabled={pending || item.quantity <= 1}><Minus/></Button><span>{item.quantity}</span><Button variant="tool" aria-label={`Augmenter la quantité de ${p.name}`} onClick={() => changeQuantity(index,1)} disabled={pending || item.quantity >= 10}><Plus/></Button></div></div><span>{money(unitPrice(p)*item.quantity)}</span><Button variant="tool" title="Retirer du panier" aria-label={`Retirer ${p.name}`} disabled={pending} onClick={() => setItems(items.filter((_,i) => i !== index))}><Trash2/></Button></div>; })}
    <div className="cart-total"><span>Total des articles</span><span>{money(total)}</span></div><div className="cart-delivery"><span>Livraison au Maroc</span><strong>{deliveryFee === 0 ? 'Gratuite' : money(deliveryFee)}</strong></div><p className="detail-note">Prix indicatifs · Aucun frais de livraison.<br/>Paiement à la livraison, aucun paiement en ligne.</p>
    {!checkout ? <Button variant="couture" className="mt-6 w-full" onClick={() => setCheckout(true)}>PASSER MA COMMANDE <ArrowRight/></Button> : <form className="checkout-form" onSubmit={submit}><label>Nom complet<input name="customerName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Votre nom et prénom" disabled={pending}/></label><label>Téléphone<input name="phone" type="tel" autoComplete="tel" pattern="(?:\+212|0)[5-7][0-9]{8}" title="Numéro marocain : 06XXXXXXXX ou +2126XXXXXXXX" required placeholder="06XXXXXXXX" disabled={pending}/></label><label className="full-field">Ville<input name="city" autoComplete="address-level2" required minLength={2} maxLength={80} placeholder="Votre ville" disabled={pending}/></label><label className="full-field">Adresse de livraison<textarea name="address" autoComplete="street-address" required minLength={5} maxLength={400} rows={2} placeholder="Rue, numéro, quartier…" disabled={pending}/></label>{error && <p className="error-note full-field" role="alert">{error}</p>}<Button type="submit" variant="couture" className="full-field" disabled={pending}>{pending ? 'ENREGISTREMENT…' : 'CONFIRMER MA COMMANDE'} <Check/></Button><p className="detail-note full-field">Votre demande sera confirmée par téléphone avant tout envoi.</p></form>}
    </>}
  </DialogContent></Dialog>;
}

export function openWhatsApp(product?: Product) {
  if (!boutique.whatsapp) return false;
  const message = product ? `Bonjour, je suis intéressée par ${product.name}. Je voudrais connaître les tailles disponibles et passer commande.` : 'Bonjour LUMIERE VENUS, je souhaite découvrir votre sélection exclusive et passer commande.';
  window.open(`https://wa.me/${boutique.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  return true;
}