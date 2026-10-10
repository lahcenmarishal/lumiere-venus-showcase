import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Testimonial } from '@/lib/site.functions';

/** Gallery of real customer-feedback screenshots uploaded from the admin. */
export function TestimonialGallery({ items }: { items: Testimonial[] }) {
  const [open, setOpen] = useState<Testimonial | null>(null);
  if (items.length === 0) return null;
  return <>
    <div className="testimonial-grid">{items.map(t => <button key={t.id} type="button" className="testimonial-card" onClick={() => setOpen(t)} aria-label={`Agrandir l’avis${t.caption ? ` : ${t.caption}` : ''}`}>
      <img src={t.image} alt={t.caption || 'Avis client'} loading="lazy"/>{t.caption && <span>{t.caption}</span>}
    </button>)}</div>
    <Dialog open={!!open} onOpenChange={v => { if (!v) setOpen(null); }}><DialogContent className="boutique-dialog zoom-dialog"><DialogTitle className="sr-only">{open?.caption || 'Avis client'}</DialogTitle><DialogDescription className="sr-only">Capture agrandie</DialogDescription>{open && <img src={open.image} alt={open.caption || 'Avis client'}/>}</DialogContent></Dialog>
  </>;
}
