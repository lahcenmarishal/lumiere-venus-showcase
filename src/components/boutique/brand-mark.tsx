import type { CSSProperties } from 'react';
import logo from '@/assets/jamila-logo.png.asset.json';

const mask = `url(${logo.url})`;

/**
 * The uploaded JAMILA JEWELRY mark, painted with the house gold gradient.
 * The PNG's own alpha channel is used as a mask, so the lettering stays
 * exactly as supplied — only the colour changes.
 */
export function BrandMark({ className = '', label, decorative = false }: { className?: string; label: string; decorative?: boolean }) {
  const style = { WebkitMaskImage: mask, maskImage: mask } as CSSProperties;
  return <span
    role={decorative ? undefined : 'img'}
    aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : label}
    className={`brand-mark${className ? ` ${className}` : ''}`}
    style={style}
  />;
}
