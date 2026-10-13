import { describe, expect, it } from 'vitest';
import { deliveryFee } from '@/data/catalog';
describe('Livraison partout au Maroc', () => {
  it('ne facture aucun frais de livraison', () => { expect(deliveryFee).toBe(0); });
});
