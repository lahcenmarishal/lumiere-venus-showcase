import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { money, sizes as allSizes } from '@/data/catalog';
import type { ProductRow } from '@/lib/products';
import type { Database } from '@/integrations/supabase/types';
import { FeaturedAdmin, CategoriesAdmin, TestimonialsAdmin, ContentAdmin } from '@/components/admin/site-admin';
import { ArrowLeft, ArrowRight, Image, Layers, Trash2 } from 'lucide-react';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItem = { productId: string; name: string; sku: string; size: string; quantity: number; price: number; image?: string };
const statuses: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' };
const tokens = ['turquoise', 'rouge', 'magenta', 'noire'];

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [
    { title: 'Tableau de bord — JAMILA JEWELRY' },
    { name: 'description', content: 'Gestion des produits, des commandes et des ventes JAMILA JEWELRY.' },
    { property: 'og:title', content: 'Tableau de bord — JAMILA JEWELRY' },
    { property: 'og:description', content: 'Espace administrateur JAMILA JEWELRY.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<'stats' | 'orders' | 'products' | 'featured' | 'categories' | 'testimonials' | 'content'>('stats');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);

  async function load() {
    const [o, p] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('sort_order').order('created_at'),
    ]);
    setOrders(o.data ?? []); setProducts(p.data ?? []);
  }
  useEffect(() => {
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }).then(({ data }) => { setIsAdmin(!!data); if (data) load(); });
  }, [user.id]);
  async function signOut() { await supabase.auth.signOut(); navigate({ to: '/auth' }); }

  if (isAdmin === null) return <main className="admin-auth"><p>Chargement…</p></main>;
  if (!isAdmin) return <main className="admin-auth"><div className="admin-card admin-auth-card"><h1>Accès réservé</h1><p>Ce compte n’a pas encore le rôle administrateur. Ajoutez-le dans la base de données (table « user_roles », rôle « admin ») avec cet identifiant :</p><code className="admin-code">{user.id}</code><Button variant="coutureOutline" onClick={signOut}>SE DÉCONNECTER</Button></div></main>;

  return <main className="admin">
    <header className="admin-header"><div><span className="eyebrow">JAMILA JEWELRY</span><h1>Tableau de bord</h1></div>
      <div className="admin-header-tools"><a href="/" className="couture-tool">Voir le site</a><Button variant="coutureOutline" onClick={signOut}>DÉCONNEXION</Button></div></header>
    <nav className="admin-tabs">{([['stats', 'Statistiques'], ['orders', `Commandes (${orders.length})`], ['products', `Produits (${products.length})`], ['featured', 'Sélection accueil'], ['categories', 'Collections'], ['testimonials', 'Avis clients'], ['content', 'Contenus']] as const).map(([k, l]) => <Button key={k} variant="tool" className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</Button>)}</nav>
    {tab === 'stats' && <Stats orders={orders} />}
    {tab === 'orders' && <Orders orders={orders} products={products} reload={load} />}
    {tab === 'products' && <Products products={products} reload={load} />}
    {tab === 'featured' && <FeaturedAdmin products={products} reload={load} />}
    {tab === 'categories' && <CategoriesAdmin />}
    {tab === 'testimonials' && <TestimonialsAdmin />}
    {tab === 'content' && <ContentAdmin />}
  </main>;
}

function Stats({ orders }: { orders: OrderRow[] }) {
  const s = useMemo(() => {
    const valid = orders.filter(o => o.status !== 'cancelled');
    const revenue = valid.reduce((a, o) => a + Number(o.total), 0);
    const delivered = orders.filter(o => o.status === 'delivered').reduce((a, o) => a + Number(o.total), 0);
    const top = new Map<string, { qty: number; revenue: number }>();
    valid.forEach(o => (o.items as OrderItem[]).forEach(i => { const t = top.get(i.name) ?? { qty: 0, revenue: 0 }; t.qty += i.quantity; t.revenue += i.price * i.quantity; top.set(i.name, t); }));
    const days = Array.from({ length: 14 }, (_, k) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - k)); return d; });
    const daily = days.map(d => ({ label: d.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit' }), value: valid.filter(o => { const c = new Date(o.created_at); return c >= d && c.getTime() < d.getTime() + 864e5; }).reduce((a, o) => a + Number(o.total), 0) }));
    return { revenue, delivered, count: valid.length, pending: orders.filter(o => o.status === 'pending').length, avg: valid.length ? revenue / valid.length : 0, top: [...top.entries()].sort((a, b) => b[1].revenue - a[1].revenue), daily };
  }, [orders]);
  const max = Math.max(1, ...s.daily.map(d => d.value));
  return <section className="admin-section">
    <div className="admin-kpis">
      <Kpi label="Chiffre d’affaires (hors annulées)" value={money(s.revenue)} />
      <Kpi label="Ventes livrées" value={money(s.delivered)} />
      <Kpi label="Commandes" value={String(s.count)} />
      <Kpi label="En attente" value={String(s.pending)} />
      <Kpi label="Panier moyen" value={money(Math.round(s.avg))} />
    </div>
    <div className="admin-card"><h2>Ventes des 14 derniers jours</h2><div className="admin-chart">{s.daily.map(d => <div key={d.label} className="admin-bar-col" title={`${d.label} : ${money(d.value)}`}><div className="admin-bar" style={{ height: `${(d.value / max) * 100}%` }} /><span>{d.label}</span></div>)}</div></div>
    <div className="admin-card"><h2>Pièces les plus vendues</h2>{s.top.length === 0 ? <p className="admin-muted">Aucune vente pour le moment.</p> : <table className="admin-table"><thead><tr><th>Pièce</th><th>Quantité</th><th>Montant</th></tr></thead><tbody>{s.top.map(([n, t]) => <tr key={n}><td>{n}</td><td>{t.qty}</td><td>{money(t.revenue)}</td></tr>)}</tbody></table>}</div>
  </section>;
}
function Kpi({ label, value }: { label: string; value: string }) { return <div className="admin-card admin-kpi"><span>{label}</span><strong>{value}</strong></div>; }

export function Orders({ orders, products, reload }: { orders: OrderRow[]; products: ProductRow[]; reload: () => void }) {
  const [filter, setFilter] = useState('all');
  const [zoom, setZoom] = useState<{ src: string; name: string; productId: string } | null>(null);
  const imageByProduct = useMemo(() => new Map(products.map(p => [p.id, p.images[0] ?? ''])), [products]);
  const thumbOf = (i: OrderItem) => i.image || imageByProduct.get(i.productId) || '';
  useEffect(() => { if (!zoom) return; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(null); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [zoom]);
  async function setStatus(id: string, status: string) { await supabase.from('orders').update({ status }).eq('id', id); reload(); }
  async function removeOrder(id: string) { if (!confirm('Supprimer définitivement cette commande ?')) return; await supabase.from('orders').delete().eq('id', id); reload(); }
  const list = orders.filter(o => filter === 'all' || o.status === filter);
  return <section className="admin-section">
    <div className="admin-row"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tous les statuts</option>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
    {list.length === 0 ? <p className="admin-muted">Aucune commande.</p> : list.map(o => <article key={o.id} className="admin-card admin-order">
      <div className="admin-order-head"><div><strong>#{o.id.slice(0, 8).toUpperCase()}</strong><span className="admin-muted"> · {new Date(o.created_at).toLocaleString('fr-MA')}</span></div>
        <select value={o.status} onChange={e => setStatus(o.id, e.target.value)}>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <p><strong>{o.customer_name}</strong> · <a href={`tel:${o.phone}`}>{o.phone}</a> · {o.city}</p><p className="admin-muted">{o.address}</p>
      <ul className="admin-order-items">{(o.items as OrderItem[]).map((i, k) => <li key={k} className="admin-order-item">
        <span className="admin-order-thumb">{thumbOf(i) ? <button type="button" className="admin-order-thumb-btn" onClick={() => setZoom({ src: thumbOf(i), name: i.name, productId: i.productId })} title="Agrandir la photo" aria-label={`Agrandir la photo de ${i.name}`}><img src={thumbOf(i)} alt={i.name} /></button> : <span aria-hidden="true">{i.name.slice(0, 1).toUpperCase()}</span>}</span>
        <span className="admin-order-item-text"><strong>{i.quantity} × {i.name}</strong><span className="admin-muted">({i.sku}) — taille {i.size} — {money(i.price * i.quantity)}</span></span>
      </li>)}</ul>
      <p className="admin-total">Total : {money(Number(o.total))}</p>
      <div className="admin-row"><Button variant="tool" onClick={() => removeOrder(o.id)}>Supprimer la commande</Button></div>
    </article>)}
    {zoom && <div className="admin-lightbox" role="dialog" aria-modal="true" aria-label={`Photo de ${zoom.name}`} onClick={() => setZoom(null)}>
      <div className="admin-lightbox-box" onClick={e => e.stopPropagation()}>
        <button type="button" className="admin-lightbox-close" onClick={() => setZoom(null)} aria-label="Fermer la photo">×</button>
        <img src={zoom.src} alt={zoom.name} />
        <div className="admin-lightbox-cap"><strong>{zoom.name}</strong>{products.some(p => p.id === zoom.productId) && <Link to="/produit/$id" params={{ id: zoom.productId }} target="_blank" rel="noreferrer">Voir la fiche produit</Link>}</div>
      </div>
    </div>}
  </section>;
}

const empty = { id: '', sku: '', name: '', category: 'Bagues', price: 0, sale_price: null as number | null, description: '', detail: '', material: '', cut: '', images: [] as string[], color: '', color_token: 'noire', sizes: [...allSizes] as string[], available: true, active: true, label: '', sort_order: 0, featured: false, featured_order: 0 };
const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Products({ products, reload }: { products: ProductRow[]; reload: () => void }) {
  const [edit, setEdit] = useState<typeof empty | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const fallbackCategories = ['Bagues', 'Colliers', 'Bracelets', 'Boucles d’oreilles'];
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  useEffect(() => {
    supabase.from('categories').select('name').order('sort_order').then(({ data }) => {
      const names = (data ?? []).map(c => c.name).filter(Boolean);
      if (names.length) setCategories(names);
    });
  }, []);
  // La catégorie d'un produit existant reste sélectionnable même si la collection a été retirée.
  const categoryOptions = edit && edit.category && !categories.includes(edit.category) ? [edit.category, ...categories] : categories;

  async function upload(files: FileList | null) {
    if (!files || !edit) return; setBusy(true); setMsg('');
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}.${file.name.split('.').pop() ?? 'jpg'}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type });
      if (error) { setMsg('Échec de l’envoi d’une image.'); continue; }
      const { data } = await supabase.storage.from('product-images').createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (data?.signedUrl) urls.push(data.signedUrl);
      else setMsg('La photo a été envoyée, mais son accès est indisponible. Réessayez.');
    }
    setEdit(e => e && { ...e, images: [...e.images, ...urls] }); setBusy(false);
  }
  async function save(ev: FormEvent) {
    ev.preventDefault(); if (!edit) return; setBusy(true); setMsg('');
    const { created_at: _c, updated_at: _u, stock: _s, ...clean } = edit as typeof edit & { created_at?: string; updated_at?: string; stock?: number | null };
    const row = { ...clean, id: edit.id || slug(edit.name) || crypto.randomUUID(), price: Number(edit.price), sale_price: edit.sale_price ? Number(edit.sale_price) : null, sort_order: Number(edit.sort_order) };
    const { error } = isNew ? await supabase.from('products').insert(row) : await supabase.from('products').update(row).eq('id', edit.id);
    setBusy(false);
    if (error) { setMsg(error.code === '23505' ? 'Ce SKU ou cet identifiant existe déjà.' : 'Enregistrement impossible.'); return; }
    setEdit(null); reload();
  }
  async function remove(id: string) { if (!confirm('Supprimer ce produit ?')) return; await supabase.from('products').delete().eq('id', id); reload(); }
  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setEdit(e => e && { ...e, [k]: v });
  function positionImage(from: number, to: number) {
    setEdit(e => {
      if (!e || to < 0 || to >= e.images.length) return e;
      const images = [...e.images];
      const moved = images.splice(from, 1)[0];
      if (!moved) return e;
      images.splice(to, 0, moved);
      return { ...e, images };
    });
  }

  if (edit) return <section className="admin-section"><form className="admin-card admin-form" onSubmit={save}>
    <h2>{isNew ? 'Nouveau produit' : `Modifier ${edit.name}`}</h2>
    <div className="admin-grid">
      <label>Nom<input required value={edit.name} onChange={e => set('name', e.target.value)} /></label>
      <label>SKU<input required value={edit.sku} onChange={e => set('sku', e.target.value)} placeholder="JJ-005" /></label>
      <label>Catégorie<select value={edit.category} onChange={e => set('category', e.target.value)}>{categoryOptions.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Étiquette<input value={edit.label} onChange={e => set('label', e.target.value)} placeholder="Pièce signature" /></label>
      <label>Prix (DH)<input required type="number" min={0} value={edit.price} onChange={e => set('price', Number(e.target.value))} /></label>
      <label>Prix promo (DH)<input type="number" min={0} value={edit.sale_price ?? ''} onChange={e => set('sale_price', e.target.value ? Number(e.target.value) : null)} /></label>
      <label>Couleur<input value={edit.color} onChange={e => set('color', e.target.value)} /></label>
      <label>Pastille couleur<select value={edit.color_token} onChange={e => set('color_token', e.target.value)}>{tokens.map(t => <option key={t}>{t}</option>)}</select></label>
      <label>Matière<input value={edit.material} onChange={e => set('material', e.target.value)} /></label>
      <label>Design<input value={edit.cut} onChange={e => set('cut', e.target.value)} /></label>
      <label>Ordre d’affichage<input type="number" value={edit.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></label>
      <fieldset><legend>Tailles</legend>{allSizes.map(s => <label key={s} className="admin-check"><input type="checkbox" checked={edit.sizes.includes(s)} onChange={e => set('sizes', e.target.checked ? [...edit.sizes, s] : edit.sizes.filter(x => x !== s))} />{s}</label>)}</fieldset>
    </div>
    <label>Description courte<input value={edit.description} onChange={e => set('description', e.target.value)} /></label>
    <label>Description détaillée<textarea rows={4} value={edit.detail} onChange={e => set('detail', e.target.value)} /></label>
    <div className="admin-row"><label className="admin-check"><input type="checkbox" checked={edit.available} onChange={e => set('available', e.target.checked)} />Disponible</label><label className="admin-check"><input type="checkbox" checked={edit.active} onChange={e => set('active', e.target.checked)} />Visible sur le site</label><label className="admin-check"><input type="checkbox" checked={edit.featured} onChange={e => set('featured', e.target.checked)} />Afficher sur la page d’accueil</label><label>Ordre accueil<input type="number" value={edit.featured_order} onChange={e => set('featured_order', Number(e.target.value))} style={{ width: 70 }} /></label></div>
    <div><span className="eyebrow">Galerie du produit</span><div className="admin-images">{edit.images.map((src, i) => <div key={`${src}-${i}`} className="admin-gallery-item"><img src={src} alt={`Photo ${i + 1}`} /><span className="admin-image-role">{i === 0 ? 'Principale' : i === 1 ? 'Survol' : `Galerie ${i + 1}`}</span><div className="admin-image-tools">
      <Button variant="tool" type="button" disabled={busy || i === 0} onClick={() => positionImage(i, 0)} title="Photo principale" aria-label={`Définir la photo ${i + 1} comme principale`}><Image size={15}/></Button>
      <Button variant="tool" type="button" disabled={busy || i === 0 || i === 1} onClick={() => positionImage(i, 1)} title="Photo au survol" aria-label={`Définir la photo ${i + 1} au survol`}><Layers size={15}/></Button>
      <Button variant="tool" type="button" disabled={busy || i === 0} onClick={() => positionImage(i, i - 1)} title="Déplacer avant" aria-label={`Déplacer la photo ${i + 1} avant`}><ArrowLeft size={15}/></Button>
      <Button variant="tool" type="button" disabled={busy || i === edit.images.length - 1} onClick={() => positionImage(i, i + 1)} title="Déplacer après" aria-label={`Déplacer la photo ${i + 1} après`}><ArrowRight size={15}/></Button>
      <Button variant="tool" type="button" disabled={busy} onClick={() => set('images', edit.images.filter((_, k) => k !== i))} title="Retirer la photo" aria-label={`Retirer la photo ${i + 1}`}><Trash2 size={15}/></Button>
    </div></div>)}</div>
      <label>Ajouter des photos<input type="file" accept="image/*" multiple onChange={e => upload(e.target.files)} disabled={busy} /></label></div>
    {msg && <p className="admin-msg">{msg}</p>}
    <div className="admin-row"><Button variant="couture" type="submit" disabled={busy || edit.images.length === 0}>{busy ? 'PATIENTEZ…' : 'ENREGISTRER'}</Button><Button variant="coutureOutline" type="button" onClick={() => setEdit(null)}>ANNULER</Button></div>
  </form></section>;

  return <section className="admin-section">
    <div className="admin-row"><Button variant="couture" onClick={() => { setIsNew(true); setEdit({ ...empty, category: categories[0] ?? empty.category, sizes: [...allSizes], sort_order: products.length + 1 }); setMsg(''); }}>+ AJOUTER UN PRODUIT</Button></div>
    <div className="admin-products">{products.map(p => <article key={p.id} className="admin-card admin-product">
      <img src={p.images[0]} alt={p.name} /><div><strong>{p.name}</strong><p className="admin-muted">{p.sku} · {p.category} · {money(Number(p.sale_price ?? p.price))}</p><p className="admin-muted">{p.active ? 'Visible' : 'Masqué'}{p.featured ? ' · Accueil' : ''} · {p.available ? 'Disponible' : 'Indisponible'}</p>
        <div className="admin-row"><Button variant="coutureOutline" onClick={() => { setIsNew(false); setEdit({ ...p, price: Number(p.price), sale_price: p.sale_price == null ? null : Number(p.sale_price) }); setMsg(''); }}>MODIFIER</Button><Button variant="tool" onClick={() => remove(p.id)}>Supprimer</Button></div></div>
    </article>)}</div>
  </section>;
}
