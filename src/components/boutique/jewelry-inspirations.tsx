import ring from '@/assets/jamila-ring.jpg';
import necklace from '@/assets/jamila-necklace.jpg';
import earrings from '@/assets/jamila-earrings.jpg';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const inspirations = [
  { name: 'Éclat Solitaire', category: 'Bagues', image: ring, description: 'Une silhouette précieuse, un éclat intemporel.' },
  { name: 'Lumière de Soie', category: 'Colliers', image: necklace, description: 'Un pendentif délicat pour illuminer chaque instant.' },
  { name: 'Gouttes de Lumière', category: 'Boucles d’oreilles', image: earrings, description: 'Des lignes élégantes, une présence lumineuse.' },
];

export function JewelryInspirations({ filter, onContact }: { filter: string; onContact: () => void }) {
  return <><div className="product-grid inspiration-grid">{inspirations.filter(piece => filter === 'Tous les bijoux' || piece.category === filter).map(piece => <article key={piece.name}>
    <div className="product-photo"><img src={piece.image} alt={`${piece.name} — inspiration de bijou générée`} loading="lazy" width={1024} height={1280}/><span className="product-tag">{piece.category}</span></div>
    <div className="product-caption"><h3>{piece.name}</h3></div><p className="product-desc">{piece.description}</p>
    <div className="product-actions"><Button variant="coutureOutline" onClick={onContact}>NOUS CONTACTER <ArrowUpRight size={12}/></Button></div>
  </article>)}</div><p className="catalog-note">Visuels d’inspiration générés · Modèles illustratifs, non proposés à la vente. La collection et les prix seront confirmés par la maison.</p></>;
}