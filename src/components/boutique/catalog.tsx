import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money, unitPrice, type Product } from '@/data/catalog';

export function ProductCard({ product }: { product: Product }) {
  return <article>
    <div className={`product-photo ${product.images[1] ? 'has-hover' : ''}`}><Link to="/produit/$id" params={{ id: product.id }} className="photo-trigger" aria-label={`Voir ${product.name}`}><img className="product-primary-image" src={product.images[0]} alt={product.name} loading="lazy" width={600} height={600}/>{product.images[1] && <img className="product-hover-image" src={product.images[1]} alt="" aria-hidden="true" loading="lazy" width={600} height={600}/>}</Link>{product.label && <span className="product-tag">{product.label}</span>}</div>
    <div className="product-caption"><h3>{product.name}</h3><span className="product-price">{money(unitPrice(product))}</span></div>
    <p className="product-desc">{product.description}</p>
    <div className="product-actions">
      <Button variant="coutureOutline" asChild><Link to="/produit/$id" params={{ id: product.id }}>VOIR LES DÉTAILS <ArrowUpRight size={12}/></Link></Button>
      <Button variant="couture" asChild><Link to="/produit/$id" params={{ id: product.id }}>COMMANDER</Link></Button>
    </div>
  </article>;
}

const priceRanges = [
  { key: 'all', label: 'Tous les prix', test: () => true },
  { key: 'u100', label: 'Moins de 100 DH', test: (p: number) => p < 100 },
  { key: '100-300', label: '100 – 300 DH', test: (p: number) => p >= 100 && p <= 300 },
  { key: 'o300', label: 'Plus de 300 DH', test: (p: number) => p > 300 },
];
const PAGE = 12;

/** Filterable, sortable product grid used by the shop and collection pages. */
export function ProductCatalog({ products, categories }: { products: Product[]; categories?: string[] }) {
  const [cat, setCat] = useState('all');
  const [price, setPrice] = useState('all');
  const [stone, setStone] = useState('all');
  const [sort, setSort] = useState('new');
  const [shown, setShown] = useState(PAGE);
  const list = useMemo(() => {
    const range = priceRanges.find(r => r.key === price) ?? priceRanges[0];
    const kw = stone === 'perle' ? /perl|nacr/i : stone === 'strass' ? /strass|zircon|serti|cristal|pav/i : stone === 'couleur' ? /vert|émeraude|noir|onyx|émail/i : null;
    const out = products.filter(p => (cat === 'all' || p.category === cat) && (!range || range.test(unitPrice(p))) && (!kw || kw.test(`${p.name} ${p.description}`)));
    return [...out].sort((a, b) => sort === 'asc' ? unitPrice(a) - unitPrice(b) : sort === 'desc' ? unitPrice(b) - unitPrice(a) : sort === 'popular' ? Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder : b.sortOrder - a.sortOrder);
  }, [products, cat, price, stone, sort]);
  const reset = (f: () => void) => { f(); setShown(PAGE); };
  return <>
    <div className="catalog-toolbar">
      {categories && <label>Catégorie<select value={cat} onChange={e => reset(() => setCat(e.target.value))}><option value="all">Toutes</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>}
      <label>Prix<select value={price} onChange={e => reset(() => setPrice(e.target.value))}>{priceRanges.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</select></label>
      <label>Style<select value={stone} onChange={e => reset(() => setStone(e.target.value))}><option value="all">Tous les styles</option><option value="perle">Perles & nacre</option><option value="strass">Strass & zircons</option><option value="couleur">Pierres & émail colorés</option></select></label>
      <label>Trier<select value={sort} onChange={e => setSort(e.target.value)}><option value="new">Nouveautés</option><option value="popular">Populaires</option><option value="asc">Prix croissant</option><option value="desc">Prix décroissant</option></select></label>
      <span className="catalog-count">{list.length} pièce{list.length > 1 ? 's' : ''}</span>
    </div>
    {list.length === 0 ? <p className="catalog-empty">Aucun bijou ne correspond à ces filtres.</p> : <div className="product-grid">{list.slice(0, shown).map(p => <ProductCard key={p.id} product={p}/>)}</div>}
    {shown < list.length && <div className="catalog-more"><Button variant="coutureOutline" onClick={() => setShown(s => s + PAGE)}>VOIR PLUS DE BIJOUX</Button></div>}
  </>;
}
