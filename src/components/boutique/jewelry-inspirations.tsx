import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WhatsAppIcon, openWhatsAppPiece } from '@/components/boutique/commerce-dialogs';
import ring from '@/assets/jamila-ring.jpg';
import necklace from '@/assets/jamila-necklace.jpg';
import earrings from '@/assets/jamila-earrings.jpg';

const inspirations = [
  { name: 'Éclat Solitaire', category: 'Bagues', image: ring, description: 'Une silhouette précieuse, un éclat intemporel.' },
  { name: 'Lumière de Soie', category: 'Colliers', image: necklace, description: 'Un pendentif délicat pour illuminer chaque instant.' },
  { name: 'Gouttes de Lumière', category: 'Boucles d’oreilles', image: earrings, description: 'Des lignes élégantes, une présence lumineuse.' },
];

type Inspiration = (typeof inspirations)[number];

export function JewelryInspirations({ filter, onContact }: { filter: string; onContact: () => void }) {
  const [openName, setOpenName] = useState<string | null>(null);
  const selected = inspirations.find(piece => piece.name === openName) ?? null;
  function ask(piece: Inspiration) { if (!openWhatsAppPiece(piece.name)) onContact(); }
  const visible = inspirations.filter(piece => filter === 'Tous les bijoux' || piece.category === filter);
  return <>
    <div className="product-grid inspiration-grid">{visible.map(piece => <article key={piece.name}>
      <div className="product-photo"><Button variant="tool" className="photo-trigger" aria-label={`Voir ${piece.name}`} onClick={() => setOpenName(piece.name)}><img src={piece.image} alt={`${piece.name} — inspiration de bijou générée`} loading="lazy" width={1024} height={1280}/></Button><span className="product-tag">{piece.category}</span></div>
      <div className="product-caption"><h3>{piece.name}</h3></div><p className="product-desc">{piece.description}</p>
      <div className="product-actions"><Button variant="coutureOutline" onClick={() => setOpenName(piece.name)}>VOIR LES DÉTAILS <ArrowUpRight size={12}/></Button><Button variant="couture" onClick={() => ask(piece)}>COMMANDER</Button></div>
    </article>)}</div>
    <p className="catalog-note">Visuels d’inspiration générés · Modèles illustratifs, non proposés à la vente. La collection et les prix seront confirmés par la maison.</p>
    <Dialog open={!!selected} onOpenChange={value => { if (!value) setOpenName(null); }}><DialogContent className="boutique-dialog small-dialog inspiration-dialog">
      <DialogTitle>{selected?.name}</DialogTitle><DialogDescription className="sr-only">Détails de l’inspiration JAMILA JEWELRY</DialogDescription>
      {selected && <div className="inspiration-detail">
        <img src={selected.image} alt={`${selected.name} — inspiration de bijou générée`} width={1024} height={1280}/>
        <span className="eyebrow text-primary">{selected.category}</span>
        <p className="detail-description">{selected.description}</p>
        <p className="detail-note">Visuel d’inspiration généré · modèle illustratif, non proposé à la vente. Dimensions, matières et prix seront confirmés par la maison.</p>
        <div className="detail-cta"><Button variant="couture" onClick={() => ask(selected)}><WhatsAppIcon/> DEMANDER CETTE PIÈCE</Button><Button variant="coutureOutline" onClick={() => { setOpenName(null); onContact(); }}>NOUS CONTACTER</Button></div>
      </div>}
    </DialogContent></Dialog>
  </>;
}
