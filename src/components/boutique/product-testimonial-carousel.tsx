import { useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Testimonial } from '@/lib/site.functions';

/** Published shop feedback, shared across products without claiming product-specific reviews. */
export function ProductTestimonialCarousel({ items }: { items: Testimonial[] }) {
  const autoplay = useMemo(() => Autoplay({ delay: 3200, playOnInit: false, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true }), []);
  const [ref, api] = useEmblaCarousel({ align: 'start', loop: items.length > 1 }, [autoplay]);
  const [open, setOpen] = useState<Testimonial | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion:reduce)');
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!api) return;
    if (items.length > 1 && !reduced && !paused && !open) autoplay.play();
    else autoplay.stop();
    return () => autoplay.stop();
  }, [api, autoplay, items.length, reduced, paused, open]);
  if (!items.length) return null;
  return <section className="product-reviews" aria-label="Avis de nos clientes" aria-roledescription="carrousel">
    <div className="product-reviews-heading"><h2>Avis de nos clientes</h2>{items.length > 1 && <div className="product-reviews-controls">
      <Button type="button" variant="tool" aria-label="Avis précédent" title="Avis précédent" onClick={() => api?.scrollPrev()}><ArrowLeft size={15}/></Button>
      {!reduced && <Button type="button" variant="tool" aria-label={paused ? 'Reprendre le défilement des avis' : 'Mettre les avis en pause'} title={paused ? 'Reprendre' : 'Pause'} onClick={() => setPaused(v => !v)}>{paused ? <Play size={14}/> : <Pause size={14}/>}</Button>}
      <Button type="button" variant="tool" aria-label="Avis suivant" title="Avis suivant" onClick={() => api?.scrollNext()}><ArrowRight size={15}/></Button>
    </div>}</div>
    <div className="product-reviews-viewport" ref={ref}><div className="product-reviews-track">{items.map((item, index) => <div className="product-review-slide" key={item.id} role="group" aria-roledescription="diapositive" aria-label={`${index + 1} sur ${items.length}`}>
      <Button type="button" variant="tool" className="product-review-image" aria-label={`Agrandir l’avis ${index + 1}${item.caption ? ` : ${item.caption}` : ''}`} onClick={() => setOpen(item)}><img src={item.image} alt={item.caption || 'Capture d’un avis client'} loading="lazy"/></Button>
    </div>)}</div></div>
    <Dialog open={open != null} onOpenChange={v => { if (!v) setOpen(null); }}><DialogContent className="boutique-dialog zoom-dialog"><DialogTitle className="sr-only">{open?.caption || 'Avis client'}</DialogTitle><DialogDescription className="sr-only">Capture agrandie de l’avis client</DialogDescription>{open && <img src={open.image} alt={open.caption || 'Avis client'}/>}</DialogContent></Dialog>
  </section>;
}
