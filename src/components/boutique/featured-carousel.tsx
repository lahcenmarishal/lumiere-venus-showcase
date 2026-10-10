import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from './catalog';
import type { Product } from '@/data/catalog';

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const [ref, api] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [previous, setPrevious] = useState(false);
  const [next, setNext] = useState(false);
  const sync = useCallback(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    setSnaps(api.scrollSnapList());
    setPrevious(api.canScrollPrev());
    setNext(api.canScrollNext());
  }, [api]);
  useEffect(() => {
    if (!api) return;
    sync();
    api.on('select', sync).on('reInit', sync);
    return () => { api.off('select', sync).off('reInit', sync); };
  }, [api, sync]);
  return <div className="featured-carousel" role="region" aria-roledescription="carrousel" aria-label="Notre sélection">
    <div className="featured-viewport" ref={ref}><div className="featured-track">
      {products.map((product, i) => <div className="featured-slide" key={product.id} role="group" aria-roledescription="diapositive" aria-label={`${i + 1} sur ${products.length}`}><ProductCard product={product}/></div>)}
    </div></div>
    <div className="featured-controls">
      <span className="featured-counter" aria-live="polite">{String(selected + 1).padStart(2, '0')} <span>/ {String(snaps.length || 1).padStart(2, '0')}</span></span>
      <div className="featured-dots">{snaps.map((_, i) => <Button key={i} variant="tool" className={`featured-dot ${i === selected ? 'active' : ''}`} onClick={() => api?.scrollTo(i)} aria-label={`Aller à la sélection ${i + 1}`} aria-pressed={i === selected}/>)}</div>
      <div className="featured-arrows"><Button variant="coutureOutline" className="featured-arrow" disabled={!previous} onClick={() => api?.scrollPrev()} aria-label="Sélection précédente" title="Précédente"><ArrowLeft/></Button><Button variant="coutureOutline" className="featured-arrow" disabled={!next} onClick={() => api?.scrollNext()} aria-label="Sélection suivante" title="Suivante"><ArrowRight/></Button></div>
    </div>
  </div>;
}