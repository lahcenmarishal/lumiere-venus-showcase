import { describe, expect, it } from 'vitest';
import * as catalog from '@/data/catalog';
describe('Livraison sans frais affichés', () => {
  it('n’affiche aucun frais de livraison forfaitaire', () => { expect('deliveryFee' in catalog).toBe(false); });
});
