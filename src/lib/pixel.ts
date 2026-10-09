export const META_PIXEL_ID = '983274054033136';
type Fbq = (...args: unknown[]) => void;
export function trackPurchase(value: number, contentIds: string[]) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  fbq?.('track', 'Purchase', { value, currency: 'MAD', content_ids: contentIds, content_type: 'product' });
}
