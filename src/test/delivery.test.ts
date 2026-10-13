import { describe, expect, it } from 'vitest';
import { deliveryFee } from '@/data/catalog';
describe('Livraison payante partout au Maroc', () => {
  it('facture des frais de livraison', () => { expect(deliveryFee).toBeGreaterThan(0); });
  it('facture 30 DH de livraison', () => { expect(deliveryFee).toBe(30); });
});
