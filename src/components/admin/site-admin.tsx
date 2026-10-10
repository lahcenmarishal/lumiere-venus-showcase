import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import type { ProductRow } from '@/lib/products';
import type { Database } from '@/integrations/supabase/types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type TestimonialRow = Database['public']['Tables']['testimonials']['Row'];

async function uploadBlob(blob: Blob, ext: string) {
  const path = `site/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, blob, { contentType: blob.type });
  if (error) return null;
  const { data } = await supabase.storage.from('product-images').createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  return data?.signedUrl ?? null;
}

/* ---------- Homepage selection ---------- */
export function FeaturedAdmin({ products, reload }: { products: ProductRow[]; reload: () => void }) {
  const featured = products.filter(p => p.featured).sort((a, b) => a.featured_order - b.featured_order);
  const others = products.filter(p => !p.featured && p.active);
  const [q, setQ] = useState('');
  async function setList(ids: string[]) {
    await Promise.all(ids.map((id, i) => supabase.from('products').update({ featured: true, featured_order: i + 1 }).eq('id', id)));
    reload();
  }
  async function remove(id: string) { await supabase.from('products').update({ featured: false }).eq('id', id); reload(); }
  function move(i: number, d: number) { const ids = featured.map(p => p.id); const j = i + d; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j]!, ids[i]!]; setList(ids); }
  return <section className="admin-section">
    <div className="admin-card"><h2>Sélection de la page d’accueil ({featured.length}/8)</h2><p className="admin-muted">Entre 4 et 8 bijoux recommandés. Si aucun n’est choisi, la section est masquée.</p>
      {featured.length === 0 ? <p className="admin-muted">Aucun produit sélectionné.</p> : <ol className="admin-sortable">{featured.map((p, i) => <li key={p.id}><img src={p.images[0]} alt=""/><span>{p.name}</span>
        <Button variant="tool" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</Button><Button variant="tool" onClick={() => move(i, 1)} disabled={i === featured.length - 1} aria-label="Descendre">↓</Button><Button variant="tool" onClick={() => remove(p.id)}>Retirer</Button></li>)}</ol>}
    </div>
    <div className="admin-card"><h2>Ajouter à la sélection</h2><input className="admin-search" placeholder="Rechercher un bijou…" value={q} onChange={e => setQ(e.target.value)}/>
      <div className="admin-pick">{others.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 40).map(p => <button key={p.id} type="button" disabled={featured.length >= 8} onClick={() => setList([...featured.map(f => f.id), p.id])}><img src={p.images[0]} alt=""/><span>{p.name}</span></button>)}</div>
    </div>
  </section>;
}

/* ---------- Categories ---------- */
export function CategoriesAdmin() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [msg, setMsg] = useState('');
  const load = () => supabase.from('categories').select('*').order('sort_order').then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  const set = (slug: string, patch: Partial<CategoryRow>) => setRows(r => r.map(c => c.slug === slug ? { ...c, ...patch } : c));
  async function save(c: CategoryRow) { const { error } = await supabase.from('categories').upsert(c); setMsg(error ? 'Enregistrement impossible.' : `« ${c.name} » enregistrée.`); load(); }
  async function remove(slug: string) { if (!confirm('Supprimer cette collection ? Les produits ne sont pas supprimés.')) return; await supabase.from('categories').delete().eq('slug', slug); load(); }
  async function image(c: CategoryRow, f: File | undefined) { if (!f) return; const url = await uploadBlob(f, f.name.split('.').pop() ?? 'jpg'); if (url) set(c.slug, { image: url }); }
  function add() { const name = prompt('Nom de la nouvelle collection (doit correspondre à la catégorie des produits) :'); if (!name) return; const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); setRows(r => [...r, { slug, name, intro: '', image: '', sort_order: r.length + 1, active: true, created_at: new Date().toISOString() }]); }
  return <section className="admin-section">
    <div className="admin-row"><Button variant="couture" onClick={add}>+ NOUVELLE COLLECTION</Button>{msg && <span className="admin-msg">{msg}</span>}</div>
    {rows.map(c => <div key={c.slug} className="admin-card admin-form">
      <div className="admin-product">{c.image && <img src={c.image} alt=""/>}<div className="admin-grid" style={{ flex: 1 }}>
        <label>Nom<input value={c.name} onChange={e => set(c.slug, { name: e.target.value })}/></label>
        <label>Ordre<input type="number" value={c.sort_order} onChange={e => set(c.slug, { sort_order: Number(e.target.value) })}/></label>
        <label>Image<input type="file" accept="image/*" onChange={e => image(c, e.target.files?.[0])}/></label>
      </div></div>
      <label>Présentation<textarea rows={2} value={c.intro} onChange={e => set(c.slug, { intro: e.target.value })}/></label>
      <div className="admin-row"><label className="admin-check"><input type="checkbox" checked={c.active} onChange={e => set(c.slug, { active: e.target.checked })}/>Visible</label><span className="admin-muted">Adresse : /collections/{c.slug}</span>
        <Button variant="coutureOutline" onClick={() => save(c)}>ENREGISTRER</Button><Button variant="tool" onClick={() => remove(c.slug)}>Supprimer</Button></div>
    </div>)}
  </section>;
}

/* ---------- Testimonials with privacy masking ---------- */
function MaskEditor({ file, onDone, onCancel }: { file: File; onDone: (b: Blob) => void; onCancel: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rects, setRects] = useState<[number, number, number, number][]>([]);
  const start = useRef<[number, number] | null>(null);
  useEffect(() => { const i = new Image(); i.onload = () => setImg(i); i.src = URL.createObjectURL(file); }, [file]);
  useEffect(() => {
    const c = canvas.current; if (!c || !img) return;
    const scale = Math.min(1, 1200 / img.width); c.width = img.width * scale; c.height = img.height * scale;
    const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0, c.width, c.height); ctx.fillStyle = '#111';
    rects.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
  }, [img, rects]);
  const pos = (e: React.PointerEvent): [number, number] => { const c = canvas.current!; const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
  return <div className="admin-card admin-form"><h2>Masquer les informations personnelles</h2><p className="admin-muted">Tracez des rectangles sur les noms, numéros et photos de profil pour les masquer.</p>
    <canvas ref={canvas} className="admin-mask-canvas" onPointerDown={e => { start.current = pos(e); }} onPointerUp={e => { if (!start.current) return; const [x0, y0] = start.current; const [x1, y1] = pos(e); start.current = null; if (Math.abs(x1 - x0) > 4 && Math.abs(y1 - y0) > 4) setRects(r => [...r, [Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)]]); }}/>
    <div className="admin-row"><Button variant="tool" onClick={() => setRects(r => r.slice(0, -1))} disabled={!rects.length}>Annuler le dernier masque</Button>
      <Button variant="couture" onClick={() => canvas.current?.toBlob(b => b && onDone(b), 'image/webp', 0.82)}>ENREGISTRER L’AVIS</Button><Button variant="coutureOutline" onClick={onCancel}>ANNULER</Button></div>
  </div>;
}

export function TestimonialsAdmin() {
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [queue, setQueue] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const load = () => supabase.from('testimonials').select('*').order('sort_order').order('created_at').then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  async function saveMasked(b: Blob) {
    setBusy(true); const url = await uploadBlob(b, 'webp');
    if (url) await supabase.from('testimonials').insert({ image: url, sort_order: rows.length + 1, published: false });
    setQueue(q => q.slice(1)); setBusy(false); load();
  }
  async function update(id: string, patch: Partial<TestimonialRow>) { await supabase.from('testimonials').update(patch).eq('id', id); load(); }
  async function remove(id: string) { if (!confirm('Supprimer cet avis ?')) return; await supabase.from('testimonials').delete().eq('id', id); load(); }
  async function move(i: number, d: number) { const j = i + d; if (j < 0 || j >= rows.length) return; await Promise.all([supabase.from('testimonials').update({ sort_order: j + 1 }).eq('id', rows[i]!.id), supabase.from('testimonials').update({ sort_order: i + 1 }).eq('id', rows[j]!.id)]); load(); }
  if (queue[0]) return <section className="admin-section"><MaskEditor key={queue[0].name + queue.length} file={queue[0]} onDone={saveMasked} onCancel={() => setQueue(q => q.slice(1))}/>{busy && <p className="admin-muted">Envoi…</p>}</section>;
  return <section className="admin-section">
    <div className="admin-card"><h2>Ajouter des captures d’avis</h2><p className="admin-muted">Uniquement de vrais retours clients. Chaque image passe par l’outil de masquage puis reste non publiée jusqu’à votre validation.</p><input type="file" accept="image/*" multiple onChange={e => setQueue(Array.from(e.target.files ?? []))}/></div>
    {rows.length === 0 ? <p className="admin-muted">Aucun avis pour le moment. La section est masquée sur le site.</p> : <div className="admin-products">{rows.map((t, i) => <article key={t.id} className="admin-card admin-product"><img src={t.image} alt=""/><div style={{ flex: 1 }}>
      <input placeholder="Légende (facultative)" defaultValue={t.caption} onBlur={e => e.target.value !== t.caption && update(t.id, { caption: e.target.value })} style={{ width: '100%' }}/>
      <p className="admin-muted">{t.published ? 'Publié' : 'Non publié'}</p>
      <div className="admin-row"><Button variant="coutureOutline" onClick={() => update(t.id, { published: !t.published })}>{t.published ? 'DÉPUBLIER' : 'PUBLIER'}</Button><Button variant="tool" onClick={() => move(i, -1)} aria-label="Monter">↑</Button><Button variant="tool" onClick={() => move(i, 1)} aria-label="Descendre">↓</Button><Button variant="tool" onClick={() => remove(t.id)}>Supprimer</Button></div>
    </div></article>)}</div>}
  </section>;
}

/* ---------- Brand content ---------- */
const fields: [string, string, boolean][] = [
  ['brand_since', 'Année de création', false], ['brand_clients', 'Nombre de clientes satisfaites', false],
  ['brand_intro', 'Présentation (page d’accueil)', true], ['about_story', 'Notre histoire (À propos)', true], ['about_vision', 'Notre vision (À propos)', true],
  ['contact_whatsapp', 'Numéro WhatsApp (format 2126XXXXXXXX)', false], ['contact_hours', 'Horaires (Contact)', false],
];
export function ContentAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  useEffect(() => { supabase.from('site_content').select('key,value').then(({ data }) => setValues(Object.fromEntries((data ?? []).map(r => [r.key, r.value])))); }, []);
  async function save() { const { error } = await supabase.from('site_content').upsert(fields.map(([k]) => ({ key: k, value: values[k] ?? '', updated_at: new Date().toISOString() }))); setMsg(error ? 'Enregistrement impossible.' : 'Contenus enregistrés.'); }
  return <section className="admin-section"><div className="admin-card admin-form"><h2>Contenus de la marque</h2>
    {fields.map(([k, l, long]) => <label key={k}>{l}{long ? <textarea rows={3} value={values[k] ?? ''} onChange={e => setValues(v => ({ ...v, [k]: e.target.value }))}/> : <input value={values[k] ?? ''} onChange={e => setValues(v => ({ ...v, [k]: e.target.value }))}/>}</label>)}
    <div className="admin-row"><Button variant="couture" onClick={save}>ENREGISTRER</Button>{msg && <span className="admin-msg">{msg}</span>}</div>
  </div></section>;
}
